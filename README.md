# HomiDirect

A modern real estate platform connecting landlords and tenants. Built with React, Fastify, and PostgreSQL in a TypeScript monorepo.

## Tech Stack

### Frontend (`/apps/web`)
- **React 18** with Vite and SWC
- **TailwindCSS** with shadcn/ui components
- **React Query** for server state management
- **React Hook Form** with Zod validation
- **React Router** for navigation

### Backend (`/apps/api`)
- **Fastify** web framework
- **PostgreSQL** with Drizzle ORM
- **JWT** authentication
- **AWS S3** for image storage
- **Nodemailer** for emails

### Infrastructure
- **Turborepo** for monorepo management
- **pnpm** package manager
- **Docker** for local development

## Features

- **Property Listings** - Create, edit, search, and filter properties
- **User Authentication** - JWT-based auth with password reset via email
- **Image Management** - Multi-image uploads with AWS S3
- **Favorites** - Save and manage favorite listings
- **Bookings** - Schedule property viewings
- **Verification** - Document upload and admin verification workflow
- **Messaging** - Internal messaging between users
- **Search & Filters** - By city, price, property type, bedrooms, area
- **Internationalization** - English and Greek language support

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 8.0.0
- PostgreSQL 16 (or Docker)

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Configure the following environment variables:

```env
DATABASE_URL=postgresql://homidirect:homidirect@localhost:5432/homidirect
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:8080

# AWS S3 (for image uploads)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_BUCKET_NAME=your-bucket
AWS_REGION=your-region

# Email (for password reset)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password

# Geoapify (for location search)
GEOAPIFY_API_KEY=your-api-key
```

### 3. Start the Database

```bash
pnpm docker
```

### 4. Run Migrations

```bash
pnpm db:push
```

### 5. Start Development Servers

```bash
pnpm dev
```

- Frontend: http://localhost:8080
- Backend: http://localhost:3000
- API Docs: http://localhost:3000/api-docs

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all packages |
| `pnpm lint` | Run ESLint |
| `pnpm type-check` | Run TypeScript type checking |
| `pnpm test` | Run tests |
| `pnpm docker` | Start PostgreSQL container |
| `pnpm docker:down` | Stop PostgreSQL container |
| `pnpm db:push` | Push schema changes to database |
| `pnpm db:generate` | Generate migration files |
| `pnpm db:migrate` | Run pending migrations |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm clean` | Clean build artifacts |

## Project Structure

```
homidirect/
├── apps/
│   ├── api/                 # Fastify backend
│   │   ├── src/
│   │   │   ├── modules/     # Feature modules (auth, listings, etc.)
│   │   │   ├── models/      # Drizzle ORM schemas
│   │   │   ├── middleware/  # Global middleware
│   │   │   └── utils/       # Utilities
│   │   └── drizzle/         # Database migrations
│   │
│   └── web/                 # React frontend
│       └── src/
│           ├── pages/       # Route components
│           ├── components/  # Reusable components
│           ├── contexts/    # React contexts
│           ├── hooks/       # Custom hooks
│           └── api/         # API client
│
├── packages/
│   ├── config/              # Shared ESLint/TS config
│   └── shared/              # Shared TypeScript types
│
├── docker-compose.yml       # PostgreSQL service
├── turbo.json               # Turborepo config
└── pnpm-workspace.yaml      # Workspace config
```

## API Modules

| Module | Endpoints | Description |
|--------|-----------|-------------|
| Auth | `/api/auth/*` | Registration, login, password reset |
| Users | `/api/users/*` | User profiles |
| Listings | `/api/listings/*` | Property CRUD and search |
| Images | `/api/listing-images/*` | Image upload and management |
| Bookings | `/api/bookings/*` | Viewing appointments |
| Favorites | `/api/favorites/*` | Saved listings |
| Verification | `/api/verification/*` | Document verification |

## User Roles

- **LANDLORD** - Can create and manage property listings
- **TENANT** - Can search, favorite, and book viewings
- **BOTH** - Combined landlord and tenant access
- **ADMIN** - Full access including verification management

## License

Private - All rights reserved.
