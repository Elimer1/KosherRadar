# KOSHERRADAR — MASTER SPECIFICATION + MILESTONE 1 CURSOR AGENT PROMPT

You are Cursor Agent acting as the lead developer implementing my full-stack final project, **KosherRadar**, from scratch in this workspace. Read this entire specification, including section 0A (two-developer coding style), before changing files. Your task is to produce a genuinely working, locally runnable application, not a mockup. This document is the **master specification for the entire project**. **At the start of the first session, save the full specification and all seven milestones inside the repository as `PROJECT_SPEC.md` before writing application code; do not merely summarize it or save only Milestone 1.** That repository file is the permanent, authoritative reference for later sessions. **Each Cursor Agent session must implement only ONE milestone.** For the first session, implement **Milestone 1 only**. At the end of that milestone, run checks, fix problems, update `PROGRESS.md` and `REQUIREMENTS_CHECKLIST.md`, make real Git commits using the section 19 team workflow, then **STOP and ask for my approval** before beginning Milestone 2. Future sessions should start fresh, read this specification and the progress files, and implement only the next approved milestone. Do not build later milestones early except for minimal shared scaffolding needed by the current milestone. If blocked, document the blocker and the exact next steps before stopping. Never claim to have tested an integration that you could not test.

## MASTER SPECIFICATION FILE — REQUIRED IN MILESTONE 1

Before implementing any application feature in the first session:

1. Inspect the repository for `PROJECT_SPEC.md`. If it does not exist, **create it at the repository root** by copying **the entire specification you received in this prompt**: product requirements, coding-style rules including section 0A and its JavaScript/TypeScript-only GitHub references, technology choices, security constraints, business logic, out-of-scope rules, and **all seven milestones**. Preserve the detail and exact decisions; **do not paraphrase, shorten, or replace it with a Milestone 1 plan**. If this prompt was pasted in the Cursor chat rather than saved on disk, use that full prompt text as the source.
2. If `PROJECT_SPEC.md` already exists, read it and verify that it matches the supplied master specification. Do not overwrite user changes or quietly discard requirements; report any discrepancy needing a decision.
3. Treat `PROJECT_SPEC.md` as the **single authoritative source for project requirements** in every future Cursor Agent session. `PROGRESS.md` records current work; `REQUIREMENTS_CHECKLIST.md` tracks implementation and verification; neither replaces the master spec.
4. **Do not alter, shrink, reinterpret, or silently relax `PROJECT_SPEC.md` in later milestones.** Any material specification change requires my explicit approval. You may amend progress and checklist files normally.
5. Include `PROJECT_SPEC.md` in the **Milestone 1 Git commit**, so future agent sessions can read it from the repository. Later sessions must re-read it before modifying code.

**Scope distinction:** The instruction at the bottom to **start Milestone 1 now** applies only to the first session. It is not an instruction to restart Milestone 1 when a later agent reads `PROJECT_SPEC.md`. In later sessions, the explicitly approved milestone number in the new-session instruction controls which milestone to implement; all other requirements stay binding.

## 0. NONNEGOTIABLE CODING STYLE AND AGENT BEHAVIOR

Write code like a competent intermediate full-stack student familiar with React, TypeScript on the frontend, JavaScript/Express on the backend, MongoDB/Mongoose, JWT, bcrypt, Zod, Axios, Zustand, and Vitest. I must be able to read, debug, modify, and explain every part of this project in an oral technical examination.

- **Frontend: React + TypeScript + Vite. Backend: plain JavaScript (NOT TypeScript), Node.js + Express, ES modules (`import`/`export`, `"type":"module"`).** Use **fully separate `frontend/` and `backend/` directories**, each with its **own `package.json`, lockfile, dependencies, scripts and configuration**. Frontend `tsconfig.json` and Vite configuration must not affect backend. Do not generate backend `.ts` files or use Prisma/PostgreSQL.
- Backend layers: **routes → controllers → services → repositories → Mongoose models**. Controllers parse request and respond; services contain business rules; repositories contain Mongoose operations. Middleware handles auth, roles, validation, errors.
- Use readable named functions, simple `async/await`, straightforward `try/catch` or centralized async error forwarding, ordinary `if` checks, meaningful variable names, simple interfaces/types on frontend. Avoid unnecessary generics, decorators, metaprogramming, dependency-injection frameworks, enterprise patterns, excessive abstraction, clever one-liners, huge components, and `any` shortcuts.
- Frontend use `useState`/`useEffect` for local concerns, Zustand for genuinely shared state (including persisted auth), React Router, Axios shared instance, simple request interceptor attaching JWT, response handling for expired authenticated requests. Separate `pages/`, `components/`, `api/`, `stores/`, `hooks/`, `types/`; create hooks only when useful.
- Zod for request validation; Mongoose schemas for data integrity. Use familiar Mongoose `find`, `findOne`, `findById`, `create`, `findByIdAndUpdate`, `populate`, `limit`, `skip`; aggregation only when truly useful. Use clear indexes and efficient queries.
- Tailwind CSS for a clean, minimal, professional, white-and-green visual identity; avoid extra component libraries unless genuinely justified. Fully responsive across four width ranges: <640, 640–767, 768–1023, >=1024px. One website, not four sites; natural RTL Hebrew and LTR English.
- **Controlled freedom**: decide minor implementation details reasonably; do not add major features, services, technologies, or architecture without need. Do not silently weaken specified behavior. When requirements interact, implement one shared set of business rules and reuse it consistently.
- No Docker, deployment, CI/CD, SSR, mobile-native app, paid services, fabricated data, mock API responses in production, placeholder implementations, TODO-as-feature, or fake success screens. Test fixtures in test files are fine. No real secrets in code or Git.
- Use the **two-developer Git branch, commit-author, and merge workflow in section 19** throughout every milestone. Make multiple real commits when logical subfeatures are completed; never manufacture a history afterward.
- Read existing project files before making changes. If an existing codebase exists, preserve and integrate appropriate parts; do not wipe user work. If existing projects/examples are present, inspect their conventions and mirror their readable style. Avoid asking me to manually write code that you can write.

