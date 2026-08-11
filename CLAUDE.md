# Bookshelf SPA

React 19 frontend for the community bookshelf app. Pairs with `bookshelf-api` (Rails JSON API backend).

## Tech Stack

| Layer           | Choice                                                                   |
| --------------- | ------------------------------------------------------------------------ |
| Language        | TypeScript (strict)                                                      |
| UI              | React 19                                                                 |
| Routing         | React Router v7 (`BrowserRouter`, `basename` from `BASE_URL`)            |
| Build           | Vite 6, port 3150                                                        |
| Package manager | Yarn 4.14.1 via Corepack                                                 |
| Formatting      | Prettier (defaults, `.prettierrc` is `{}`)                               |
| Linting         | ESLint v9 flat config + `typescript-eslint` + `react-hooks` + `jsx-a11y` |
| Testing         | Vitest + React Testing Library (`happy-dom`)                             |
| Pre-commit      | Husky — `format:check && lint && tsc -b && test --run`                   |
| CI              | GitHub Actions — format:check → lint → build → test → real-backend e2e   |
| E2E             | Playwright — mocked (`e2e/`) + real-backend parity (`e2e/real-api/`)     |

## Setup

```sh
corepack enable
yarn install
yarn dev        # dev server at http://localhost:3150
```

## Common Commands

```sh
yarn dev            # start dev server
yarn test           # watch mode
yarn test --run     # single run
yarn lint
yarn format
yarn format:check
yarn build          # type-check + production build
yarn build:netlify  # production build only (for Netlify)

yarn test:e2e              # mocked Playwright suite (playwright.config.ts, no backend needed)
yarn test:e2e:integration  # real-backend parity suite (playwright.real-api.config.ts)
```

## Playwright e2e

Two separate Playwright configs, intentionally not combined:

- **`playwright.config.ts`** / `e2e/` — the original suite. All `bookshelf-api` calls are
  mocked via `page.route` (`e2e/helpers/mock-api.ts`). Fast, no backend dependency, good
  component-level coverage. `testIgnore: "real-api/**"` keeps it from picking up the
  suite below.
- **`playwright.real-api.config.ts`** / `e2e/real-api/` — cross-app parity checks. Same
  fixture data and scenarios (auth, books, readings/rating, admin access control) as
  `community_bookshelf` and `bookshelf-islands`, but driving the _real_ `bookshelf-api`
  instead of mocks — this is the only project that actually proves the SPA+API pair
  behaves like the Rails monoliths. Its `webServer` array starts both `yarn dev` and
  `bookshelf-api`'s `bin/e2e_server` (a sibling checkout — override the path with the
  `BOOKSHELF_API_DIR` env var if it's not at `../bookshelf-api`). Runs serial
  (`workers: 1`), since it mutates a shared Postgres DB with no per-test transaction
  rollback. `bin/e2e_server`'s health-check target is `/books`, not `/` — `bookshelf-api`
  is API-only and has no root route, so `/` always 404s and would never satisfy
  Playwright's default readiness check.

**Known gap found via the real-api suite (fixed as part of adding it, 2026-08):**
`AdminUsersPage`'s "Save" button used to compute role IDs from the alphabetically-sorted
`available_roles` string array's index (`indexOf(name) + 1`), rather than real IDs —
since actual role IDs follow insertion order, not alphabetical, this silently assigned
the _wrong_ role (e.g. checking "moderator" could grant "member" instead).
`Admin::UsersController#index` now returns `available_roles` as `{id, name}` objects
instead of bare strings; the page uses the real ID. If `available_roles`' shape changes
again, update `src/types.ts`'s `Role` type, `src/api/admin.ts`, and
`e2e/helpers/mock-api.ts`'s fixture together.

**Known gap, not yet fixed:** `ReadingsPage` renders a "Remove" button for every reading
owner unconditionally, but `bookshelf-api`'s `ReadingPolicy#destroy?` is
moderator-or-above-only (same as the Rails apps) — a member's own "Remove" click always
403s (surfaced as a browser `alert("Failed to remove reading.")`). There's also no delete
affordance at all on `AdminReadingsPage`, so moderators can't soft-delete a reading
through this UI either, unlike `community_bookshelf`/`bookshelf-islands`'s admin panel.

## Environment Variables

| Variable       | Default                 | Description                           |
| -------------- | ----------------------- | ------------------------------------- |
| `VITE_API_URL` | `http://localhost:3000` | Base URL of the bookshelf-api backend |

Create `.env.local` for local overrides (gitignored).

## Auth

Auth state is managed in `AuthContext`. On load it calls `GET /session` to restore the session from the Clearance cookie. Sign in via `POST /session`, sign out via `DELETE /session`.

All `api.*` calls in `src/api/client.ts` send `credentials: 'include'` so the cookie is forwarded automatically.

## Project Structure

```
src/
  api/          # typed API client + per-resource modules
  context/      # AuthContext (session state)
  pages/        # one file per route
  test/         # setup.ts (jest-dom)
  App.tsx        # router + AuthProvider
  main.tsx       # React root mount
```

## Adding a New Page

1. Create `src/pages/YourPage.tsx`
2. Add a `<Route>` in `App.tsx`
3. Add an API module in `src/api/` if the page fetches data
