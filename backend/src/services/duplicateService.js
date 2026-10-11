import {
  findDuplicateCandidatesRepo,
  findNearbyRestaurantsRepo,
} from '../repositories/restaurantRepository.js';
import { normalizePhone, normalizeText } from '../utils/normalizeText.js';

const NEARBY_RADIUS_METERS = 300;
const MAX_DUPLICATES_STORED = 10;
const MIN_PARTIAL_NAME_LENGTH = 3;

// "pizza" and "pizza hut" count as similar; two unrelated names do not.
export const namesAreSimilar = (nameA, nameB) => {
  if (!nameA || !nameB) {
    return false;
  }

  if (nameA === nameB) {
    return true;
  }

  const [shorter, longer] = nameA.length <= nameB.length ? [nameA, nameB] : [nameB, nameA];
  return shorter.length >= MIN_PARTIAL_NAME_LENGTH && longer.includes(shorter);
};

// How convincing each reason is. Admins see the strongest matches first.
const REASON_PRIORITY = {
  SAME_PLACE_ID: 5,
  SAME_NAME_AND_ADDRESS: 4,
  SAME_PHONE: 3,
  SIMILAR_NAME_NEARBY: 2,
  SAME_ADDRESS: 1,
};

const strongestPriority = (match) =>
  Math.max(...match.reasons.map((reason) => REASON_PRIORITY[reason] || 0));

// Strongest reason first; when equal, the match with more reasons wins.
const compareMatches = (a, b) =>
  strongestPriority(b) - strongestPriority(a) || b.reasons.length - a.reasons.length;

// Rejects null, strings, NaN and values outside the real latitude/longitude ranges.
const hasValidCoordinates = ({ latitude, longitude }) =>
  Number.isFinite(latitude) &&
  Number.isFinite(longitude) &&
  latitude >= -90 &&
  latitude <= 90 &&
  longitude >= -180 &&
  longitude <= 180;

const addReason = (matches, restaurant, reason) => {
  const id = String(restaurant._id);
  const existing = matches.get(id) || { restaurant: restaurant._id, reasons: [] };

  if (!existing.reasons.includes(reason)) {
    existing.reasons.push(reason);
  }

  matches.set(id, existing);
};

// Looks for restaurants that may be the same place. This is only a warning for admins:
// the result is saved on the new restaurant and the submission is never blocked or rejected.
export const findPossibleDuplicatesService = async (candidate) => {
  const nameNormalized = normalizeText(candidate.name);
  const addressNormalized = normalizeText(candidate.address);
  const phoneNormalized = normalizePhone(candidate.phone);
  const hasCoordinates = hasValidCoordinates(candidate);

  const matches = new Map();

  // The two lookups do not depend on each other, so they run together.
  const [exactCandidates, nearby] = await Promise.all([
    findDuplicateCandidatesRepo({
      geoapifyPlaceId: candidate.geoapifyPlaceId,
      phoneNormalized,
      addressNormalized,
    }),
    hasCoordinates
      ? findNearbyRestaurantsRepo({
          latitude: candidate.latitude,
          longitude: candidate.longitude,
          radiusMeters: NEARBY_RADIUS_METERS,
        })
      : [],
  ]);

  for (const existing of exactCandidates) {
    if (candidate.geoapifyPlaceId && existing.geoapifyPlaceId === candidate.geoapifyPlaceId) {
      addReason(matches, existing, 'SAME_PLACE_ID');
    }

    if (phoneNormalized && existing.phoneNormalized === phoneNormalized) {
      addReason(matches, existing, 'SAME_PHONE');
    }

    if (addressNormalized && existing.addressNormalized === addressNormalized) {
      const reason = namesAreSimilar(nameNormalized, existing.nameNormalized)
        ? 'SAME_NAME_AND_ADDRESS'
        : 'SAME_ADDRESS';
      addReason(matches, existing, reason);
    }
  }

  for (const existing of nearby) {
    if (namesAreSimilar(nameNormalized, existing.nameNormalized)) {
      addReason(matches, existing, 'SIMILAR_NAME_NEARBY');
    }
  }

  // Sort first, then cut, so the 10 kept are the strongest ones.
  return [...matches.values()].sort(compareMatches).slice(0, MAX_DUPLICATES_STORED);
};
