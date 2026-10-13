# Gmail email setup

KosherRadar uses Gmail SMTP through Nodemailer. No Resend account, custom domain, or DNS changes are required. The milestone request supersedes the historical provider in PROJECT_SPEC.md; that specification has not been edited.

Set server-only `EMAIL_USER` to your complete Gmail/Workspace address and `EMAIL_APP_PASSWORD` to a Google-generated 16-character app password. Spaces shown by Google are accepted. Never use the ordinary Google account password, commit credentials, or put these settings in Vite variables.

Enable Google 2-Step Verification, then create an app password for KosherRadar in [Google Account settings](https://support.google.com/accounts/answer/185833?hl=en). App passwords may be unavailable under organizational policy, Advanced Protection, or certain 2-Step Verification configurations. Google revokes app passwords when the account password changes; create a new one then. Use `CLIENT_URL` as the trusted frontend origin: HTTPS for hosted sites, HTTP only on localhost/loopback during development.

Missing or malformed credentials produce NOT_CONFIGURED with configuration-variable diagnostics. Authentication failures, timeouts, rejected recipients, quota/policy/network failures produce FAILED. Logs exclude provider response bodies, credentials, recipient addresses and reset URLs. The transport uses Gmail's TLS preset with 10-second connection/greeting/socket timeouts and no SMTP debug logging.

SENT means Gmail SMTP accepted the recipient, **not** that the message reached an inbox. Gmail may filter messages into spam, block suspicious sign-ins/server IPs, or enforce quota. [Nodemailer's Gmail guide](https://nodemailer.com/guides/using-gmail) documents approximate daily recipient limits of 500 for personal accounts and 2,000 for Workspace; account-specific restrictions may differ. [Google's sending-limit guidance](https://support.google.com/mail/answer/22839?hl=en-GB) is authoritative. Gmail rewrites sender addresses; KosherRadar uses the authenticated address with its brand name. This is transactional email only.

Templates: password reset, password changed, submission rejection (public reason only), and approval. Each has English LTR/Hebrew RTL HTML and plain text, escaped user content, inline styling, and the directory/non-certification footer. New Hebrew copy requires native-speaker review. There is no stored account language preference in the current model: recovery and password-change mail use the request's supported UI language; moderation defaults to English. No migration/backfill is needed.

New reset links use a URL fragment (`/reset-password#token=...`) so the secret is not sent to the frontend host. Legacy query links remain supported but may enter host logs on their first request. The page removes the token from the URL and holds it in memory only; refreshing the clean URL requires reopening the email. The frontend sends no referrers. Do not add analytics that capture recovery URLs or request bodies.

Automated tests mock Nodemailer, repositories, or service boundaries and never send real mail. They do not prove Gmail connectivity, inbox placement, client rendering or real MongoDB concurrency. A live test requires separately approved isolated resources and recipient; none was performed in this milestone.
