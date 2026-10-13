# Email and password recovery milestone — 13 October 2026

## Scope and starting state

Verified local main `dc5dc24aab5ecac8701fd5083238d4de9f75a5b7`, including the accepted V2 merge. Dedicated branch: `feature/email-password-recovery`. Untracked `PRE_PUSH_REVIEW.md` is unrelated and must remain untouched/uncommitted. No merge, push, deployment, production access, or live email is authorized here.

The request assumes Gmail already exists, but this checkout uses Resend REST and has no Nodemailer dependency. The user's explicit Gmail/Nodemailer instruction authorizes replacing that transport and adding Nodemailer only. PROJECT_SPEC.md remains unchanged; this request overrides its historical Resend requirement.

Already implemented: random 256-bit reset tokens, hash-only storage, 60-minute expiry, atomic unused/unexpired consumption, compensating release on password-write failure, password hashing, tokenVersion JWT invalidation, IP rate limits, public-only rejection reasons, guarded moderation transitions, admin authority and zero-point rules. Preserve these.

Issues tracked in FIX_TRACKER.md: EP-001 delivery/templates; EP-002 recovery security/notifications; EP-003 recovery UX and verification. Process sequentially. No unrelated LATER work.

## Decisions

- Separate Gmail transport, bilingual HTML/text templates, and business services. SENT means SMTP recipient acceptance, not inbox delivery. Tests mock Nodemailer and never contact Gmail.
- No stored account language preference exists. Reset requests can supply the current UI language; moderation/password-change messages use English unless a supported preference is available. No language backfill/migration.
- Keep localStorage auth and existing tokenVersion model. No new auth storage or moderation/points rules.
- All new Hebrew copy needs native-speaker review (M8-004).

## NEXT AGENT ONBOARDING

Current branch: `feature/email-password-recovery`, starting at `dc5dc24`. Last verified fix EP-001: Gmail transport, configuration diagnostics, four bilingual templates, trusted-link validation, safe logs and EMAIL_SETUP.md. `cd backend; npm test -- tests/emailService.test.js` exit 0, 22 passed, Gmail mocked. Nodemailer installed with scripts disabled; npm reported zero vulnerabilities. Next issue EP-002: integrate password-change/approval notifications and harden recovery failure/neutral-response behavior. EP-003 covers frontend and full/browser verification. Read FIX_TRACKER.md and reconcile Git; preserve PRE_PUSH_REVIEW.md. No live services/credentials/database used. New Hebrew templates need native review.
