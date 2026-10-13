// NEW (Milestone 4): the public restaurant search (spec section 8): name / food search, filters, location, paging.
// חדש (אבן דרך 4): החיפוש הציבורי: חיפוש שם/אוכל, מסננים, מיקום ועימוד.
//
// How a search works:
//   1. The database finds APPROVED restaurants that match the text, food type, category and radius.
//   2. The public certificates of those restaurants are loaded in one query.
//   3. kashrutStatusService decides each restaurant's status and the kashrut filters (the same code the detail page uses).
//   4. Results are sorted (nearest first with a location, else relevance, else A-Z) and cut into pages of 20.
// Kashrut rules stay shared; candidates are evaluated in bounded batches before output limits.
import { env } from '../config/env.js';
import {
  ATLAS_SEARCH_HIT_LIMIT,
  MAP_MARKER_LIMIT,
  MAX_SEARCH_CANDIDATES,
  PUBLIC_EXPIRED_MONTHS,
  SEARCH_PAGE_SIZE,
  SUGGESTION_LIMIT,
} from '../config/constants.js';
import {
  findAtlasNameHitsRepo,
  findPublicTeudotForRestaurantsRepo,
  findSearchCandidatesRepo,
} from '../repositories/restaurantSearchRepository.js';
import { distanceInKm } from '../utils/geo.js';
import { addMonthsToDateOnly, dateOnlyToDate, todayInIsrael } from '../utils/israelDate.js';
import { parseSearchText } from '../utils/searchFields.js';
import { applyKashrutFilters, buildKashrutSummary } from './kashrutStatusService.js';
import { toPublicRestaurantCard, toRestaurantSuggestion } from './publicRestaurantSerializer.js';

const startsSomeWord = (tokens, word) => tokens.some((token) => token.startsWith(word));

// Every typed word starts some word of the restaurant name.
const matchesName = (restaurant, parsed) => {
  const tokens = restaurant.nameTokens || [];
  return parsed.words.length > 0 && parsed.words.every((word) => startsSomeWord(tokens, word));
};

// Every typed word is a food keyword start, or belongs to a synonym group of the restaurant.
const matchesFood = (restaurant, parsed) => {
  const foodTokens = restaurant.foodTokens || [];
  const foodGroups = restaurant.foodGroups || [];

  return (
    parsed.words.length > 0 &&
    parsed.words.every(
      (word, index) =>
        startsSomeWord(foodTokens, word) || parsed.groupsByWord[index].some((group) => foodGroups.includes(group))
    )
  );
};

// Relevance between 0 and about 1: an exact name beats a name that starts with the text, which beats
// words matching the name, which beats a fuzzy Atlas hit, which beats a food-only match.
// רלוונטיות בין 0 לכ-1: שם מדויק > שם שמתחיל בטקסט > מילים שמתאימות לשם > התאמה מקורבת של Atlas > התאמת אוכל בלבד.
export const calculateRelevance = (restaurant, parsed, atlasScore = 0) => {
  if (parsed.words.length === 0) {
    return 0;
  }

  let nameScore = 0;

  if (restaurant.nameNormalized === parsed.normalized) {
    nameScore = 1;
  } else if ((restaurant.nameNormalized || '').startsWith(parsed.normalized)) {
    nameScore = 0.9;
  } else if (matchesName(restaurant, parsed)) {
    nameScore = 0.7;
  }

  const foodScore = matchesFood(restaurant, parsed) ? 0.4 : 0;
  const best = Math.max(nameScore, atlasScore * 0.85, foodScore);

  // A restaurant that matches by name AND by food is slightly better than one that matches only one way.
  return nameScore > 0 && foodScore > 0 ? best + 0.05 : best;
};

