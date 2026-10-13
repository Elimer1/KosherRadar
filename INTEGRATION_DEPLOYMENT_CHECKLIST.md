# Integrated application database and release preparation

Prepared 13 October 2026. This is a review checklist, not authorization to run commands against an existing database. Local integration did not access or mutate any existing application database.

## Release gates

- Map provider replacement MAP-001 is integrated from `dc826fc`; live Geoapify rendering remains unverified (linked MAPTILE-001). Supply a separate public origin-restricted `VITE_GEOAPIFY_MAPS_API_KEY` at frontend build time; the committed example is blank. Do not reuse the private backend geocoding key. Without a key, a localized notice and restaurant markers/controls remain, but the basemap is blank. No provider dashboard/hosting configuration or real key setup was performed by integration.
- **UIAUD-001:** Verified on integration/p1-security-admin-navigation as c454188 from source 587bac1. Combined frontend 246 tests and four intercepted Chrome scenarios passed; route-owned forms/reads/mutations and stale completions preserve record identity. Navigation discards unsaved drafts; accepted original-record writes may finish. No live mutations. Main merge/push require explicit approval; this is not production approval.
- **SEC-006 / EMAILAUD-001:** Verified on `integration/p1-security-admin-navigation` as `4a958dc` from source `fb31498` (not merged to main or deployed). See `SEC006_FIX_PROGRESS.md` and FIX_TRACKER.md for the failing real baseline and 16 passing disposable MongoDB regressions. Use the fixed account-authority recovery implementation across all backend instances; mixed legacy writers are unsafe. Old collection links require fresh requests, no backfill. Disable recovery for a rollback rather than restore the vulnerable implementation. Combined review, 684 backend tests and 16 disposable MongoDB regressions passed. This resolves the code defect locally; explicit main merge/push approval and separate release gates remain. The original integration diagnostic evidence in INTEGRATION_PROGRESS.md is historical; `passwordResetAudit.integration.mjs` now tests fail-closed legacy compatibility.
- Identify the deployment and approve its database/index operations separately. Do not infer readiness from local test success or a loopback URI.
- Review new Hebrew email, photo and history copy with a native speaker (M8-004).
- Verify deployed Gmail, Cloudinary, Geoapify and Atlas configuration on approved resources. Agent 4's historical isolated Gmail evidence is preserved, but no live service was called during integration. Moderation email delivery and email-client rendering remain unverified.
- Plan backups, maintenance/rollback ownership and monitoring before production. Browser fixtures and mocked APIs cannot prove those operations.

## Transactions and topology

`withTransaction` uses the installed Mongoose connection transaction API with `transactionAsyncLocalStorage`, snapshot reads, majority writes and primary read preference. Repository queries, document saves and creates inherit the transaction session. Driver retries must not contain external uploads or emails.

Transactional paths include restaurant creation (public and admin), adding certificates, parent-guarded report creation, applying report corrections and awarding their points, restaurant/certificate deletion and restaurant rejection with associated pending certificates. Cloudinary uploads happen before transactions; notifications and cleanup attempts happen after commit.

A replica set or transaction-capable sharded MongoDB deployment is required. A standalone instance can connect and pass unique-index startup verification, but transaction-dependent operations return `503 / TRANSACTIONS_REQUIRED` for MongoDB IllegalOperation/code 20; atomicity is not bypassed. Readiness currently checks Mongoose connection state, not topology, actual queries or unique indexes after startup. Use `/api/health/live` for liveness and `/api/health/ready` (or `/api/health`) for readiness.

No existing-record migration is needed for `Restaurant.integrityVersion` (missing counters increment from zero), optional derived `cityNormalized`, the history response `correctionApplied` or the new ImageCleanup outbox. Preserve the outbox and its queued provider IDs across application rollback. Historical inconsistent reports/points/rejections require separately approved inspection and repair; integration does not backfill them.

## Exact unique constraints

The authoritative definitions are the integrated model schemas. Startup verifies unique key order, `unique`, sparse setting, partial filter and collation. It also rejects a leftover broader pending restaurant constraint by keys, including differently named indexes. It does not create, drop or repair anything.