## 0A. TWO-DEVELOPER CODING STYLE GUIDE — APPLY BEFORE WRITING CODE

**Purpose:** This section is part of the project's binding specification. Match the two teammates' *readable, intermediate-level coding approach*, not a generic AI-generated or overengineered codebase. Eli Mermelstein and Moshe Silber are **feature owners, not permanently assigned backend/frontend owners** (see section 19). Both may work across the stack. Git author roles are separate from the question of who typed/generated the initial code; do not invent human-authored contributions.

### JavaScript/TypeScript source references ONLY (inspect before coding when accessible)

- Eli GitHub profile: https://github.com/Elimer1
- Eli JavaScript repository identified: https://github.com/Elimer1/se_project_aroundtheus . **Important:** the publicly surfaced default `gh-pages` branch contains generated/bundled `main.js` and CSS; that compiled output is NOT a reliable example of Eli's handwritten coding style. Inspect the original source branch and its authored `.js`/`.jsx` files if accessible. Do not reverse-engineer minified output or attribute a template's conventions to Eli.
- Moshe GitHub profile: https://github.com/mosheyz . No verified handwritten JavaScript, JSX, TypeScript, or TSX source repository was located during preparation of this guide; **do not invent a Moshe-specific coding pattern** based on unrelated repositories.
- **Only analyze JavaScript/TypeScript projects for coding style:** handwritten `.js`, `.jsx`, `.ts`, and `.tsx` files from these two profiles. You may examine HTML/CSS and `package.json` solely to understand relevant web-project organization, but not as a substitute for JavaScript/TypeScript code. **Exclude Python, other programming languages, generated `dist`/`build` bundles, minified assets, forks, template boilerplate, dependencies, and code primarily authored by third parties.**
- At the beginning of Milestone 1, if access is available, find a few relevant, original-source JS/TS repositories from each developer and inspect their meaningful application files (seek relevant React and Node/Express files for **both** developers where such samples genuinely exist). Record specific, verified patterns in a short `CODING_STYLE_NOTES.md` with repository URL, examined file paths, and observations. If the inspected projects differ from the required KosherRadar technology choices, respect this specification rather than copying incompatible stacks.
- **If genuine JS/TS examples for either developer cannot be accessed, do not block or hallucinate findings.** Use the explicitly approved team coding rules and illustrative examples below, and write 'No verified JS/TS source samples available' for that developer in `CODING_STYLE_NOTES.md`. The backend and frontend rules below are our **chosen project conventions**, not unverified claims about what the GitHub files contain.

### Eli — JavaScript/Express/Mongoose backend style

- **Plain JavaScript ES modules only** (`import`/`export`), no TypeScript, classes where simple functions suffice, decorators, dependency injection, ORMs, controller factories or unnecessary abstraction.
- Keep the familiar **route → controller → service → repository → Mongoose model** flow. Route files declare endpoints/middleware; controllers read validated request data, call services and send HTTP responses; services implement decisions; repositories perform database operations. Avoid bypassing a layer merely to save a file when it mixes responsibilities.
- Prefer small named exported `async` functions, `const`, `if`/`return` guard clauses, simple loops/array methods, straightforward `try/catch` where needed, and descriptive camelCase names like `getRestaurantByIdRepo`, `approveTeudaService`, `submitReportController`.
- Use ordinary Mongoose calls (`findById`, `find`, `create`, `populate`, etc.), not clever queries or aggregation pipelines unless the search/geospatial requirement actually needs them. Keep complex kashrut decisions in understandable service/helper functions with Vitest tests.
- Keep Express auth/role middleware obvious, Zod schemas close to the relevant feature, status codes explicit, errors consistent, and async error forwarding simple. No massive generic request wrappers or abstraction-heavy `BaseRepository`/`BaseController` hierarchies.

### Moshe — React/TypeScript frontend style

- **React functional components** with straightforward TS interfaces/types and normal named hooks. Organize into `pages/`, `components/`, `api/`, `stores/`, `hooks/`, `types/` as specified elsewhere; don't create a hook/utility for one trivial line of code.
- Put local form/input/loading/error state in `useState`; use `useEffect` only for appropriate side effects; use Zustand for truly shared state and persisted authentication. Avoid Redux, heavy data-fetching frameworks, global state for every input, unnecessary `useMemo`/`useCallback`/`React.memo`, or premature optimization.
- Prefer plain `async/await` event handlers, meaningful `handle...` names (`handleSubmit`, `handleLogin`), explicit loading/error/success UI, and simple conditional JSX. Use `useNavigate` and React Router for navigation. Keep Axios requests in named API functions using the shared Axios instance, not repeated hardcoded requests in components.
- Use direct, easy-to-explain props and interfaces; avoid deeply generic form components, excessive custom hooks, advanced TS trickery, giant JSX files, and overcomponentization. Tailwind classes are fine; factor out a reusable component when it has a genuine repeated purpose.
- Do not ascribe any frontend conventions to Moshe's prior work until verified in his handwritten JS/TS source. The React rules above are the team's explicitly chosen implementation constraints unless and until supported by inspected files.

### Concrete style examples — guidance, not extra app features

A **backend service** should look conceptually like this (use actual model/field names and shared errors when implementing):

```js
export const getRestaurantService = async (restaurantId) => {
  const restaurant = await getRestaurantByIdRepo(restaurantId);

  if (!restaurant) {
    throw new AppError('Restaurant not found', 404);
  }

  return restaurant;
};
```

