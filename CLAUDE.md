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
| CI              | GitHub Actions — format:check → lint → build → test                      |

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
```

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