// Atlas scores have no fixed scale, so they are divided by the best score of this search (0..1).
const normalizeAtlasScores = (hits) => {
  const bestScore = Math.max(0, ...hits.map((hit) => hit.score));
  const scores = new Map();

  for (const hit of hits) {
    scores.set(hit.id, bestScore > 0 ? hit.score / bestScore : 0);
  }

  return scores;
};

// Atlas Search is optional. When it is off, or fails (not on Atlas, index missing, network), the search
// still works with the "word starts with" matching and the answer reports the degraded mode honestly.
// Atlas Search אופציונלי. כשהוא כבוי או נכשל החיפוש ממשיך לעבוד עם "מילה מתחילה ב", והתשובה מדווחת על כך.
const findAtlasHits = async (parsed) => {
  if (!env.atlasSearchEnabled || parsed.words.length === 0) {
    return { hits: [], atlasUnavailable: false, atlasCapped: false };
  }

  try {
    const hits = await findAtlasNameHitsRepo({ text: parsed.normalized, indexName: env.atlasSearchIndex });
    return { hits: hits.slice(0, ATLAS_SEARCH_HIT_LIMIT), atlasUnavailable: false, atlasCapped: hits.length > ATLAS_SEARCH_HIT_LIMIT };
  } catch (error) {
    console.error('Atlas Search failed, using the basic search instead:', error.message);
    return { hits: [], atlasUnavailable: true };
  }
};

const groupTeudotByRestaurant = (teudot) => {
  const grouped = new Map();

  for (const teuda of teudot) {
    const key = String(teuda.restaurant);
    grouped.set(key, [...(grouped.get(key) || []), teuda]);
  }

  return grouped;
};

// Smaller distance first; a restaurant without coordinates goes last.
const compareDistance = (a, b) => {
  if (a.distanceKm === null || b.distanceKm === null) {
    return a.distanceKm === b.distanceKm ? 0 : a.distanceKm === null ? 1 : -1;
  }

  return a.distanceKm - b.distanceKm;
};

// Stable order: ties are always broken by name and then id, so Load More never repeats or skips a restaurant.
// סדר יציב: שוויון נשבר תמיד לפי שם ואז מזהה, כך ש"טען עוד" לא חוזר ולא מדלג על מסעדה.
const compareResults = (hasCenter, hasText) => (a, b) => {
  if (hasCenter) {
    const byDistance = compareDistance(a, b);
    if (byDistance !== 0) {
      return byDistance;
    }
  }

  if (hasText && a.relevance !== b.relevance) {
    return b.relevance - a.relevance;
  }

  const byName = (a.restaurant.nameNormalized || '').localeCompare(b.restaurant.nameNormalized || '');

  if (byName !== 0) {
    return byName;
  }

  return String(a.restaurant._id).localeCompare(String(b.restaurant._id));
};

