# KosherRadar — standing instructions for Cursor agents

Read this file, `PROGRESS.md`, and `FIX_TRACKER.md` before beginning work. `FIX_TRACKER.md` is the single source of truth for identified problems and their resolution. `AUDIT_FINDINGS.md` holds the evidence behind the current tracker. Do not treat a previous agent's completion claim as proof; reconcile these documents with the Git state first.

When a session is started with "Read the project instructions and continue" (or the same request in other words), do not ask which milestone to work on. Read the files above and the `NEXT AGENT ONBOARDING` section of `PROGRESS.md`, verify the Git state, then resume an unfinished milestone or begin the next incomplete one.

## 0. Decisions, continuity, and onboarding

1. Make reasonable decisions independently. Do not stop for every minor product, UX, or technical choice. Follow the existing architecture, conventions, and business rules. Choose the simplest reliable solution and document the reasoning in `PROGRESS.md`. Ask for approval only when a decision could cause data loss, affect production, materially change kashrut rules or public status labels, change point amounts or who qualifies for points, require real credentials, add a major dependency, or make a significant irreversible change.
2. The audit program is split in `FIX_TRACKER.md` into **MUST FIX NOW** and **LATER**. Work MUST FIX NOW issues one at a time. Do not start LATER items unless the user asks. Stop when every MUST FIX NOW issue is verified, blocked, or deferred, or when a decision needs approval. Do not walk all 11 milestones for their own sake.
3. Keep `FIX_TRACKER.md` accurate after every fix. Keep `PROGRESS.md` updated with important decisions, completed work, and remaining tasks. Create a Git checkpoint after each independently verified fix when that commit would contain only that fix and its tracking notes.
4. Before finishing a milestone, stopping, or handing off, update the `NEXT AGENT ONBOARDING` section of `PROGRESS.md`. Include what was completed, files modified, tests and results, outstanding issues, blockers, and the exact next step. Refresh that section throughout the session so an unexpected stop does not drop the thread.
5. A new session continues from those documents. It does not wait for a repeated explanation of the milestone plan.
6. Do not re-ask questions that the requirements, the tracker, or an earlier decision already answer. Prefer a backwards-compatible, safe solution. Document assumptions. Never bypass tests, validation, or security to make something pass.

## 1. General engineering rules

1. Always read `AGENTS.md`, `PROGRESS.md`, and `FIX_TRACKER.md` before beginning work.
2. Inspect Git status before modifying files.
3. Search the repository to identify relevant files, then read the targeted implementation and its dependencies. Do not waste context reading unrelated files.
4. Verify suspected problems before changing code.
5. Follow the existing controller → service → repository architecture.
6. Preserve existing conventions, utilities, TypeScript types, and validation patterns.
7. Prefer minimal, targeted, maintainable changes over large rewrites.
8. Avoid unnecessary dependencies.
9. Never silently remove existing functionality.
10. Never weaken validation or authorization to make a feature work.
11. Never delete, skip, disable, or loosen a test merely to obtain a passing test suite.
12. If a test is genuinely incorrect or outdated, document why before changing it.
13. Preserve English and Hebrew support, including RTL layouts.
14. Do not introduce unrelated enhancements.
15. Never claim a feature or integration has been tested unless it was actually tested.
16. Never overwrite, discard, or accidentally commit unrelated user changes.
17. Maintain compatibility with existing data and users whenever possible.

## 2. Milestone execution rules

Work on exactly one milestone per Cursor session.

Do not automatically begin the next milestone.

At the start of a milestone:

1. Read the permanent rules and project tracking files.
2. Inspect the actual repository state.
3. Identify the specific issues assigned to the milestone.
4. Confirm which issues remain outstanding.
5. Investigate root causes.
6. Implement the smallest reliable fixes.

Within the milestone, process individual fixes sequentially and update their statuses as work progresses.

At the end:

1. Run appropriate verification commands.
2. Update the tracker.
3. Update the progress document.
4. Document unresolved problems.
5. Provide a summary for the user.
6. Update `NEXT AGENT ONBOARDING` in `PROGRESS.md`, then stop. The next session continues from that section. Do not start the next milestone in this session.

If an individual milestone becomes too large for one session, complete as many independent fixes as can be safely verified, document the remaining work, and stop with an accurate handoff.

Do not rush unfinished changes just to complete a milestone.

## 3. Persistent fix tracking

`FIX_TRACKER.md` must be the single source of truth for identified problems and their resolution.

Every issue must have a unique identifier such as `M1-001`, `M1-002`, `M2-001`, `M2-002`.

Each tracked issue must include:

- Unique issue ID
- Milestone
- Issue description
- Priority
- Status
- Evidence of the original problem
- Root cause, once determined
- Relevant files/functions
- Planned solution
- Files changed
- Tests added or modified
- Actual verification commands and results
- Blockers or limitations

Allowed statuses:

- `NOT STARTED`
- `INVESTIGATING`
- `IN PROGRESS`
- `BLOCKED`
- `FIXED — UNVERIFIED`
- `VERIFIED`
- `ALREADY WORKING`
- `DEFERRED`

