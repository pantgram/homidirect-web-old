# HomiDirect

A modern real estate platform connecting landlords and tenants. Built with React.

## Tech Stack

- **React 18** with Vite and SWC
- **TailwindCSS** with shadcn/ui components
- **Supabase** for authentication (email/password + Google OAuth)
- **React Query** for server state management
- **React Hook Form** with Zod validation
- **React Router** for navigation
- **Leaflet** (react-leaflet) for interactive maps
- **Docker** (nginx) for containerized serving

## Features

- **Property Listings** - Create, edit, search, and filter properties
- **User Authentication** - Supabase auth with Google OAuth and password reset
- **Image Management** - Multi-image uploads with Cloudflare R2
- **Favorites** - Save and manage favorite listings
- **Bookings** - Schedule property viewings with availability slots
- **Verification** - Document upload and admin verification workflow
- **Interactive Maps** - Property location display and picker via Leaflet
- **Geocoding** - Location search and reverse geocoding via backend API
- **Search & Filters** - Full-text search, 20+ filters, sorting, pagination
- **Internationalization** - English and Greek language support
- **Role-Based Access** - LANDLORD, TENANT, BOTH, ADMIN roles

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 8.0.0

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Fill in the Supabase credentials (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) — the app validates them at startup and will not run without them. Then set `VITE_API_URL` to the URL of the HomiDirect API backend the frontend should talk to.

### 3. Start Development Server

```bash
pnpm dev
```

Frontend runs at http://localhost:8080

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Vite dev server |
| `pnpm build` | Type-check and build for production |
| `pnpm preview` | Preview the production build |
| `pnpm type-check` | Run TypeScript type-checking |
| `pnpm lint` | Run ESLint |
| `pnpm docker` | Build and start the Docker container |
| `pnpm docker:down` | Stop the Docker container |
| `pnpm clean` | Clean build artifacts |

## Project Structure

```
homidirect-web/
├── public/                  # Static assets
├── src/
│   ├── api/                 # API modules (Axios): auth, listings, bookings,
│   │                        #   availability-slots, favorites, verification,
│   │                        #   admin, geocoding, users, shared client
│   ├── assets/              # Images
│   ├── components/          # Reusable components
│   │   ├── auth/            # Route guards (ProtectedRoute, RequireAuth, RequireRole)
│   │   ├── layout/          # Page layout, loader, user menu
│   │   ├── listing/         # Image upload
│   │   ├── shared/          # Pagination, badges, empty/error states
│   │   ├── verification/    # Document upload
│   │   └── ui/              # shadcn/ui primitives
│   ├── config/              # Env validation (Zod)
│   ├── contexts/            # Auth and language contexts
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Toast, validation, utilities
│   ├── locales/             # i18n translations (en, el)
│   ├── pages/               # Route components
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Formatting, image, property helpers
├── Dockerfile               # Build + nginx runner stages
├── nginx.conf               # SPA fallback + asset caching
├── docker-compose.yml
├── tsconfig.json            # Project references (app + node)
└── vite.config.ts
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000` |
| `VITE_SUPABASE_URL` | Supabase project URL (required) | — |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key (required) | — |

All `VITE_*` variables are inlined at build time. For Docker builds, pass `VITE_API_URL` as a build arg (see `Dockerfile`).

## User Roles

- **LANDLORD** - Can create and manage property listings
- **TENANT** - Can search, favorite, and book viewings
- **BOTH** - Combined landlord and tenant access
- **ADMIN** - Full access including verification management

## License

Private - All rights reserved.