Its controller should simply call that service and send the result (with the project's agreed async error handling). Don't copy `AppError` unless you've implemented that small error type, and **never add an extra framework just to mimic the example**.

A **frontend API function** should remain simple:

```ts
export const getRestaurant = async (restaurantId: string) => {
  const response = await api.get(`/restaurants/${restaurantId}`);
  return response.data;
};
```

A page/component can call a named function with `await`, keep local loading/error state, and render clear JSX. Prefer this over a generic API client factory with many layers of configuration.

### Maintainability and review requirements

- Use a consistent 2-space indentation style for JS/TS/TSX, semicolons, descriptive camelCase functions/variables, PascalCase components/types/models, and straightforward file naming. Where an actual relevant team repository clearly demonstrates a different consistent convention, follow it within that domain rather than mixing styles unpredictably.
- Comments explain **why** non-obvious security, date, filtering or kashrut decisions exist; don't narrate self-evident code. Keep one responsibility per function when practical, but never sacrifice clarity just to reduce file length.
- Before finishing each milestone, inspect generated code specifically for needless abstractions and simplify them *without reducing required functionality, correctness, validation, security or tests*. Code should be understandable to both teammates during their oral examination.
- **Do not treat Git author attribution as evidence of code style or as proof of who personally wrote a generated file.** Apply the approved simple React/TypeScript and Express/JavaScript conventions throughout; use verifiable developer-specific JS/TS examples only where genuinely available. Feature ownership, not file location, controls the team workflow in section 19.

## 1. PRODUCT GOAL

KosherRadar is a **crowdsourced factual kashrut-information directory for restaurants and food businesses in Israel**, NOT a restaurant rating/review app. Visitors can browse without an account. Registered users submit restaurants, kashrut certificates (teudot), and corrections/reports for admin review. Admins verify/approve/edit/reject/delete information. The site makes the difference between **verified certificate evidence, unverified claims, expired certificates, and unknown status** unmistakable. It must not imply that the app independently certifies kosher status or that Kosharot recommends a restaurant without verified evidence.

Build a cohesive, usable desktop/mobile interface with a public home/search, list/map toggle, restaurant detail, auth screens, user account/points, submission flows, and admin dashboard.

## 2. EXACT TECHNOLOGY STACK

- Frontend: React, TypeScript strict mode, Vite, React Router, Tailwind CSS, Axios, Zustand (persist for auth), Leaflet + OpenStreetMap tiles, suitable marker-clustering library, translation library such as react-i18next if useful.
- Backend: Node.js, Express, plain JavaScript ES modules, Zod, Mongoose, bcrypt, jsonwebtoken, Vitest.
- Database: **MongoDB Atlas free tier + Mongoose**. ObjectId references, separate collections for users/restaurants/teudot/reports; add minimal support collection(s) only if genuinely necessary (e.g. password-reset tokens or point award ledger for idempotency).
- Image storage: **Cloudinary free tier**, NOT Supabase. Teuda image uploads go through Express, using server-only Cloudinary credentials; MongoDB stores secure URL and Cloudinary public ID. JPG/PNG/WebP, max 5 MB, validate actual file type and size server-side and client-side; limit uploads; don't allow arbitrary executable files. Full-size clickable photo. No OCR, image processing, or thumbnails required.
- Place search/geocoding: **Geoapify free tier** for place/address autocomplete, geocoding and available localized names. Manual address entry fallback. Geoapify secret/API key handling appropriate to its API and documented; keep secrets server-side when practical.
- Email: **Resend free tier** for password-reset emails and rejection-reason emails; use verified sender configuration and document domain/sandbox limitations.
- Search: **MongoDB Atlas Search** for typo-tolerant restaurant-name search, partial search, relevance; document and include required index definitions/setup, including what is or is not available on the selected free-tier configuration. Create **`ATLAS_SEARCH_SETUP.md`** with the exact index name, copyable JSON index definition(s), Atlas UI setup steps, verification instructions and troubleshooting. Do not assume Mongoose indexes automatically create Atlas Search indexes or claim the index exists without checking. Provide a working simpler Mongoose search fallback if Atlas Search is unavailable. Avoid claiming fuzzy matching works unless verified. Do not add Elasticsearch/Algolia or a paid service.
- Testing: **Vitest**; primarily meaningful backend service tests with mocked repositories, plus appropriate focused tests of important rules. No mandatory Playwright/Cypress/Supertest or heavyweight test infrastructure.
- Environment variables: `.env.example` for frontend/backend, `.env` ignored, no secrets committed. Local dev only.

## 3. CORE DATA MODEL

Use separate Mongoose models and ObjectId references. Make schema fields/enum choices explicit, add timestamps and appropriate indexes. Suggested structure (adjust only when needed to meet behavior):

### User
`email` (unique, normalized), `passwordHash`, `role` (`USER`/`ADMIN`, default USER), `points` (integer, default 0, private), timestamps. Do not expose passwordHash. Secure single-use short-lived password reset tokens (prefer hashed tokens in DB, expiration and consumption; separate minimal model or fields). No email verification. All public registrations must assign `USER` server-side. Never accept client-controlled role, points, or privileged fields at signup. ADMIN may only be provisioned by the secure seed script or deliberate database administration; no public admin-registration path.

### Restaurant
`name`, optional localized name(s) where reliably known, `address`, optional localized address(s), `city` if obtainable, `latitude`, `longitude`, optional `geoapifyPlaceId`, optional `phone`, `website`, `foodType` (`MEAT`/`DAIRY`/`PAREVE`), `categories` array from standardized values (`RESTAURANT`, `CAFE`, `BAKERY`, `HOTEL`, `CATERING`, `FAST_FOOD`, and a few sensible additions), optional `foodKeywords`/food tags for bilingual food search, optional `claimedHechsher`, optional `claimedKashrutLevel` (`RABBANUT`/`MEHADRIN`), `status` (`PENDING`/`APPROVED`/`REJECTED`), `submittedBy` ref, optional admin-only `adminNote`, required `rejectionReason` when rejected, optional `kosharotUrl` (admin-verified manually), optional duplicate-warning metadata, timestamps. Add indexes for coordinates and search/filter fields. Approved restaurants only are public.

### Teuda
`restaurant` ref, `hechsher` standardized option or `Other` custom text, `kashrutLevel` (`RABBANUT`/`MEHADRIN`), `expirationDate` (date-only semantics in Israel; avoid timezone off-by-one errors), `photoUrl`, `cloudinaryPublicId`, `mashgiachName`, `mashgiachPhone`, `status` (`PENDING`/`APPROVED`/`REJECTED`), `submittedBy` ref, optional admin-only `adminNote`, required rejection reason if rejected, timestamps. A restaurant can have multiple teudot; never overwrite old approved evidence when a new one is merely submitted.

### Report
`restaurant` ref, optional `teuda` ref, `submittedBy` ref, `type` (`GENERAL`/`KASHRUT_UPDATE` or a small sensible set), `description`, optional `proposedHechsher`, optional `proposedKashrutLevel`, `status` (`PENDING`/`RESOLVED`/`REJECTED`), `adminNote` private, `rejectionReason` required if rejected, explicit `correctionApplied` flag or equivalent to distinguish actual changes from simple resolution, timestamps. Admin applies accepted corrections; users cannot edit existing approved records directly.

### Hechsher options
Provide a small maintained standardized bilingual list of common hechsher options, plus `Other` free text. Keep choices consistent across forms and filters. A seed/config script may initialize these options; avoid creating an unnecessary complex schema unless needed.

### Points idempotency
Provide a clear mechanism (e.g. an award record with a unique source/type key or guarded award flags and transactional/atomic updates) to prevent repeated points when an admin repeats an action. Explain any MongoDB Atlas transaction prerequisites; prefer simple safe idempotency. Do not grant points on pending/rejected submissions.

## 4. ROLES, AUTHENTICATION, SECURITY

- Anyone can browse approved restaurant listings/details/search/map without logging in.
- Registration/login with bcrypt hashes, JWT signed with server secret, 24-hour expiration. `Authorization: Bearer <token>` on protected calls.
- Backend `authMiddleware` verifies JWT and attaches trusted user identity; `adminMiddleware` requires ADMIN. Validate roles and ownership on server, not merely hidden buttons. Ordinary USER can create submissions/reports but **cannot directly edit/delete existing restaurant, teuda, report or approve anything**. ADMIN has full CRUD and moderation authority.
- Frontend uses Zustand persist with token in localStorage and a shared Axios instance. Request interceptor attaches token. An invalid/expired JWT from an authenticated protected request clears auth state and leaves the visitor on the current public page (logged out); attempting protected action asks for login. Do **not** log out on 403, network failure, 500, or wrong-password 401 from login.
- Password reset: request by email, generate unpredictable short-lived single-use token, store only a hash, email link via Resend, validate expiry/usage, hash new password with bcrypt, invalidate token. Avoid account enumeration in reset-request responses.
- Validate/sanitize input using Zod and Mongoose; validate URLs, file size/type, dates, object IDs; prevent NoSQL injection via untrusted query objects; protect against XSS and unsafe links; rate-limit sensitive auth endpoints and upload endpoints reasonably. CORS configured for local Vite frontend origin via environment variable (do not blindly open origins). Never leak stack traces or secrets in production-like responses.
- Centralized Express error middleware and consistent error shape. Clear, user-friendly frontend try/catch errors. Avoid complicated custom error frameworks.
- Disable submit/approve buttons while requests are pending; show loading state; backend guards against accidental duplicate requests where necessary.

## 5. KASHRUT STATUS — CRITICAL SHARED BUSINESS LOGIC

These rules must be implemented consistently in **backend search, map queries, list previews, detail pages, and filters**, preferably through reusable service/helper logic. Date calculations use Israel-local calendar dates, not naive UTC timestamp comparisons.

1. **VERIFIED**: ADMIN-approved teuda with expiration date today or later. Publicly show its hechsher, level, expiration, photo, mashgiach name and phone.
2. **EXPIRED (RECENT)**: ADMIN-approved teuda whose expiration is past but within the last **six calendar months**. Still visible publicly with prominent EXPIRED labeling. Retain in database indefinitely.
3. **OLD EXPIRED**: teuda expired **more than six calendar months ago** is **ADMIN-ONLY**. Never expose its details through public API, search, or detail page, even when another newer teuda exists. Do not allow ordinary users to report against admin-only teuda.
4. **UNVERIFIED**: admin-approved restaurant has a claimed hechsher and/or level without matching valid/recent verified evidence. Clearly mark as UNVERIFIED, not approved certificate. Show distinct unverified claims even alongside verified evidence if they concern a different/higher level; suppress redundant claims duplicating verified evidence.
5. **UNKNOWN**: no valid/recent public teuda and no claimed kashrut. Hide UNKNOWN restaurants from default results unless **Include Unknown** enabled. An approved restaurant may still have UNKNOWN status.
6. Priority for primary preview: **verified MEHADRIN → verified RABBANUT → unverified MEHADRIN → unverified RABBANUT → recent expired → UNKNOWN**. When multiple certificates/claims exist, show the primary hechsher and a `+N more` indicator; full details show all relevant evidence. Ensure the preview doesn't misleadingly hide an important expired status.
7. **Hide Expired** filter removes expired evidence/results relying solely on expired evidence, but does not hide a restaurant that also qualifies via valid teuda or unverified claim. **Hechsher and level filters can match verified evidence, recent expired evidence (unless hidden), or an explicitly labeled unverified claim.** Unknown handling remains explicit.
8. A restaurant may have multiple approved certificates; verified Rabbanut + verified Mehadrin can coexist. **Conflict warning** if a proposed teuda has the same kashrutLevel as another currently valid approved teuda for the same restaurant. Warning is advisory only; ADMIN may override. Never block admin approval solely on conflict.
9. Do not store a mutable `EXPIRED` status; derive from certificate expiration dates.
10. UI must never imply KosherRadar itself is a rabbinic certifier; show source/evidence and status transparently.

## 6. SUBMISSION AND ADMIN WORKFLOWS

- USER submits new restaurant → PENDING; may submit teuda with it → PENDING. **Cannot approve teuda until restaurant APPROVED**. Admin-created restaurant/teuda may be approved immediately.
- USER submits new teuda for existing approved restaurant → PENDING; existing approved teudot remain visible unchanged until new one approved. ADMIN can edit pending submission before approval, and edit approved records directly without making them pending.
- USER submits correction/report; ADMIN reviews and, if accepted, **actually applies changes** to the relevant restaurant/teuda. Only an applied correction qualifies for correction points. Admin can resolve informational report without applying correction.
- Admin dashboard tabs: **Pending Restaurants**, **Pending Teudot**, **Pending Reports**, **Expiring Soon** (approved teudot expiring in next 30 days), **Manage Restaurants** (search/edit/delete approved records, see pending/older historical certificates, admin notes). No analytics dashboard required.
- Admin rejection of restaurant, teuda, or report/correction **requires a reason**. Save it and send contributor an email with reason using Resend. Email delivery failure must be logged and clearly surfaced to admin if possible, but must **not roll back the completed database decision**. Do not show private admin notes to public or email them. No user-facing rejection-history page.
- Admin can delete closed restaurant and associated teudot (also handle Cloudinary assets safely where appropriate); admin can delete erroneous teuda. Do not delete automatically on expiration. Preserve integrity of reports/points when deleting; choose and document a reasonable consistent policy.
- Detect possible duplicate restaurant submissions against both PENDING and APPROVED records using normalized names, address, geographic proximity, phone and Geoapify place ID where available. Show suspected duplicates to admin, but **never automatically block/reject** a legitimate restaurant. Use bounded queries, not expensive full scans when avoidable.
- Admin may attach a **manually verified Kosharot restaurant-page URL**. Public detail page shows “View on Kosharot.” Do not scrape Kosharot, automatically infer recommendation, or show unverified endorsement.

## 7. PRIVATE CONTRIBUTION POINTS

- `+3` only when a USER-submitted **new restaurant with teuda** has BOTH restaurant and associated teuda approved. Do not award for restaurant-only submission or mere unverified claim.
- `+2` when USER submits a teuda for an **already existing restaurant** and the teuda is approved.
- `+1` when a USER report/correction results in an **actual admin-applied correction**, not merely marked RESOLVED.
- `0` for rejected, unverified claim without certificate, or no applied correction.
- Private points displayed in simple profile/account area; no leaderboard, badges, or My Contributions page. Protect from double awards on repeated approvals or retries. Define what happens if restaurant and teuda are approved in either order (teuda cannot be approved until restaurant approved) and ensure points are awarded once at the correct point.

## 8. SEARCH, AUTOCOMPLETE, FILTERS, LIST VIEW

- Public homepage has **one main search for restaurant NAME and FOOD TYPE/FOOD KEYWORDS only**. Do NOT search hechsher/certification names in the main search. **Location is a separate field**. Do not try to parse a combined query like `pizza Jerusalem` into both fields; user should choose location separately.
- Restaurant name search supports Hebrew and English normalization, partial matching, reasonable typos/fuzzy search, relevance ranking. Food searches are bilingual via maintained synonyms/tags (e.g. `pizza` finds Hebrew `פיצרייה`, and `פיצה` finds relevant English-tagged pizza places). Don't depend on unreliable machine translation for arbitrary text.
- Search suggestions after **2 characters**, **300ms debounce**. Show restaurant name, city/address, and primary kashrut label. Clicking a specific suggestion goes **directly to `/restaurants/:id`**. Pressing Enter/Search without selecting a suggestion opens results.
- Location autocomplete/geocoding via Geoapify, manual location/address entry fallback, optional current geolocation with user permission. Never require geolocation to browse. City and street names localized where Geoapify provides reliable names.
- Filters: kashrut level `Any/RABBANUT/MEHADRIN`; separate **specific hechsher multi-select**; **food type multi-select** (`MEAT/DAIRY/PAREVE`); **category multi-select** (restaurant, cafe, bakery, hotel, catering, fast food, etc.); **Hide Expired**; **Include Unknown**; distance radius **1/5/10/25/50 km** only when a search location exists.
- With location: nearest matching restaurants first, distance shown, respect selected radius. Without location: relevance first if text entered; otherwise A–Z. Filtering and sorting on backend.
- **List View** shows **20 results per backend-paginated request** with **Load More**, not all results downloaded at once. Reset pagination on changes to query, filters, or location. Use a stable ordering/tie-breaker to avoid duplicates across pages.
- User can toggle **List View OR Map View** (never show both at once). Preserve search and filters while switching. Save selected view in localStorage; first visit defaults to List View.
- List cards show name, food type, categories as appropriate, primary kashrut status/hechsher and `+N more` where relevant, distance when location selected, and quick **Call** (if phone exists) and **Waze** actions. Waze URL uses coordinates. No fabricated ratings/reviews.
- Handle empty search, no matches, loading, errors, and search-index-unavailable fallback gracefully.

## 9. MAP VIEW

- Leaflet + OpenStreetMap with distinct branded KosherRadar markers, clustering when zoomed out.
- Map initially centers on the selected search location if provided; otherwise show **Israel as a whole**. If the user moves/zooms map, load APPROVED matching restaurants in the **currently visible map bounds**, not just the 20 list results. Respect applicable text/kashrut/food/category/expiry/unknown filters.
- Debounce map bounds requests and cancel/ignore stale responses to prevent race conditions. Avoid huge payloads at country zoom; implement safe bounds-query limits/clustering strategy and communicate if results are capped. Do not silently present incomplete map coverage as exhaustive. Geographic query should be efficient with 2dsphere index and correct GeoJSON `[longitude, latitude]` ordering; retain lat/lng for display.
- Map marker hover/click popup (touch-friendly) shows name, food type, primary hechsher/kashrut status, `+N more`, Call if phone, Waze navigation, and View Details. Moving map **does not change selected search location**; map viewport independently controls markers. Radius behavior must be intuitive: when a selected radius is active, respect its geographical constraint as well as viewport, or clearly communicate why no markers are visible.

## 10. RESTAURANT DETAILS AND SUBMISSION FORMS

- Public `/restaurants/:id` for approved restaurants only. Show name, address, food type, multiple categories, phone, website, available teudot (valid + expired within six months), clear statuses, photos openable at full size, hechsher, level, expiration, mashgiach name and phone, distinct unverified claims, optional admin-verified Kosharot URL.
- **Google Maps** navigation link on detail page using coordinates; **Waze** on list/map quick actions. Share button uses Web Share API if available, clipboard URL fallback. Validate safe external URLs.
- Logged-in users can propose a new restaurant, teuda, or correction/report. Anonymous users are prompted to log in for submissions.
- Geoapify place selection prepopulates name, address, coordinates, and optional phone/website if available. Manual fallback with geocoded address when possible; if geocoding unavailable, do not invent coordinates. Explain to user when map placement requires valid coordinates. Duplicate detection warns admin rather than blocking user.
- Hechsher input uses standardized options + `Other` free text; food type and categories are clearly separate. Teuda upload requires image, expiration, hechsher, kashrut level and mashgiach details per validation requirements. Show upload progress/loading and success/error feedback. Make form validation clear in both languages.

## 11. BILINGUAL UI, ACCESSIBILITY, SEO

- Complete **English and Hebrew UI** from MVP, with persistent language toggle, idiomatic translations, proper RTL/LTR document direction and layout (including forms, cards, nav, filters, map UI). Default language can be chosen sensibly; persist preference. Avoid untranslated labels or raw enum strings.
- Standardize display labels for hechsher, categories, levels, statuses, and validation messages. Restaurant names/addresses use reliable localized values where available; do not fabricate translations of user-supplied proper names.
- Mobile-first responsive UI for four size ranges: `<640`, `640–767`, `768–1023`, `>=1024` px. Clean white/green aesthetic, readable text, restrained shadows, clear verified/unverified/expired distinctions that do not rely on color alone, keyboard navigation, accessible buttons/forms, meaningful empty states.
- Basic SEO: page title, description, semantic HTML, social sharing metadata where feasible for client-rendered SPA; do not add SSR or complex SEO infrastructure. Document limitations of dynamic per-restaurant metadata in SPA if applicable.

## 12. EXTERNAL SERVICE FAILURE HANDLING

- Geoapify unavailable: manual restaurant entry and non-location browsing remain possible; do not fabricate addresses/coordinates.
- Cloudinary unavailable: show honest upload error; never create approved-looking certificate without stored photo.
- Resend unavailable: moderation decisions persist; log/report failed notification, with clear admin status where feasible. Password reset cannot claim email sent if it wasn't, while avoiding email enumeration.
- MongoDB unavailable: show useful error, don't pretend data saved.
- Atlas Search index unavailable: use documented Mongoose fallback search, and record degraded fuzzy-search capabilities in README/PROGRESS. Avoid unsafe large scans in production; apply limits.
- All external services must fit free tiers; document setup and any current limitations, rather than assuming unlimited free usage.

## 13. API AND ARCHITECTURE EXPECTATIONS

Design a clear REST API with sensible endpoints for auth, users/profile, restaurants, teudot, reports, admin approvals/rejections/edits, autocomplete, search/map bounds, location proxy where appropriate, and upload. Use correct HTTP verbs/status codes, JSON responses, pagination metadata, and centralized validation/error middleware. Keep public vs admin serializers/query projections separate to prevent leaking old teudot, private notes, emails, password hashes, reset tokens, or private points. Verify admin authorization at every admin endpoint. Define an explicit policy for filtering and status derivation; reuse it instead of copy/pasting conflicting logic across endpoints.

Backend folder baseline:
```
backend/
  src/
    routes/
    controllers/
    services/
    repositories/
    models/
    middleware/
    schemas/
    config/
    utils/          # only if useful
    app.js
    server.js
  scripts/          # seed admin / optional search setup
  tests/
  package.json
  .env.example
```
Frontend folder baseline:
```
frontend/
  src/
    pages/
    components/
    api/
    stores/
    hooks/
    types/
    locales/        # translations
    App.tsx
  package.json
  .env.example
```
Use simple naming and imports, not gratuitous layers. Keep frontend and backend dependency management strictly separate; do not introduce a shared root runtime `package.json` unless demonstrably necessary. Root documentation and progress files are fine.

## 14. SEEDING AND CONFIGURATION

Provide a safe idempotent seed script for the **first ADMIN account** using credentials supplied via environment variables (never hardcode password) and standardized hechsher options if stored in DB. Do **not** seed fake restaurants, fake teudot, or fake reviews. Provide clear local MongoDB Atlas connection, Cloudinary, Geoapify, Resend, JWT, and frontend URL configuration instructions, including Atlas Search index setup and required indexes. Provide `.env.example` files and a root README with exact install/start/test/build commands. Create `ATLAS_SEARCH_SETUP.md` with copy-paste-ready Atlas Search index JSON and manual setup instructions. Never pretend the index is created merely because code or Mongoose schema indexes exist.

## 15. TESTING AND DEFINITION OF DONE

Write meaningful Vitest tests for the highest-risk business rules, including at minimum:
- Valid vs recent-expired vs >6-month-old admin-only teudot, date boundaries, timezone behavior.
- Public data sanitization and filtering; hide unknown/hide expired; verified/unverified claims; priority and filter matching.
- Cannot approve teuda for unapproved restaurant; conflict warning is overrideable.
- Role checks/ownership and ordinary users blocked from admin actions.
- Point awards +3/+2/+1, zero for ineligible actions, no double award on repeated approvals.
- Rejection requires reason; moderation persists even if email fails.
- Duplicate restaurant detection flags rather than blocks.
- Search/filter/pagination and map bounding query logic where testable.

At the end:
1. Install dependencies, run both servers, run frontend TypeScript check/build, run Vitest, fix all discovered errors. Do not mark success if commands fail.
2. Exercise real frontend → Express → MongoDB flows when credentials are configured. Verify actual Cloudinary upload, Geoapify, and Resend only if usable credentials are available; otherwise report **UNVERIFIED** explicitly, not “working.”
3. Check English/RTL Hebrew on desktop/mobile widths; confirm list/map exclusivity, view persistence, search/filter consistency and empty states.
4. Check for accidental secrets, mock data, TODO placeholders, broken routes, missing imports, unprotected endpoints, leaks of admin-only data, and inconsistent business rules.
5. Deliver concise final summary of what was implemented, tests/build results, missing external setup, known limitations, exact commands to run, and Git commit list.

## 16. SEPARATE MILESTONE SESSIONS, CHECKPOINTS AND REAL GIT HISTORY

**IMPORTANT: Do not implement the whole project in one agent session.** This file is the authoritative **master specification**, not authorization to implement all milestones immediately. Each Cursor Agent conversation implements **one milestone only**. The first conversation implements **Milestone 1 only**; after its verification and commit, **STOP and request my explicit approval**. Start a **new Agent conversation** for each subsequent approved milestone to reduce context overload. Do not automatically continue into the next milestone. Do not ask for approval for every file or minor decision within the active milestone; work autonomously within that milestone.

Milestones (complete vertical slices where feasible):

1. **Foundation and auth** — inspect workspace, scaffold separate frontend/backend packages, env examples, MongoDB/Mongoose models, app/server configuration, JWT/bcrypt authentication, backend auth/role/error/validation middleware, minimal React auth pages, persisted Zustand auth, Axios instance, protected actions, seed-admin script, basic auth tests and runnable local setup. Implement only what is necessary for this milestone; do not build later feature pages yet.
2. **Submissions and image upload** — restaurant, teuda, and report submission workflows; Cloudinary integration, validation, manual entry, initial duplicate warning mechanism, relevant UI and tests.
3. **Admin and kashrut business rules** — moderation dashboard, approval/rejection/edit/delete, certificate validity and visibility, conflicting teuda warnings, private notes, rejection emails, point-award idempotency, appropriate tests.
4. **Search and restaurant pages** — Atlas Search with working Mongoose fallback, `ATLAS_SEARCH_SETUP.md` with exact index JSON, bilingual food search, autocomplete, filters, pagination, restaurant details, status presentation, related tests.
5. **Maps, location and interface polish** — Leaflet visible-bounds queries and clustering, Geoapify, Waze/Google Maps/share, English/Hebrew translations and RTL/LTR, responsive Tailwind design across four ranges, view preference, UI integration.
6. **Full verification and fixes** — end-to-end manual checks against configured real services, Vitest coverage, build checks, security/data-leak review, fix discovered bugs, README completion, requirements reconciliation. If external credentials are missing, distinguish unverified integrations from tested ones.
7. **Hebrew academic project book** — after code/testing, generate `PROJECT_BOOK.md` **in Hebrew**, based strictly on the actual implementation. Document goals, user roles, system architecture, collection schemas and references, frontend/backend data flow, central REST endpoints, auth/security, core kashrut rules, external services, testing strategy and results, setup, limitations, and screenshots only if actually available (otherwise mark placeholders clearly). Do not claim unimplemented functionality exists. Update final documentation and commit.

At the beginning of **every** milestone session:
- **First session:** create or verify the complete root `PROJECT_SPEC.md` from this entire prompt before writing application code; include all requirements and all milestones, not just the active milestone. **Later sessions:** read the repository's `PROJECT_SPEC.md` as the authoritative master specification. Do not regenerate or edit it without explicit approval.
- Read `PROGRESS.md`, `REQUIREMENTS_CHECKLIST.md`, recent Git history and the relevant existing source files.
- Verify the previous milestone's state; preserve working code, existing commits and user changes.
- State the active milestone in `PROGRESS.md`. Do not silently expand scope into future milestones.

During the active milestone:
- Work independently on all tasks belonging to that milestone; make small reasonable implementation choices without interrupting me.
- Implement real connected functionality (frontend → backend → database where feasible), not placeholders pretending to work.
- Run relevant checks, fix discovered failures, and accurately mark integrations blocked by missing keys.
- Maintain `REQUIREMENTS_CHECKLIST.md`: list the specification's features/rules with `NOT STARTED`, `IN PROGRESS`, `IMPLEMENTED UNVERIFIED`, `TESTED`, or `BLOCKED`, plus relevant files/tests. Do not mark `TESTED` without evidence.

At the end of **each** milestone:
1. Run applicable tests/builds and document commands, results and limitations.
2. Update `PROGRESS.md` with completed work, tests, blockers, exact setup needed, next milestone and a ready-to-copy continuation instruction.
3. Update `REQUIREMENTS_CHECKLIST.md` accurately.
4. Make **real, incremental, descriptive Git commits** while completing this milestone using the feature branches, correct assigned commit authors, checks, and merges in section 19. Commit verified work and documentation; do not backdate or retroactively fabricate commits, or commit `.env` secrets. If any commit or merge fails, report why.
5. **STOP.** Summarize what was completed and ask for my approval to start the next milestone in a **new Cursor Agent conversation**. Do not begin it in this session.

If credentials are missing, implement and test what can be done honestly, document the exact account setup, and continue other work **within the current milestone**. Stop at the milestone boundary even if more could be done. If a session ends unexpectedly, `PROGRESS.md` must enable reliable resumption of the *same* unfinished milestone.

### Suggested prompt for each subsequent new Cursor Agent conversation

> Read the complete repository-root `PROJECT_SPEC.md` (authoritative master specification), `PROGRESS.md`, `REQUIREMENTS_CHECKLIST.md`, and the recent Git commits. Do not modify `PROJECT_SPEC.md` without my approval. Implement **only Milestone N** from section 16, preserving all existing functionality. Work autonomously within that milestone; test, fix, update both tracking files, make real incremental, appropriately attributed feature-branch commits and merge verified work as specified in section 19, then STOP and ask for approval before the next milestone. Do not claim untested integrations work. If Milestone N is not ready because the prior milestone is incomplete, explain and finish the approved milestone instead of skipping ahead.

## 17. OUT OF SCOPE — DO NOT ADD

No restaurant reviews/ratings, no favorites/following or kashrut-change push notifications, no leaderboard/badges, no My Contributions dashboard, no email verification, no OCR, no auto Kosharot scraping or automated recommendation claims, no native mobile app, no deployment/Docker, no elaborate analytics/admin audit trail, no AI translation of arbitrary names, no complex SSR, no expensive services, no unrelated bells and whistles. These are potential future features, not MVP requirements.

## 18. IMPORTANT CONSISTENCY RULES / EDGE CASES

- **List and Map are mutually exclusive.** List paginates by 20; map fetches visible bounds independently. Both share search/filters, but moving map doesn't rewrite the selected search location.
- Main search covers **restaurant names and food**, NOT hechsher or location. Location field separate. Hechsher only via filter.
- **Teudot older than six months after expiration are admin-only**, not public history. Public endpoints must filter these out server-side.
- **Approved restaurants only** in public browsing; claims are never mislabeled as verified certificates.
- A new pending teuda never replaces an old approved teuda until admin approval.
- **No automatic rejection** for suspected duplicates or certificate-level conflicts; warnings for admin. Only hard rule: teuda can't be approved until its restaurant is approved.
- Rejection reasons mandatory; admin notes private; rejection email failure doesn't undo DB decision.
- Points must be private, rule-based and idempotent.
- Authentication middleware belongs on backend. Expired authenticated token logs out client but stays on current public page; unrelated failures do not log out.
- **React TypeScript, backend JavaScript ES modules**; MongoDB/Mongoose, not PostgreSQL/Prisma; Cloudinary, not Supabase.
- **No deployment.** Local app and honest test verification only.

## 19. TWO-DEVELOPER TEAM GIT WORKFLOW — FEATURE-BASED OWNERSHIP, ALL SEVEN MILESTONES

KosherRadar is a two-person academic team project. **Organize branches, tasks, commits, and ownership by USER-FACING FEATURE or coherent functionality, NOT by backend versus frontend folders.** A feature may include React, Express, Mongoose, tests, and documentation in the **same branch**.

- **Developer A — Eli Mermelstein:** `Eli Mermelstein <elimermz@gmail.com>`.
- **Developer B — Moshe Silber:** `Moshe Silber <mosheyz770@gmail.com>`.

**Do not permanently assign Eli only backend or Moshe only frontend.** Both can own complete full-stack features. Distribute coherent features between the two teammates across milestones based on the team's actual agreed ownership/review, rather than alternating authors mechanically. For example, one teammate could own *authentication* (UI + API + database changes) while the other owns *restaurant discovery* (search UI + API + query logic). Those are **examples, not fixed assignments**. Record each feature's responsible teammate in `PROGRESS.md` before implementing it; do not falsely describe AI-generated code as personally typed by either teammate. The team must review and take responsibility for attributed contributions and comply with academic disclosure rules.

### Required procedure

1. **Feature branches, not layer branches:** Check `git status` before beginning. Branch from a clean and up-to-date `main` using a descriptive feature name such as `feature/authentication`, `feature/restaurant-submission`, `feature/teuda-approval`, `feature/restaurant-search`, or `feature/map-discovery`. **Avoid `backend/...` and `frontend/...` branch naming** unless a task genuinely has no feature-level scope. Never discard existing uncommitted changes.
2. **One feature across the full stack:** Develop everything required for a coherent feature on its branch, including any frontend, backend, DB, validation, tests, and relevant docs. Keep dependent changes together instead of creating artificial separate branches solely because code lives in different folders.
3. **Incremental, meaningful commits:** Commit as small, working logical substeps are implemented and verified, throughout the milestone—not a single giant commit afterward. Commit messages should describe functionality (e.g., `Add signup endpoint and validation`, `Connect registration form to API`, `Test authentication errors`), not merely `backend work` or `frontend work`. Stage deliberately and inspect `git diff --cached` so no unrelated changes or secrets are included.
4. **Git attribution follows feature responsibility, not directory:** For each commit, use `--author` with the identity of the teammate genuinely responsible for reviewing/owning that feature or subtask, **regardless of whether the changed files are frontend, backend, or both**. Example commands:
   - `git commit --author="Eli Mermelstein <elimermz@gmail.com>" -m "Implement authentication workflow"`
   - `git commit --author="Moshe Silber <mosheyz770@gmail.com>" -m "Implement restaurant search workflow"`
   Within a shared feature, distinct commits can have different authors **when ownership of those actual substeps differs**. Do not assign authors solely by path, arbitrarily alternate identities, invent simultaneous development, falsify timestamps, or rewrite history to simulate collaboration. Git author and committer are different metadata; configure the committer identity legitimately.
5. **Merge tested features:** Once an entire feature works and passes applicable checks, merge its branch into `main`, preferably using `git merge --no-ff <feature-branch>` to preserve feature history. Check the merge and delete the branch only after success. Resolve conflicts carefully without discarding either teammate's work. No force-push, hard reset, or history rewriting to create an artificial timeline.
6. **Milestone boundaries:** A milestone may contain several feature branches. At the milestone's end, finish tests, merge completed features, update `PROGRESS.md` and `REQUIREMENTS_CHECKLIST.md` on an appropriate branch, commit the updates, and run `git log --format="%h | %an <%ae> | %s" -n 20` to verify that commits are feature-focused and author metadata reflects documented responsibility. Do not manufacture commits merely to ensure both names appear in every milestone.
7. **One Cursor Agent session per milestone:** Feature ownership does **not** mean creating two parallel AI agents. Complete approved features safely within the currently approved milestone, then **STOP** as required in section 16. Keep this workflow in `PROJECT_SPEC.md` for future sessions.

**START MILESTONE 1 ONLY NOW (FIRST SESSION ONLY).** First inspect the workspace and **create/verify repository-root `PROJECT_SPEC.md` containing this entire specification and all seven milestones**. Then create/update `PROGRESS.md` and `REQUIREMENTS_CHECKLIST.md`, implement and test Milestone 1, using the real feature-branch commits and author attribution specified in section 19; include `PROJECT_SPEC.md` in the first appropriate commit and merge completed work to `main`. **STOP after Milestone 1** and request approval to begin Milestone 2 in a fresh Cursor Agent conversation. Your final message must accurately distinguish what is working, tested, blocked or still requires my configuration.