Rules:

- Update the tracker immediately after completing or changing the state of an individual fix.
- Do not mark an issue `VERIFIED` simply because the code was modified.
- Record the actual verification command, exit status, and relevant result.
- Use `ALREADY WORKING` when an investigation confirms the suspected issue does not exist.
- Record evidence supporting that conclusion.
- Never count deferred or blocked work as verified.
- If an issue needs a decision from the approval list in section 7, mark it `BLOCKED` and document the question. Decide smaller product and technical questions, record the assumption, and continue.

## 4. PROGRESS.md

Preserve the existing content and historical records in `PROGRESS.md`.

Use it for:

- Current milestone
- Current fix ID
- Most recently completed work
- Major architectural decisions
- Known blockers
- Milestone summaries
- Important test results
- Agent handoff instructions
- A `NEXT AGENT ONBOARDING` section that a new session can follow without asking which milestone to start
- Next recommended action

Do not duplicate the full issue tracker.

Reference `FIX_TRACKER.md` for detailed issue statuses.

If displaying progress counts or percentages, derive them from the tracker rather than maintaining contradictory independent numbers.

## 5. Git checkpoints

During implementation sessions, create a Git checkpoint after each independently verified fix.

Before committing:

- Check Git status.
- Confirm exactly which files belong to the fix.
- Run relevant tests.
- Update the tracking documentation.
- Stage only related files.
- Use a descriptive commit message.

Example:

`fix(m1-001): repair certificate submission handling`

Use a dedicated working branch where appropriate.

Never overwrite existing user changes or make destructive Git operations.

If the repository contains unrelated uncommitted changes, preserve them and exclude them from the checkpoint.

If an issue is only partially implemented, do not create a misleading verified-fix commit.

## 6. Agent handoff rules

Do not rely on detecting an approaching context limit.

Instead:

- Update `FIX_TRACKER.md` after every individual fix.
- Update `PROGRESS.md` whenever a significant implementation decision occurs.
- Create verified Git checkpoints throughout the session.
- Finish each milestone session with a handoff.

Before ending or handing off, write the same facts into `NEXT AGENT ONBOARDING` in `PROGRESS.md` and record:

**Current position**

- Current milestone
- Current issue
- Last verified fix
- Next outstanding issue

**Completed work**

- Files changed
- Behavior implemented
- Tests executed
- Results
- Important decisions

**Incomplete work**

- Partially implemented changes
- Failing tests
- Blockers
- Known limitations

**Instructions for the next agent**

- Relevant files
- Exact next task
- Verification commands
- Any changes that must not be repeated

A new agent must reconcile the documentation against the actual Git state before continuing.

Never assume that a previous agent's statement of completion is sufficient evidence.

## 7. Safety and approval boundaries

Stop and ask for explicit user approval before:

- Destructive database operations
- Schema migrations requiring modification of existing records
- Data backfills
- Changes to the authentication storage model
- Major authentication or authorization redesigns
- Introducing new dependencies
- Changing established point-awarding rules
- Changing kashrut classifications or public-facing verification terminology
- Accessing or modifying production data
- Sending real emails
- Uploading, modifying, or deleting real user files through external services
- Changes that might irreversibly affect existing users or data

For additive schema changes, first assess compatibility with existing documents. Document whether a migration or backfill is actually needed, along with a rollback approach.

Do not create unnecessary migrations.

For now, retain the existing localStorage authentication approach. Review its security risks, implement appropriate token invalidation during the relevant milestone, and defer an HttpOnly-cookie migration unless separately approved.

Hebrew UI text introduced or changed by an agent must be flagged for native-speaker review.

## 8. Environment safety

- Never read, display, print, or commit secrets from `.env` files.
- Inspect `.env.example` or documented environment-variable names instead.
- Never run automated tests against production databases.
- Use isolated development/test databases and service resources.
- Never assume an environment is safe based solely on its variable name.
- Do not call live Cloudinary, Resend, Geoapify, or Atlas services during the initial audit.
- Use mocks for automated unit testing.
- Real integration testing must use explicitly approved isolated test resources.
- Never claim mock-based tests prove that a real integration works.

MongoDB transactions require a compatible replica-set or sharded deployment.

If tests require transactions, use an isolated replica-set test environment, such as `mongodb-memory-server` in replica-set mode where appropriate and compatible with the existing test infrastructure.

Do not install packages merely to satisfy this requirement without approval.

## 9. Verification standards

Before declaring any fix verified, record:

1. Test command executed.
2. Exit code.
3. Passing/failing test count when available.
4. Whether the frontend/backend build succeeded.
5. Whether linting and type checking passed, if applicable.
6. Whether browser behavior was actually tested.
7. Whether external integration behavior was mocked or tested against an approved real service.

Discover the actual commands from the repository's package scripts. The commands found in the 12 October 2026 audit are listed in `AUDIT_FINDINGS.md` under "Verification commands". Do not invent command names or assume the project has scripts it does not contain.

If a verification command cannot run, explain why and leave the appropriate issue unverified.
