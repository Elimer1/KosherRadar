# Admin certificate validation fix — 13 October 2026

## Scope and repository

- Issue: ADMINCERT-001; this session covers only certificate custom-name validation.
- Workspace: `C:/FS/projects/KosherRadar-certificate-fix`.
- Branch: `fix/admin-certificate-validation`.
- Starting HEAD: `601c0dd043c0e2a980d238470c7092086a5ebadf`, exactly the requested base; ancestry check exit 0.
- Initial working tree clean. Other branches/worktrees were inspected read-only and not edited.
- Final checkpoint is the commit containing this report (`git log -1 --format=%H`); no merge, push or deployment.

## Root cause and traced flow

`AdminAddTeudaPage` starts with `emptyTeudaForm.hechsherOther = ''`. `TeudaFields` correctly shows the custom-name input only when the selected value equals the options' `hechsherOtherValue`. The established constants map Hebrew Local Rabbinate to `LOCAL_RABBANUT` and Other to `OTHER`; labels are not request enum values.

The page calls `createTeudaAsAdmin`, whose shared `buildAdminTeudaPayload` previously spread all form values unchanged. JSON serialized `hechsherOther: ''` into multipart `teuda`. Axios sends that FormData; the admin route checks authentication/role, upload limits and IDs, reads the photo with Multer, parses JSON, then runs `validateBody(adminCreateTeudaSchema)` before the controller/service.

The optional `z.string().trim().min(1).max(100)` accepted omission but rejected explicit blank strings. This happened before `requireOtherTextWhenOther` and `dropOtherTextUnlessOther`, preventing standard selections from reaching the service. Direct HTTP regressions reproduced 400 for admin add, combined initial certificate and edit; schema tests reproduced the same `teuda.hechsherOther` too-small error.

The existing controller → service → repository flow already creates APPROVED admin-owned certificates directly in a transaction, with no points call. `buildTeudaRecord` preserves hechsher details; `Teuda` stores an optional trimmed bounded string. Editing replaces the custom name and clears the previous value when normalized to undefined. No persistence/model/rule change is needed.

## Smallest fix and affected workflows

- Admin API builder trims custom-name text and serializes blank text as omission for add, combined restaurant creation and editing.
- Shared backend `optionalHechsherOtherField` normalizes only blank strings (including whitespace) to undefined. Both admin schemas and pending public evidence reuse it.
- Existing conditional refinement still requires a nonblank name for OTHER. Existing transform removes valid leftover text for standard selections.
- Non-string values, including null, objects, arrays and numbers, and names exceeding 100 characters remain rejected even for standard selections. Required dates, levels, mashgiach fields, photo validation and authorization remain intact.
- Public `buildPendingTeudaPayload` already omits blank custom names; no public frontend change was necessary. Public add/initial-certificate schemas now also handle direct requests containing blank optional names consistently.
- No dependencies, migrations/backfills, point amounts/eligibility, kashrut classifications, public terminology, auth storage or UI translations changed. Hebrew additions are comments only.

## Files changed

- `backend/src/schemas/commonSchemas.js`: shared optional custom-name validator.
- `backend/src/schemas/adminSchemas.js`: apply it to admin create/edit certificate fields.
- `backend/src/schemas/teudaSchemas.js`: apply it to public pending evidence.
- `frontend/src/api/adminApi.ts`: normalize blank names during shared request construction.
- `backend/tests/certificateHechsherSchemas.test.js`: 80 schema regressions across five workflows and every standard enum option.
- `backend/tests/adminCertificateValidationHttp.test.js`: 18 actual loopback HTTP regressions through real routes, Multer/JSON parsing, validation, controllers, admin services, record building and public authority derivation.
- `frontend/src/api/adminApi.test.ts`: four builder/request regressions including actual multipart add/combined requests and JSON edit requests.
- `FIX_TRACKER.md`, `PROGRESS.md`, this report: evidence, verification and handoff.

## Regression coverage and isolation

Coverage includes LOCAL_RABBANUT admin add/initial certificate, standard omitted/empty/whitespace names, OTHER trimmed valid/missing/empty/whitespace names, all accepted standard options, stale custom-name clearing on edit, malformed/overlong names, invalid or missing required certificate data, missing/invalid photo and USER denial. Success assertions verify APPROVED/admin ownership, public VERIFIED derivation immediately without another approval, and no award operation.

HTTP tests mock authentication identity solely to exercise the actual role gate; JWT authentication remains covered by existing full-suite tests. Database repositories, transactions, duplicate lookup, email and upload operations are mocked. Real image signature checking remains active; valid PNG signature bytes are supplied. Rate-limit middleware is bypassed in this fixture to avoid aggregate upload limits across cases; existing rate-limit behavior is unchanged. No database connection, transaction durability or real image upload is asserted.

## Actual verification

Commands run from the indicated package directory; every final command below exited 0.

| Directory | Command | Result |
| --- | --- | --- |
| backend | `npm test -- tests/certificateHechsherSchemas.test.js tests/adminCertificateValidationHttp.test.js tests/adminSchemas.test.js tests/submissionSchemas.test.js tests/adminTeudaService.test.js tests/teudaSubmissionService.test.js tests/adminRestaurantService.test.js` | 7 files, 203 passed |
| frontend | `npm test -- src/api/adminApi.test.ts src/api/restaurantApi.test.ts src/pages/photoSubmission.test.tsx` | 3 files, 19 passed |
| backend | `npm test` | 51 files, 678 passed |
| frontend | `npm test` | 36 files, 219 passed |
| frontend | `npm run lint` | oxlint passed |
| frontend | `npm run typecheck` | TypeScript passed |
| frontend | `npm run build` | TypeScript and Vite production build passed |
| repository | `git -c core.whitespace=cr-at-eol diff --check` | passed |

Baseline backend command `npm test -- tests/certificateHechsherSchemas.test.js tests/adminCertificateValidationHttp.test.js` exited 1: 38 failed / 60 passed (35 standard-name schema cases and 3 admin HTTP paths failed). Baseline frontend `npm test -- src/api/adminApi.test.ts` exited 1: 4 failed. The HTTP fixture's public summary assertion was corrected to the established `status: VERIFIED` contract; fixture rate limits were isolated, without weakening application validation or assertions. Initially both focused commands exited 1 because Vitest was absent. Existing node_modules were copied read-only from the integration checkout into this workspace after matching both package-lock SHA-256 hashes; no environment files copied and no packages added.

Backend has no build/lint/typecheck scripts. Frontend emits the pre-existing >500 kB chunk warning (774.97 kB main JS); full jsdom suite emits its existing navigation-not-implemented message. Neither caused a failed check.

## Limitations and next agent onboarding

ADMINCERT-001 is verified with mocked persistence/external boundaries and actual local HTTP, plus frontend jsdom serialization/shared-form regressions. No live browser, MongoDB or external integration test was run or claimed. No application database or real user files were accessed. There is no unfinished implementation or failing final check.

Next step: review/incorporate this local checkpoint into the updated main branch in a separately authorized integration session. Reconcile Git and tracking state first; preserve concurrent work, then rerun backend/frontend full suites and frontend lint/typecheck/build after integration. Do not repeat this fix, change hechsher enum/points rules, merge/push/deploy here, or treat it as resolution of SEC-006, UIAUD-001 or MAPTILE-001. Those remain outside this session's scope. Stop after reporting the local commit and clean working tree.
