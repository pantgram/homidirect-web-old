# @homidirect/web

React + Vite + TypeScript frontend for the HomiDirect real-estate platform.

Part of the [`homidirect`](../../README.md) monorepo (managed with pnpm workspaces + Turborepo). The API lives in [`../api`](../api).

## Tech

- React 18 (Vite + SWC)
- TailwindCSS + shadcn/ui
- TanStack Query (server state)
- React Router
- Zod (validation)
- React Leaflet (maps)

## Scripts

Run these from the **repository root** (pnpm filters the workspace):

```sh
pnpm dev:web        # Vite dev server on http://localhost:8080
pnpm build:web      # tsc + vite build -> dist/
pnpm preview:web    # preview the production build
pnpm --filter @homidirect/web type-check
pnpm --filter @homidirect/web lint
```

## Environment

Configured via Vite env vars (see `src/config/env.ts`):

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000` |

## Docker

Built via `apps/web/Dockerfile` (build context = repo root, so pnpm can resolve the workspace lockfile). Served by nginx (SPA fallback + long-cached hashed assets). See `docker-compose.yml` at the repo root.
