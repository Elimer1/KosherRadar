# Search/location index rollout (SEARCH-004, SEARCH-007)

Prepared for review only. No database was accessed and no index or record was modified.
Real database/index operations require explicit user approval and an identified isolated
test resource before production rollout. Do not run `syncIndexes()`; it can drop unrelated indexes.

SEARCH-004 adds a nonunique `{ status: 1, _id: 1 }` index for bounded keyset scans.
It is compatible with existing documents; no record migration/backfill is needed.
Rollback can remove that added index without changing records.

SEARCH-007 derives `cityNormalized` with the existing `normalizeText` helper on every
restaurant validation/save. New pending inserts use city in both the preflight query
and unique identity. Old documents without this field are compared using their original
city at read time. No backfill is required for the preflight check. The new partial unique
index covers pending documents whose `cityNormalized` is a string (including empty city).
Do not reuse the old index name or assume Mongoose removes the old index automatically.

For an approved deployment, coordinate a maintenance window with a single application
version; avoid old writers that omit `cityNormalized`. Inspect the actual index catalog
and pending identity duplicates on the approved resource first. Create and verify
`pending_submitter_name_address_city` before removing `pending_submitter_name_address`.
The old index otherwise continues to block distinct branches in different cities.
Its replacement is mandatory to activate the fix on an existing database.

The reviewed index definitions are:

```js
{ keys: { status: 1, _id: 1 }, options: {} }
{ keys: { submittedBy: 1, nameNormalized: 1, addressNormalized: 1, cityNormalized: 1 },
  options: { name: 'pending_submitter_name_address_city', unique: true,
    partialFilterExpression: { status: 'PENDING', cityNormalized: { $type: 'string' } } } }
```

With approval, verify on an isolated MongoDB: identical names/streets in different
cities both insert; same-city normalized concurrent inserts produce one success and
one 409; legacy pending same-city records are detected without writes; approved/rejected
records stay outside the unique constraint. Test a legacy record being saved under the
new schema. Mocks in this checkout do not prove those live database behaviors.

Rollback: retain the new data and city-aware constraint if branches have already been
admitted. Restoring the old broader unique index may fail after legitimate cross-city
inserts. Assess conflicts before any reversal; do not delete or merge records to make
the old index build pass. A backfill is optional future work and requires separate approval.
