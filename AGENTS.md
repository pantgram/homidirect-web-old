# AGENTS.md

Frontend for HomiDirect (real estate platform). React 18 + Vite + SWC, Tailwind + shadcn/ui, React Query, Supabase auth, separate backend API.

## Commands

- Package manager is pnpm, pinned via `packageManager` (use corepack; Node >= 20).
- **There is no test suite.** Verify changes with:
  - `pnpm lint` — fails on any warning (`--max-warnings 0`)
  - `pnpm type-check` — `tsc` on `tsconfig.app.json`
  - `pnpm build` — type-check + production build (run before finishing)
- Dev server runs at **http://localhost:8080** (not Vite's default 5173); `pnpm docker` / `pnpm docker:down` for the nginx container.

## Environment

- `pnpm dev`/`build` crash without `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`: `src/config/env.ts` Zod-parses env at import time and throws. Copy `.env.example` → `.env`. (README's env table only mentions `VITE_API_URL`.)
- All `VITE_*` vars are inlined at build time, not runtime (see Dockerfile `ARG VITE_API_URL`).
- API base URL defaults to `http://localhost:5000`; all requests go to `<VITE_API_URL>/api/v1`.

## Architecture

- **Auth is Supabase** (`src/lib/supabase.ts`), not Clerk — `@clerk/react` in package.json is unused. The Supabase JWT is attached to backend calls by interceptors in `src/api/client.ts` (`apiClient`), which also auto-refreshes on 401 and redirects to `/auth` on failure. Route new API calls through `apiClient`, never raw axios/fetch.
- API modules live in `src/api/*` and are re-exported from `src/api/index.ts`; access them from components via React Query hooks in `src/hooks/`, which use centralized query-key factories (e.g. `listingKeys`).
- Pages are lazy-loaded and must be registered in `src/App.tsx`; protected routes wrap in `ProtectedRoute` (e.g. `requireLandlord`).
- Path alias `@/*` → `src/*` (configured in both vite.config.ts and tsconfig).

## Conventions

- i18n: use `t`/`tt` from `useLanguage`. Keys are typed from `src/locales/en.json`; a key missing from `el.json` compiles fine but renders the raw key in Greek — **add every new key to both `en.json` and `el.json`**.
- shadcn/ui primitives live in `src/components/ui` (default style, slate, `components.json`); app-specific shared components in `src/components/shared`, `listing`, `verification`, `auth`.
- ESLint exempts `src/contexts/**` and `src/components/ui/**` from the react-refresh export rule (they legitimately export hooks/constants alongside components).
- Prefix intentionally unused vars with `_` (`argsIgnorePattern`/`varsIgnorePattern`).
