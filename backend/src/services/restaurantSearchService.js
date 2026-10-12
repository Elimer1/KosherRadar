// NEW (Milestone 4): the public restaurant search (spec section 8): name / food search, filters, location, paging.
// חדש (אבן דרך 4): החיפוש הציבורי: חיפוש שם/אוכל, מסננים, מיקום ועימוד.
//
// How a search works:
//   1. The database finds APPROVED restaurants that match the text, food type, category and radius.
//   2. The public certificates of those restaurants are loaded in one query.
//   3. kashrutStatusService decides each restaurant's status and the kashrut filters (the same code the detail page uses).
//   4. Results are sorted (nearest first with a location, else relevance, else A-Z) and cut into pages of 20.
// Kashrut status depends on dates and on another collection, so steps 3-4 run in the service. At most
// MAX_SEARCH_CANDIDATES restaurants are examined; the answer says `capped: true` when that limit was reached.
// סטטוס הכשרות תלוי בתאריכים ובאוסף אחר, לכן שלבים 3-4 רצים בשירות. נבדקות לכל היותר MAX_SEARCH_CANDIDATES
// מסעדות; התשובה מציינת capped: true כשהגענו למגבלה.
import { env } from '../config/env.js';
import {
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
    return { hits: [], atlasUnavailable: false };
  }

  try {
    const hits = await findAtlasNameHitsRepo({ text: parsed.normalized, indexName: env.atlasSearchIndex });
    return { hits, atlasUnavailable: false };
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
const loadMatches = async ({ query, candidateLimit, bounds }) => {
  const today = todayInIsrael();
  const parsed = parseSearchText(query.q || '');
  const center = query.lat !== undefined && query.lng !== undefined ? { lat: query.lat, lng: query.lng } : null;

  const { hits, atlasUnavailable } = await findAtlasHits(parsed);
  const atlasScores = normalizeAtlasScores(hits);

  const candidates = await findSearchCandidatesRepo({
    words: parsed.words,
    groupsByWord: parsed.groupsByWord,
    extraIds: hits.map((hit) => hit.id),
    foodTypes: query.foodType,
    categories: query.category,
    center,
    radiusKm: query.radiusKm,
    bounds,
    limit: candidateLimit + 1,
  });

  const capped = candidates.length > candidateLimit;
  const examined = capped ? candidates.slice(0, candidateLimit) : candidates;

  const oldestPublicExpiration = dateOnlyToDate(addMonthsToDateOnly(today, -PUBLIC_EXPIRED_MONTHS));
  const teudot = await findPublicTeudotForRestaurantsRepo(
    examined.map((restaurant) => restaurant._id),
    oldestPublicExpiration
  );
  const teudotByRestaurant = groupTeudotByRestaurant(teudot);

  const matches = [];

  for (const restaurant of examined) {
    const id = String(restaurant._id);
    const summary = buildKashrutSummary(restaurant, teudotByRestaurant.get(id) || [], today);
    const view = applyKashrutFilters(summary, {
      hideExpired: query.hideExpired,
      includeUnknown: query.includeUnknown,
      level: query.level,
      hechsherValues: query.hechsher,
    });

    if (!view) {
      continue;
    }

    const hasCoordinates = typeof restaurant.latitude === 'number' && typeof restaurant.longitude === 'number';
    const distanceKm =
      center && hasCoordinates
        ? distanceInKm(center.lat, center.lng, restaurant.latitude, restaurant.longitude)
        : null;

    matches.push({
      restaurant,
      summary: view,
      distanceKm,
      relevance: calculateRelevance(restaurant, parsed, atlasScores.get(id) || 0),
    });
  }

  matches.sort(compareResults(Boolean(center), parsed.words.length > 0));

  return { matches, capped, atlasUnavailable };
};

const searchMode = (atlasUnavailable) => ({
  mode: env.atlasSearchEnabled && !atlasUnavailable ? 'ATLAS' : 'BASIC',
  atlasUnavailable,
});

export const searchRestaurantsService = async (query, pageSize = SEARCH_PAGE_SIZE) => {
  const { matches, capped, atlasUnavailable } = await loadMatches({
    query,
    candidateLimit: MAX_SEARCH_CANDIDATES,
  });

  const start = (query.page - 1) * pageSize;
  const items = matches
    .slice(start, start + pageSize)
    .map((match) => toPublicRestaurantCard(match.restaurant, match.summary, match.distanceKm));

  return {
    items,
    page: query.page,
    pageSize,
    total: matches.length,
    hasMore: start + pageSize < matches.length,
    capped,
    search: searchMode(atlasUnavailable),
  };
};

// NEW (Milestone 5): restaurants inside the visible map, with the same filters as the list.
// Not paged by 20: the map needs every match in view, up to MAP_MARKER_LIMIT.
// חדש (אבן דרך 5): מסעדות בתוך המפה הנראית, עם אותם מסננים כמו הרשימה. לא עמודים של 20.
export const findMapRestaurantsService = async (query) => {
  const { matches, capped, atlasUnavailable } = await loadMatches({
    query,
    candidateLimit: MAP_MARKER_LIMIT,
    bounds: { north: query.north, south: query.south, east: query.east, west: query.west },
  });

  return {
    items: matches.map((match) => toPublicRestaurantCard(match.restaurant, match.summary, match.distanceKm)),
    total: matches.length,
    capped,
    search: searchMode(atlasUnavailable),
  };
};

// NEW (Milestone 4): autocomplete rows. Same search, same filters, first page, only a few rows.
// חדש (אבן דרך 4): שורות השלמה אוטומטית. אותו חיפוש ואותם מסננים, עמוד ראשון, מעט שורות.
export const getRestaurantSuggestionsService = async (query) => {
  const result = await searchRestaurantsService({ ...query, page: 1 }, SUGGESTION_LIMIT);

  return { suggestions: result.items.map((card) => toRestaurantSuggestion(card)) };
};