// Shared by the list and the map. `bounds` is only set for the map. The kashrut rules stay in this one place.
// משותף לרשימה ולמפה. bounds נשלח רק עבור המפה. חוקי הכשרות נשארים במקום אחד.
const loadMatches = async ({ query, keepCount, bounds }) => {
  const today = todayInIsrael();
  const parsed = parseSearchText(query.q || '');
  const center = query.lat !== undefined && query.lng !== undefined ? { lat: query.lat, lng: query.lng } : null;
  const { hits, atlasUnavailable, atlasCapped } = await findAtlasHits(parsed);
  const atlasScores = normalizeAtlasScores(hits);
  const oldestPublicExpiration = dateOnlyToDate(addMonthsToDateOnly(today, -PUBLIC_EXPIRED_MONTHS));
  const compare = compareResults(Boolean(center), parsed.words.length > 0);
  const matches = [];
  let total = 0;
  let afterId;

  // All candidates are evaluated in bounded keyset batches. Only the best K eligible
  // results survive each batch, bounding memory while preserving the global ranking.
  while (true) {
    const candidates = await findSearchCandidatesRepo({
      words: parsed.words, groupsByWord: parsed.groupsByWord, extraIds: hits.map(hit => hit.id),
      foodTypes: query.foodType, categories: query.category, center, radiusKm: query.radiusKm,
      bounds, limit: MAX_SEARCH_CANDIDATES + 1, afterId,
    });
    const hasNextBatch = candidates.length > MAX_SEARCH_CANDIDATES;
    const examined = candidates.slice(0, MAX_SEARCH_CANDIDATES);
    const teudot = await findPublicTeudotForRestaurantsRepo(examined.map(row => row._id), oldestPublicExpiration);
    const teudotByRestaurant = groupTeudotByRestaurant(teudot);
    for (const restaurant of examined) {
      const id = String(restaurant._id);
      const summary = buildKashrutSummary(restaurant, teudotByRestaurant.get(id) || [], today);
      const view = applyKashrutFilters(summary, {
        hideExpired: query.hideExpired, includeUnknown: query.includeUnknown,
        level: query.level, hechsherValues: query.hechsher,
      });
      if (!view) continue;
      const hasCoordinates = typeof restaurant.latitude === 'number' && typeof restaurant.longitude === 'number';
      const distanceKm = center && hasCoordinates
        ? distanceInKm(center.lat, center.lng, restaurant.latitude, restaurant.longitude) : null;
      total += 1;
      matches.push({ restaurant, summary: view, distanceKm,
        relevance: calculateRelevance(restaurant, parsed, atlasScores.get(id) || 0) });
    }
    matches.sort(compare);
    matches.length = Math.min(matches.length, keepCount);
    if (!hasNextBatch) break;
    afterId = examined.at(-1)._id;
  }
  return { matches, total, capped: Boolean(atlasCapped), atlasUnavailable };
};

const searchMode = (atlasUnavailable) => ({
  mode: env.atlasSearchEnabled && !atlasUnavailable ? 'ATLAS' : 'BASIC', atlasUnavailable,
});

export const searchRestaurantsService = async (query, pageSize = SEARCH_PAGE_SIZE) => {
  const { matches, total, capped, atlasUnavailable } = await loadMatches({ query, keepCount: query.page * pageSize });
  const start = (query.page - 1) * pageSize;
  const items = matches.slice(start, start + pageSize)
    .map(match => toPublicRestaurantCard(match.restaurant, match.summary, match.distanceKm));
  return {
    items, page: query.page, pageSize, total, hasMore: start + pageSize < total, capped,
    completeness: { complete: !capped, reasons: capped ? ['atlas_candidate_limit'] : [] },
    search: searchMode(atlasUnavailable),
  };
};

// Map output is limited only after shared filtering and global ranking.
export const findMapRestaurantsService = async (query) => {
  const { matches, total, capped: atlasCapped, atlasUnavailable } = await loadMatches({
    query, keepCount: MAP_MARKER_LIMIT,
    bounds: { north: query.north, south: query.south, east: query.east, west: query.west },
  });
  const capped = atlasCapped || total > MAP_MARKER_LIMIT;
  return {
    items: matches.map(match => toPublicRestaurantCard(match.restaurant, match.summary, match.distanceKm)),
    total, capped,
    completeness: { complete: !capped, reasons: [
      ...(atlasCapped ? ['atlas_candidate_limit'] : []), ...(total > MAP_MARKER_LIMIT ? ['map_marker_limit'] : []),
    ] },
    search: searchMode(atlasUnavailable),
  };
};

// NEW (Milestone 4): autocomplete rows. Same search, same filters, first page, only a few rows.
// חדש (אבן דרך 4): שורות השלמה אוטומטית. אותו חיפוש ואותם מסננים, עמוד ראשון, מעט שורות.
export const getRestaurantSuggestionsService = async (query) => {
  const result = await searchRestaurantsService({ ...query, page: 1 }, SUGGESTION_LIMIT);

  return { suggestions: result.items.map((card) => toRestaurantSuggestion(card)) };
};