| Model | Unique keys in order | Partial filter / name |
| --- | --- | --- |
| User | `email: 1` | All records |
| Restaurant | `submittedBy: 1, nameNormalized: 1, addressNormalized: 1, cityNormalized: 1` | `status: 'PENDING', cityNormalized: { $type: 'string' }`; `pending_submitter_name_address_city` |
| Teuda (dated) | `restaurant: 1, submittedBy: 1, hechsher: 1, hechsherOther: 1, kashrutLevel: 1, expirationDate: 1` | `status: 'PENDING', expirationDate: { $type: 'date' }`; `pending_dated_certificate_identity` |
| Teuda (undated) | `restaurant: 1, submittedBy: 1, hechsher: 1, hechsherOther: 1, kashrutLevel: 1, mashgiachName: 1, mashgiachPhone: 1, photoFingerprint: 1` | `status: 'PENDING', expirationDate: null`; `pending_undated_certificate_identity` |
| Report | `submittedBy: 1, restaurant: 1, pendingReportFingerprint: 1` | `status: 'PENDING', pendingReportFingerprint: { $type: 'string' }`; `pending_report_identity` |
| PasswordResetToken | `tokenHash: 1` | All records; uniqueness of a hash does not serialize issuance per user |
| ImageCleanup | `publicId: 1` | All records |

The operator provisioner also creates **all declared nonunique indexes**, including Restaurant `location: '2dsphere'`, new `{ status: 1, _id: 1 }` batching index, existing search/query indexes, and PasswordResetToken `{ expiresAt: 1 }` with `expireAfterSeconds: 0`. Startup's gate checks unique constraints only; successful startup does not prove geospatial/query/TTL index provisioning. Approval must explicitly cover TTL deletion of expired existing reset records.

## Approved-target rollout sequence

1. Confirm the exact target, isolation/environment, MongoDB topology, backup and catalog. Inspect duplicates with approval; do not print user data in diagnostic logs.
2. Follow [SEARCH_LOCATION_INDEX_ROLLOUT.md](SEARCH_LOCATION_INDEX_ROLLOUT.md). Use a maintenance window and one application writer version. Old writers omit `cityNormalized` and cannot safely share this rollout.
3. With target approval, create/verify `pending_submitter_name_address_city` **before** removing `pending_submitter_name_address` or an equivalent broader old constraint. No Mongoose automatic removal is expected. The old constraint otherwise keeps blocking valid cross-city branches; INT-001 now prevents starting in that mixed state.
4. Provision missing collections/indexes with the reviewed operator command, from backend: `node scripts/provisionIntegrityIndexes.js --allow-index-creation`. This only creates declarations; it never removes the old index. If called before approved old-index removal, its final verification fails while any completed new builds remain. Never use `syncIndexes()` or delete/merge records to force a build.
5. Run the read-only operator verification against the approved target: `node scripts/verifyIntegrityIndexes.js`. Verify nonunique geospatial/query/TTL definitions separately. Start the app only after these checks pass.
6. Exercise transaction rollback/concurrency, normalized same-city collision, cross-city acceptance, legacy city lookup/save, moderation and zero ADMIN points on approved isolated deployment resources. Local tests prove these on a fresh MongoDB 7 replica set, not on production or Atlas.
7. Check `/api/health/ready` and `/api/health/live`, then approved browser and external-service journeys. Keep Atlas Search disabled until the index/query mapping and fallback completeness are verified; see ATLAS_SEARCH_SETUP.md.

Legacy pending restaurants without `cityNormalized` are checked using their original city without backfill. They remain outside the new partial unique index until saved by current code. Saving may expose existing duplicates and fail validation/index insertion; assess them separately. This compatibility fallback is not a database uniqueness guarantee for old rows. Legacy reports without fingerprint likewise remain outside their partial identity constraint.

## Rollback and remaining operational limits

Keep new city-aware uniqueness and all new data when reverting code. After valid cross-city branches have been admitted, restoring the old broader index can fail; do not remove records to restore it. Old writers are incompatible with the new city-derived identity. Coordinate version/rollback strategy before rollout.

Retain ImageCleanup jobs, counters and uniqueness. The retry command `node scripts/retryImageCleanup.js` uses the configured database and Cloudinary and requires separate resource approval. Cloudinary upload followed by process death before durable recording still needs provider-side reconciliation; an unknown transaction commit retains uploads to avoid deleting referenced images. No live cleanup was tested here.

The integrated dependency set includes the email branch's explicitly requested Nodemailer. No extra packages were introduced by integration. Existing localStorage authentication, point amounts/eligibility, public trust labels and kashrut derivation remain intact.
