# Backend index readiness

Read-only checks for the pending-submission unique indexes added on `feature/backend-qa-fixes`.

Do not run these queries against production. Do not run them against `kosherradar` or `kosherradar_qa` unless the operator has approved that specific database. The queries below only read. They do not insert, update, delete, or create indexes.

Run them from `mongosh` against the database you intend to inspect. Print document ids and counts only. Do not add name, address, email, phone, or description to the output.

The application normalizes text before it stores `nameNormalized` and `addressNormalized` (`backend/src/utils/normalizeText.js`: lower case, Hebrew vowel marks removed, punctuation removed, spaces collapsed). A MongoDB aggregation cannot repeat that function. If a pending document has no stored normalized fields, review that document by id before treating a null group as a real duplicate.

Report fingerprints are SHA-256 hex strings from `pendingReportFingerprint` in `backend/src/utils/reportIdentity.js`. The hash input is `JSON.stringify({ description: trimmedDescription, teuda: certificateIdOrEmptyString })` encoded as UTF-8. A raw aggregation does not recompute that hash. Pending reports that have no string fingerprint are outside the unique index and need a separate id list, then a manual comparison.

## Pending restaurant duplicates

Index `pending_submitter_name_address` on `restaurants`:

- Keys: `submittedBy`, `nameNormalized`, `addressNormalized`
- Unique: true
- Partial filter: `{ status: "PENDING" }`

Missing `nameNormalized` or `addressNormalized` is indexed as null. Two pending rows for the same submitter that both lack those fields collide even when the visible name or address differs. Approved and rejected rows are not in the index.

```javascript
db.restaurants.aggregate([
  { $match: { status: "PENDING" } },
  {
    $group: {
      _id: {
        submittedBy: "$submittedBy",
        nameNormalized: "$nameNormalized",
        addressNormalized: "$addressNormalized"
      },
      count: { $sum: 1 },
      ids: { $push: "$_id" }
    }
  },
  { $match: { count: { $gt: 1 } } },
  { $project: { _id: 0, count: 1, ids: 1, submittedBy: "$_id.submittedBy" } }
])
```

Also list pending rows whose normalized fields are missing, so a null group is not mistaken for a proven name match:

```javascript
db.restaurants.find(
  {
    status: "PENDING",
    $or: [
      { nameNormalized: { $exists: false } },
      { nameNormalized: null },
      { addressNormalized: { $exists: false } },
      { addressNormalized: null }
    ]
  },
  { _id: 1, submittedBy: 1 }
)
```

If either result is non-empty, stop. An operator has to decide which pending rows to keep before the index can be built. This document does not choose a row and does not delete anything.

## Pending certificate duplicates

### Dated

Index `pending_dated_certificate_identity` on `teudas`:

- Keys: `restaurant`, `submittedBy`, `hechsher`, `hechsherOther`, `kashrutLevel`, `expirationDate`
- Unique: true
- Partial filter: `{ status: "PENDING", expirationDate: { $type: "date" } }`

Mashgiach and photo fingerprint are not part of this key. A missing `hechsherOther` or `kashrutLevel` is indexed as null.

```javascript
db.teudas.aggregate([
  { $match: { status: "PENDING", expirationDate: { $type: "date" } } },
  {
    $group: {
      _id: {
        restaurant: "$restaurant",
        submittedBy: "$submittedBy",
        hechsher: "$hechsher",
        hechsherOther: "$hechsherOther",
        kashrutLevel: "$kashrutLevel",
        expirationDate: "$expirationDate"
      },
      count: { $sum: 1 },
      ids: { $push: "$_id" }
    }
  },
  { $match: { count: { $gt: 1 } } },
  { $project: { _id: 0, count: 1, ids: 1 } }
])
```

### Undated

Index `pending_undated_certificate_identity` on `teudas`:

- Keys: `restaurant`, `submittedBy`, `hechsher`, `hechsherOther`, `kashrutLevel`, `mashgiachName`, `mashgiachPhone`, `photoFingerprint`
- Unique: true
- Partial filter: `{ status: "PENDING", expirationDate: null }`

In MongoDB, `expirationDate: null` matches a null value and a missing field. A missing `photoFingerprint` stays null and is inside the index. That is the existing legacy rule: an old undated row with no fingerprint still matches a later no-photo submission with the same hechsher and mashgiach. This check does not backfill fingerprints.

```javascript
db.teudas.aggregate([
  { $match: { status: "PENDING", expirationDate: null } },
  {
    $group: {
      _id: {
        restaurant: "$restaurant",
        submittedBy: "$submittedBy",
        hechsher: "$hechsher",
        hechsherOther: "$hechsherOther",
        kashrutLevel: "$kashrutLevel",
        mashgiachName: "$mashgiachName",
        mashgiachPhone: "$mashgiachPhone",
        photoFingerprint: "$photoFingerprint"
      },
      count: { $sum: 1 },
      ids: { $push: "$_id" }
    }
  },
  { $match: { count: { $gt: 1 } } },
  { $project: { _id: 0, count: 1, ids: 1 } }
])
```

Pending undated rows with no fingerprint, for manual review:

```javascript
db.teudas.find(
  {
    status: "PENDING",
    expirationDate: null,
    $or: [
      { photoFingerprint: { $exists: false } },
      { photoFingerprint: null }
    ]
  },
  { _id: 1, restaurant: 1, submittedBy: 1 }
)
```

## Pending report duplicates

Index `pending_report_identity` on `reports`:

- Keys: `submittedBy`, `restaurant`, `pendingReportFingerprint`
- Unique: true
- Partial filter: `{ status: "PENDING", pendingReportFingerprint: { $type: "string" } }`

The description is not an index key. Resolved and rejected reports leave the index. Reports saved before the fingerprint field existed are excluded, so this aggregation cannot see them.

```javascript
db.reports.aggregate([
  { $match: { status: "PENDING", pendingReportFingerprint: { $type: "string" } } },
  {
    $group: {
      _id: {
        submittedBy: "$submittedBy",
        restaurant: "$restaurant",
        pendingReportFingerprint: "$pendingReportFingerprint"
      },
      count: { $sum: 1 },
      ids: { $push: "$_id" }
    }
  },
  { $match: { count: { $gt: 1 } } },
  { $project: { _id: 0, count: 1, ids: 1 } }
])
```

Pending reports that the index does not cover:

```javascript
db.reports.find(
  {
    status: "PENDING",
    pendingReportFingerprint: { $not: { $type: "string" } }
  },
  { _id: 1, restaurant: 1, submittedBy: 1, teuda: 1 }
)
```

Those ids can still block a later sequential submission through the existing lookup. They do not block index creation. Deciding whether two of them are the same report requires the application fingerprint, not a raw aggregation: trim the description, use an empty string when no certificate is named, and compare SHA-256 as implemented in `pendingReportFingerprint`. Do not print the description in the inspection output.

## Before any cleanup

1. Save the id lists from the queries above.
2. Confirm the database name in the shell prompt.
3. Decide which pending row to keep. This file does not authorize an update or a delete.
4. Only after that decision, build indexes with an additive `createIndexes` on the approved database. Do not use `syncIndexes`, `dropIndex`, or `dropIndexes` as part of this check.
5. If index creation fails with a duplicate-key error, the queries above were incomplete or new duplicates were inserted. Stop and inspect again.
