# Atlas Search setup

KosherRadar searches restaurant **names** with MongoDB Atlas Search (typo tolerant and partial matching) and **food** with its own bilingual synonym list. If Atlas Search is not available, the search keeps working with a simpler built-in matching ("the fallback"). This file explains how to switch Atlas Search on and how to check that it really works.

> **Status: UNVERIFIED.** The index definition and the search stage below were written from the Atlas documentation and checked by unit tests with a mocked database. They were **never run against a real Atlas cluster** (no connection string was available when this was written). Do the verification steps below before relying on fuzzy matching, and do not describe typo tolerance as working until you saw it work.

## What works without any setup (the fallback)

With `ATLAS_SEARCH_ENABLED` unset or `false` (the default), the backend uses MongoDB indexes only:

- **Name search:** every typed word must be the **beginning of a word** in the restaurant's name (or its Hebrew / English name). `piz` finds `Pizza Hut`; `hut` finds `Pizza Hut`; `izza` does not.
- **Food search:** the typed words are matched against the restaurant's food keywords and against the food synonym groups in `backend/src/config/foodSynonyms.js` (`pizza` also finds `פיצרייה`, `פיצה` also finds a restaurant tagged `pizza`).
- **Not available in the fallback:** typo tolerance. `pitza` does **not** find `Pizza`.
- The queries use anchored prefix matches on indexed arrays (`nameTokens`, `foodTokens`, `foodGroups`). Search evaluates all matching candidates in batches of 2000 before kashrut filtering and ranking; see `SEARCH_LOCATION_INDEX_ROLLOUT.md` for the added keyset index. Per-query database deadlines bound individual operations; total cost still scales with matching candidates.

## What Atlas Search adds

When enabled and working, the name search also uses Atlas Search with:

- `text` search with `fuzzy` (one typo allowed, the first letter must be right) over `name`, `nameHe`, `nameEn`;
- `autocomplete` (edge n-grams from 2 to 15 characters, also fuzzy) over the same fields;
- only `APPROVED` restaurants (a `filter` on `status`).

The results of the fallback matching are **always** added as well, so turning Atlas Search on can never remove a result the fallback would have found. Atlas results are ranked by their relevance score; exact and "starts with" name matches still rank first.

The food search, the kashrut filters, the food type / category filters, the location radius and the sorting are the same with or without Atlas Search.

Fuzzy candidates remain limited to 100, with an extra overflow probe. Overflow sets `capped: true` and `completeness.complete: false`, with reason `atlas_candidate_limit`; totals are then lower bounds. Atlas failure reports `search.atlasUnavailable: true` and incomplete metadata with reason `atlas_unavailable`. The map applies its 500-marker limit after shared filtering and global ranking, reporting `map_marker_limit` when additional eligible matches exist. Basic list search has no preliminary candidate cap.

## Free tier notes

- Atlas Search is documented as available on the free (M0) cluster tier, with a small limit on the number of search indexes per cluster (3 at the time of writing). Check the current limits in your Atlas account; they can change.
- A search index is **not** created by Mongoose. `Restaurant` has normal Mongoose indexes (`restaurantSchema.index(...)`), but the Atlas Search index below must be created by hand in Atlas.
- A new index takes a minute or two to build and shows the status `Building` and then `Active`.

## Create the index (Atlas UI)

1. Log in to MongoDB Atlas and open your project and cluster.
2. Open the **Atlas Search** tab (also called **Search & Vector Search**) and press **Create Search Index**.
3. Choose **Atlas Search** and the **JSON Editor** (not the Visual Editor), then **Next**.
4. **Index name:** `restaurant_search` (use exactly this, or set `ATLAS_SEARCH_INDEX` to the name you chose).
5. **Database and Collection:** your database (the name in `MONGODB_URI`, for example `kosherradar`) and the collection **`restaurants`**.
6. Replace the editor content with the definition below, press **Next**, then **Create Search Index**.
7. Wait until the status is **Active**.

### Index definition (copy and paste)

```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "name": [
        { "type": "string", "analyzer": "lucene.standard" },
        {
          "type": "autocomplete",
          "analyzer": "lucene.standard",
          "tokenization": "edgeGram",
          "minGrams": 2,
          "maxGrams": 15,
          "foldDiacritics": true
        }
      ],
      "nameHe": [
        { "type": "string", "analyzer": "lucene.standard" },
        {
          "type": "autocomplete",
          "analyzer": "lucene.standard",
          "tokenization": "edgeGram",
          "minGrams": 2,
          "maxGrams": 15,
          "foldDiacritics": true
        }
      ],
      "nameEn": [
        { "type": "string", "analyzer": "lucene.standard" },
        {
          "type": "autocomplete",
          "analyzer": "lucene.standard",
          "tokenization": "edgeGram",
          "minGrams": 2,
          "maxGrams": 15,
          "foldDiacritics": true
        }
      ],
      "status": { "type": "token" }
    }
  }
}
```

