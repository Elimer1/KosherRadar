# Email and password recovery milestone — 13 October 2026

## Scope and starting state

Verified local main `dc5dc24aab5ecac8701fd5083238d4de9f75a5b7`, including the accepted V2 merge. Dedicated branch: `feature/email-password-recovery`. Untracked `PRE_PUSH_REVIEW.md` is unrelated and must remain untouched/uncommitted. No merge, push, deployment, production access, or live email is authorized here.

The request assumes Gmail already exists, but this checkout uses Resend REST and has no Nodemailer dependency. The user's explicit Gmail/Nodemailer instruction authorizes replacing that transport and adding Nodemailer only. PROJECT_SPEC.md remains unchanged; this request overrides its historical Resend requirement.

Already implemented: random 256-bit reset tokens, hash-only storage, 60-minute expiry, atomic unused/unexpired consumption, compensating release on password-write failure, password hashing, tokenVersion JWT invalidation, IP rate limits, public-only rejection reasons, guarded moderation transitions, admin authority and zero-point rules. Preserve these.

Issues tracked in FIX_TRACKER.md: EP-001 delivery/templates; EP-002 recovery security/notifications; EP-003 recovery UX and verification. Process sequentially. No unrelated LATER work.

## Decisions

- Separate Gmail transport, bilingual HTML/text templates, and business services. SENT means SMTP recipient acceptance, not inbox delivery. Tests mock Nodemailer and never contact Gmail.
- No stored account language preference exists. Reset/password-change requests supply the current supported UI language; moderation defaults to English. A supported stored preference takes precedence if one is available in future. No language backfill/migration.
- Keep localStorage auth and existing tokenVersion model. No new auth storage or moderation/points rules.
- All new Hebrew copy needs native-speaker review (M8-004).

## NEXT AGENT ONBOARDING

**Current position:** Email/password recovery implementation complete. EP-001, EP-002 and EP-003 VERIFIED in FIX_TRACKER.md. Branch `feature/email-password-recovery`; starting main `dc5dc24`. Checkpoints: `b3417b7` (Gmail/templates), `153cfcc` (backend safety/notifications); final EP-003 checkpoint is the commit containing this handoff (`git log -1 --oneline`). Main/source worktrees untouched, no merge/push/deploy.

**Completed files/behavior:** backend emailTransport/emailTemplates/emailService, env/example/package/lock; auth controller/routes/schemas; reset and moderation notification services; admin restaurant/certificate approval services; associated/new email, reset repository/service/HTTP and moderation tests. Frontend ForgotPasswordPage/ResetPasswordPage, authApi/errors, locale keys, resetToken and component tests, index.html referrer policy. README/EMAIL_SETUP document provider/setup; scripts/reviewPasswordRecovery.mjs provides repeatable fixture browser checks. Details in FIX_TRACKER.md.

Four templates: password reset, password changed, public-reason rejection, approval (restaurant/certificate transitions). English LTR/Hebrew RTL HTML + plain text with safe user content and trusted links. Gmail SENT/FAILED/NOT_CONFIGURED preserved. User explicitly requested Nodemailer; installed with scripts disabled, no other dependencies added, npm reported zero vulnerabilities. No private notes/marketing. Saved decisions/passwords survive notification failures; guarded approval retries do not resend. Existing admin authority/zero points, moderation and JWT tokenVersion rules unchanged. No schema migration/backfill.

Neutral forgot responses do not await account lookup/token writes. Recovery handles localized errors/loading/retry/invalid-expired links/password mismatch/show-hide and existing strength policy plus bcrypt's 72-byte UTF-8 bound. New fragment reset links never reach the frontend HTTP host; legacy query links still work. Tokens are removed from URL and held only in component memory; no referrers. Successful reset clears current local login, other sessions are invalidated server-side by existing tokenVersion update.

**Actual verification:** backend `npm test` exit 0, 42 files / 534 tests. Frontend targeted recovery/token run exit 0, 2 files / 14 tests; full `npm test` exit 0, 27 files / 170 tests. Frontend `npm run lint`, `npm run typecheck`, `npm run build` exit 0. Production JS 769.34 kB; existing >500 kB warning. Backend has no lint/typecheck/build scripts. CRLF-aware diff check exit 0. Existing jsdom navigation warning is non-failing. Database/SMTP tests mocked; HTTP tests use local fixture servers.

Browser: `node scripts/reviewPasswordRecovery.mjs` exit 0 using installed Chrome, actual production build and intercepted fixtures. Eight journeys (EN/HE at 375/768/1024/1280), 88 screenshots. Loading, confirmation/repeat request, rate/offline errors, fragment/legacy cleanup, password reveal/mismatch, expired/invalid links, successful reset and login navigation passed; zero exceptions/overflow/outgoing referrer headers. Inspected EN/HE mobile reset, HE mobile expired, HE desktop confirmation and EN desktop success screenshots. Local ignored evidence in `design-screenshots/email-password/`; `results.json` is authoritative, `partial-results.json` retains the earlier sandbox initialization timeout. Expanded Chrome process permissions resolved startup. Explicit viewport clipping corrected a Chrome RTL full-page capture offset without changing the app.

**Outstanding limitations:** Live Gmail connectivity, inbox delivery and email-client rendering not tested (M9-004 stays BLOCKED). No live database concurrency/transactions or browser login against a newly saved real password; fixtures/mocks are not integration proof. New Hebrew in emailTemplates/he.ts needs native review M8-004. Recovery background processing lacks a durable queue; rate limits are single-process/IP only. Same-token consumption is atomic, but distinct concurrent link issuance is not serialized; crash/release failure can still burn a link. Legacy query links can reach initial host access logs. Cleaned link refresh requires reopening the email. LocalStorage XSS risk remains; cookie migration stays deferred. No partially implemented work/failing checks. PRE_PUSH_REVIEW.md is preserved/excluded.

**Exact next step:** Stop; milestone implementation complete and awaiting user review. Reconcile Git before any next session. Do not start unrelated LATER work, merge, push, deploy, delete worktrees, repeat V2 redesign, or access credentials/services. If the user separately authorizes a live email check, follow EMAIL_SETUP.md with an approved isolated recipient/stack and record SMTP acceptance separately from inbox receipt. Native-speaker review remains outstanding.
