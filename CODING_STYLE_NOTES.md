# Coding Style Notes

This file records what was (and was not) verified about each teammate's handwritten JavaScript/TypeScript, as required by section 0A of `PROJECT_SPEC.md`.

## Eli Mermelstein

- Profile: https://github.com/Elimer1
- Candidate repository: https://github.com/Elimer1/se_project_aroundtheus
- Status: **No verified JS/TS source samples available.**
- Why: during Milestone 1 the attempt to open the repository page was not approved/skipped, so no handwritten `.js`/`.jsx` source file was inspected. Nothing is claimed about Eli's personal style. (The public `gh-pages` branch is generated output and would not be a valid sample anyway.)

## Moshe Silber

- Profile: https://github.com/mosheyz
- Status: **No verified JS/TS source samples available.**
- Why: only the public repository list page was viewed (names such as `auth-app-test`, `AuthenticationFlow`, `CRUD-shapes`). No handwritten JS/TS file was opened, so no pattern is attributed to Moshe. Repository names alone are not evidence of code style.

## Project conventions actually used (chosen by the specification, not discovered)

These come from `PROJECT_SPEC.md` sections 0 and 0A and are our own rules, not claims about anyone's GitHub code.

Backend (`backend/`, plain JavaScript ES modules):
- Flow: route -> controller -> service -> repository -> Mongoose model.
- Small named exported `async` functions (`registerUserService`, `findUserByEmailRepo`, `loginController`), `const`, guard clauses with early `throw`/`return`.
- One tiny `AppError` class; errors forwarded to one central error middleware.
- Zod schemas live in `src/schemas/`, next to the feature they validate.
- 2-space indentation, semicolons, single quotes.

Frontend (`frontend/`, React + TypeScript):
- Functional components, `useState`/`useEffect` for local state, Zustand only for shared auth state.
- Axios calls live in named functions in `src/api/`, using one shared Axios instance.
- Event handlers named `handleSubmit`, `handleLogin`, etc.; explicit loading and error UI.
- 2-space indentation, semicolons, Tailwind classes for styling.
