# HomiDirect

A modern real estate platform connecting landlords and tenants. Built with React, FastAPI, and PostgreSQL in a monorepo.

## Tech Stack

### Frontend (`/apps/web`)
- **React 18** with Vite and SWC
- **TailwindCSS** with shadcn/ui components
- **React Query** for server state management
- **React Hook Form** with Zod validation
- **React Router** for navigation

### Backend (`/apps/api`)
- **FastAPI** web framework
- **Python 3.12+** with **uv** package manager
- **PostgreSQL** with **SQLAlchemy 2.0** (async)
- **Alembic** for database migrations
- **JWT** authentication with `python-jose`
- **Cloudflare R2** for image storage (via `boto3`)
- **FastAPI BackgroundTasks** for async email delivery
- **Pydantic v2** for request/response validation

### Infrastructure
- **Turborepo** for monorepo management
- **pnpm** package manager (frontend)
- **uv** package manager (backend)
- **Docker** for local development

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
- Python >= 3.12
- uv (Python package manager)
- PostgreSQL 16 (or Docker)

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
cd apps/api && uv sync
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Configure the following environment variables in `apps/api/.env`:

```env
PORT=5000
DATABASE_URL=postgresql://homidirect:homidirect@localhost:5432/homidirect
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:8080

# Cloudflare R2 (for image uploads)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=your-bucket
R2_PUBLIC_URL=https://pub-xxx.r2.dev

# Email (SMTP)
SMTP_HOST=smtp.zoho.eu
SMTP_PORT=465
SMTP_USER=your-email
SMTP_PASS=your-password
EMAIL_FROM=HomiDirect <donotreply@homidirect.com>

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback
```

### 3. Start Services

```bash
pnpm docker
```

This starts PostgreSQL and the API.

### 4. Run Migrations

```bash
pnpm db:migrate
```

For existing databases, stamp the current state:
```bash
cd apps/api && uv run alembic stamp head
```

### 5. Start Development Servers

```bash
pnpm dev
```

Or start individually:
```bash
pnpm dev:api    # API at http://localhost:5000
pnpm dev:web    # Frontend at http://localhost:5173
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm dev:api` | Start API server with hot reload |
| `pnpm dev:web` | Start frontend dev server |
| `pnpm build` | Build all packages |
| `pnpm lint` | Run ESLint (frontend) |
| `pnpm lint:api` | Run Ruff linter (backend) |
| `pnpm test` | Run tests |
| `pnpm test:api` | Run API tests (pytest) |
| `pnpm docker` | Start all Docker services |
| `pnpm docker:down` | Stop all Docker services |
| `pnpm db:generate` | Generate Alembic migration |
| `pnpm db:migrate` | Run pending migrations |
| `pnpm clean` | Clean build artifacts |

## Project Structure

```
homidirect/
├── apps/
│   ├── api/                     # FastAPI backend
│   │   ├── src/
│   │   │   ├── config/          # Settings, database setup
│   │   │   ├── models/          # SQLAlchemy 2.0 models
│   │   │   ├── schemas/         # Pydantic v2 schemas
│   │   │   ├── routers/         # API route handlers
│   │   │   ├── services/        # Business logic
│   │   │   ├── dependencies/    # Auth, DB dependencies
│   │   │   ├── middleware/      # Error handling, camelCase
│   │   │   └── utils/           # Email, hashing, storage, errors
│   │   ├── alembic/             # Database migrations
│   │   ├── pyproject.toml       # Python dependencies (uv)
│   │   └── Dockerfile
│   │
│   └── web/                     # React frontend
│       └── src/
│           ├── pages/           # Route components
│           ├── components/      # Reusable components
│           ├── contexts/        # React contexts
│           ├── hooks/           # Custom hooks
│           └── api/             # API client (Axios)
│
├── packages/
│   ├── config/                  # Shared ESLint/TS config
│   └── shared/                  # Shared TypeScript types
│
├── docker-compose.yml           # API, PostgreSQL
├── turbo.json                   # Turborepo config
└── pnpm-workspace.yaml          # Workspace config
```

## API Endpoints

All endpoints are prefixed with `/api/v1`.

| Module | Prefix | Endpoints | Auth |
|--------|--------|-----------|------|
| Auth | `/auth` | Register, login, refresh, forgot/reset password | Public |
| Google Auth | `/auth/google` | OAuth redirect, callback | Public |
| Users | `/users` | Profile CRUD, current user | JWT |
| Favorites | `/users/favorites` | List, add, remove, check | JWT |
| Listings | `/listings` | CRUD, search, stats, cities, contact | Mixed |
| Listing Images | `/listings/:id/images` | List, upload, delete images | Auth + Owner |
| Uploads | `/uploads` | Pending image management | Auth + Role |
| Bookings | `/bookings` | CRUD with status transitions | Auth + Owner |
| Availability | `/availability-slots` | CRUD for viewing slots | Mixed |
| Verification | `/listings/:id/verification` | Document upload, status, history | Auth + Owner |
| Admin Verification | `/admin/verifications` | Review, pending list | Admin only |
| Geocoding | `/geocoding` | Forward and reverse search | JWT |

## User Roles

- **LANDLORD** - Can create and manage property listings
- **TENANT** - Can search, favorite, and book viewings
- **BOTH** - Combined landlord and tenant access
- **ADMIN** - Full access including verification management

## License

Private - All rights reserved.
