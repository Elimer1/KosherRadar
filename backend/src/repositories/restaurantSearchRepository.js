// NEW (Milestone 4): database operations behind the public restaurant search. Only APPROVED restaurants are read.
// חדש (אבן דרך 4): פעולות מסד הנתונים של החיפוש הציבורי. נקראות רק מסעדות מאושרות.
import { ATLAS_SEARCH_HIT_LIMIT } from '../config/constants.js';
import { Restaurant } from '../models/Restaurant.js';
import { Teuda } from '../models/Teuda.js';
import { boundsToGeoBox, kmToRadians } from '../utils/geo.js';

// Only what the result cards and the ranking need. Admin-only fields are never selected.
// רק מה שכרטיסי התוצאות והדירוג צריכים. שדות של מנהלים לעולם לא נבחרים.
const SEARCH_FIELDS =
  'name nameHe nameEn nameNormalized address addressHe addressEn city latitude longitude phone ' +
  'foodType categories claimedHechsher claimedHechsherOther claimedKashrutLevel ' +
  'nameTokens foodTokens foodGroups';

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// "starts with" on the stored words. An anchored regex can use the multikey index.
// "מתחיל ב" על המילים השמורות. ביטוי מעוגן (^) יכול להשתמש באינדקס.
const startsWith = (word) => new RegExp(`^${escapeRegex(word)}`);

// Name match: every typed word starts some word of the name.
const buildNameCondition = (words) => ({
  $and: words.map((word) => ({ nameTokens: startsWith(word) })),
});

// Food match: every typed word is a food keyword start, or belongs to a synonym group of the restaurant.
const buildFoodCondition = (words, groupsByWord) => ({
  $and: words.map((word, index) => {
    const groups = groupsByWord[index];

    return groups.length > 0
      ? { $or: [{ foodTokens: startsWith(word) }, { foodGroups: { $in: groups } }] }
      : { foodTokens: startsWith(word) };
  }),
});

// Restaurants that could match, before the kashrut rules are applied. The kashrut rules need the
// certificates, so they run afterwards in the service (one shared implementation, spec section 5).
// מסעדות שיכולות להתאים, לפני חוקי הכשרות. חוקי הכשרות צריכים את התעודות ולכן רצים אחר כך בשירות.
export const findSearchCandidatesRepo = async ({
  words,
  groupsByWord,
  extraIds,
  foodTypes,
  categories,
  center,
  radiusKm,
  bounds,
  limit,
}) => {
  const filter = { status: 'APPROVED' };

  if (foodTypes.length > 0) {
    filter.foodType = { $in: foodTypes };
  }

  if (categories.length > 0) {
    filter.categories = { $in: categories };
  }

  // NEW (Milestone 5): the map asks for the visible rectangle. A chosen radius is applied as well,
  // so markers stay inside both the screen and the radius. Restaurants with no coordinates have no
  // `location`, so both queries leave them out.
  // חדש (אבן דרך 5): המפה מבקשת את המלבן הנראה. רדיוס שנבחר חל גם הוא. למסעדה בלי קואורדינטות אין location.
  const area = [];

  if (bounds) {
    area.push({ location: { $geoWithin: { $box: boundsToGeoBox(bounds) } } });
  }

  if (center && radiusKm) {
    area.push({
      location: { $geoWithin: { $centerSphere: [[center.lng, center.lat], kmToRadians(radiusKm)] } },
    });
  }

  if (area.length === 1) {
    Object.assign(filter, area[0]);
  } else if (area.length > 1) {
    filter.$and = area;
  }

  if (words.length > 0) {
    filter.$or = [buildNameCondition(words), buildFoodCondition(words, groupsByWord)];

    if (extraIds.length > 0) {
      filter.$or.push({ _id: { $in: extraIds } });
    }
  }

  // `limit` is one more than the cap, so the service can tell that the cap was reached.
  return Restaurant.find(filter).select(SEARCH_FIELDS).sort({ name: 1, _id: 1 }).limit(limit).lean();
};

// Atlas Search by name: typo tolerant (fuzzy) and partial (autocomplete). Returns ids with relevance scores.
// It only works on Atlas with the index from ATLAS_SEARCH_SETUP.md; on any other server it throws.
// חיפוש Atlas לפי שם: סובל שגיאות כתיב ומילים חלקיות. עובד רק ב-Atlas עם האינדקס מהמסמך; בשרת אחר זורק שגיאה.
export const findAtlasNameHitsRepo = async ({ text, indexName }) => {
  const fuzzy = { maxEdits: 1, prefixLength: 1 };
  const namePaths = ['name', 'nameHe', 'nameEn'];

  const hits = await Restaurant.aggregate([
    {
      $search: {
        index: indexName,
        compound: {
          must: [
            {
              compound: {
                should: [
                  { text: { query: text, path: namePaths, fuzzy, score: { boost: { value: 2 } } } },
                  { autocomplete: { query: text, path: namePaths, tokenOrder: 'any', fuzzy } },
                ],
                minimumShouldMatch: 1,
              },
            },
          ],
          filter: [{ equals: { path: 'status', value: 'APPROVED' } }],
        },
      },
    },
    { $limit: ATLAS_SEARCH_HIT_LIMIT },
    { $project: { _id: 1, score: { $meta: 'searchScore' } } },
  ]);

  return hits.map((hit) => ({ id: String(hit._id), score: hit.score }));
};

// Saving each restaurant runs the model's pre-validate step, which rebuilds the search copies.
// שמירת כל מסעדה מריצה את שלב ה-pre-validate של המודל, שבונה מחדש את עותקי החיפוש.
export const rebuildAllSearchFieldsRepo = async () => {
  let restaurantCount = 0;

  for await (const restaurant of Restaurant.find({})) {
    await restaurant.save();
    restaurantCount += 1;
  }

  return restaurantCount;
};

// Approved certificates that the public may still see: valid, or expired no longer than six months ago.
// The service applies the exact rule again with the shared functions; this only keeps the query small.
// תעודות מאושרות שהציבור עדיין רשאי לראות. השירות מחיל שוב את הכלל המדויק; כאן רק מקטינים את השאילתה.
export const findPublicTeudotForRestaurantsRepo = async (restaurantIds, oldestPublicExpiration) => {
  if (restaurantIds.length === 0) {
    return [];
  }

  return Teuda.find({
    restaurant: { $in: restaurantIds },
    status: 'APPROVED',
    expirationDate: { $gte: oldestPublicExpiration },
  })
    .select('restaurant status hechsher hechsherOther kashrutLevel expirationDate')
    .lean();
};
