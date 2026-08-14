# HomiDirect

A modern real estate platform connecting landlords and tenants. Built with React.

## Tech Stack

- **React 18** with Vite and SWC
- **TailwindCSS** with shadcn/ui components
- **React Query** for server state management
- **React Hook Form** with Zod validation
- **React Router** for navigation
- **Docker** (nginx) for containerized serving

## Features

- **Property Listings** - Create, edit, search, and filter properties
- **User Authentication** - JWT-based auth with Google OAuth and password reset
- **Image Management** - Multi-image uploads with Cloudflare R2
- **Favorites** - Save and manage favorite listings
- **Bookings** - Schedule property viewings with availability slots
- **Verification** - Document upload and admin verification workflow
- **Geocoding** - Location search with caching (Photon/Nominatim)
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

Set `VITE_API_URL` to the URL of the HomiDirect API backend the frontend should talk to.

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
homidirect/
├── public/                  # Static assets
├── src/
│   ├── pages/               # Route components
│   ├── components/          # Reusable components
│   │   └── ui/              # shadcn/ui primitives
│   ├── contexts/            # React contexts
│   ├── hooks/               # Custom hooks
│   └── api/                 # API client (Axios)
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

## User Roles

- **LANDLORD** - Can create and manage property listings
- **TENANT** - Can search, favorite, and book viewings
- **BOTH** - Combined landlord and tenant access
- **ADMIN** - Full access including verification management

## License

Private - All rights reserved.