The `lucene.standard` analyzer splits Hebrew and English text into words and makes it case-insensitive. It does not do Hebrew stemming (it will not know that `המסעדה` and `מסעדה` are the same word), which is why the fallback matching and the synonym list stay in place.

## Turn it on

In `backend/.env`:

```
ATLAS_SEARCH_ENABLED=true
ATLAS_SEARCH_INDEX=restaurant_search
```

Restart the backend. Atlas Search stays off unless `ATLAS_SEARCH_ENABLED` is exactly `true`.

If you already have restaurants saved before Milestone 4, run this once so their search fields exist (it is safe to run again, and again after you change the food synonym list):

```bash
cd backend
npm run search:rebuild
```

## Verify that it really works

Do these checks with at least one **APPROVED** restaurant, for example `Pizza Hut`:

1. **Index exists:** in Atlas, the index `restaurant_search` on `restaurants` shows **Active**. In the **Search Tester** of that index, search `pizza` and confirm `Pizza Hut` is returned.
2. **Plain match:** open the site and search `pizza`. `Pizza Hut` must appear. (This also works in the fallback, so it proves nothing about Atlas yet.)
3. **Typo match (the real proof):** search `pitza` or `piza`.
   - With Atlas Search working, `Pizza Hut` appears.
   - Without it, nothing appears (fallback mode).
4. **Response check:** `GET http://localhost:5000/api/restaurants?q=pitza&includeUnknown=true` returns `"search": { "mode": "ATLAS", "atlasUnavailable": false }` and the restaurant.
5. **Prefix check:** `GET /api/restaurants/suggestions?q=pi&includeUnknown=true` returns the restaurant in `suggestions`.

How to read the `search` field of the answer:

| `search` | Meaning |
| --- | --- |
| `{ "mode": "ATLAS", "atlasUnavailable": false }` | `ATLAS_SEARCH_ENABLED=true` and the Atlas query ran without an error |
| `{ "mode": "BASIC", "atlasUnavailable": false }` | Atlas Search is switched off; the fallback is used on purpose |
| `{ "mode": "BASIC", "atlasUnavailable": true }` | Atlas Search is switched on but the Atlas query failed; the fallback is used and the site shows a short notice |

**Important:** `"mode": "ATLAS"` only means the query did not fail. If the **index does not exist or is still building, Atlas returns no hits without an error**, so the mode still says `ATLAS` while typo tolerance does nothing. That is why check 3 (a typo search) is the real test.

## Troubleshooting

| Symptom | Likely cause and fix |
| --- | --- |
| Backend log: `Atlas Search failed, using the basic search instead: Unrecognized pipeline stage name: '$search'` | The database is not on Atlas (for example a local MongoDB). Keep `ATLAS_SEARCH_ENABLED=false`. |
| `mode` is `ATLAS` but `pitza` finds nothing | The index is missing, still `Building`, on the wrong database/collection, or has a different name than `ATLAS_SEARCH_INDEX`. Check the Atlas Search tab. |
| `mode` is `BASIC` with `atlasUnavailable: true` | Read the backend log line that starts with `Atlas Search failed`. The message names the cause (index, permissions, network). |
| Restaurants added by hand in the database are not found | They have no search fields. Run `npm run search:rebuild`, or save them again from the admin screen. |
| A new restaurant is not found right after approval | The Atlas index updates a few seconds after a change. The fallback matching finds it immediately. |
| Atlas says the index limit is reached | Delete an unused search index or use a different cluster tier. The fallback keeps working. |
| `status` filter returns nothing | The `status` field must be mapped as `"type": "token"` exactly as above, or the `equals` filter cannot match it. |

## Limits worth knowing

- Fuzzy matching allows **one** typo per word and requires the first letter to be correct (`prefixLength: 1`). `pitza` matches `pizza`; `bizza` does not.
- Hebrew has no stemming and no synonym handling in the Atlas index. Hebrew and English food words are connected only through `foodSynonyms.js`.
- The search text and the stored names are not translated. A restaurant whose only name is Hebrew is not found by its English spelling (unless the admin entered the English name or a food keyword).
