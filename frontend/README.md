# LiverSeg Pro (Next.js frontend)

Liver tumor **3D volume upload and segmentation** UI. Talks to the Spring Boot backend via same-origin API rewrites in development.

## Prerequisites

- Node.js 20+
- Spring Boot backend on port **8080** (for real API mode)
- Optional: ML service if jobs call inference endpoints

## Setup

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local` as needed. For the real backend:

```env
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_API_BASE_URL=
BACKEND_URL=http://localhost:8080
```

On the **Spring Boot** backend, set:

```properties
APP_FRONTEND_URL=http://localhost:3000
```

so Google OAuth redirects to this app after sign-in.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server at [http://localhost:3000](http://localhost:3000) |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |

## Mock API mode

Set `NEXT_PUBLIC_USE_MOCK_API=true` (or omit it — mocks are on by default when not explicitly `false`) to run without the backend. Data is stored in `localStorage`.

## Architecture

- **App Router** (`app/`) — routes, layouts, providers
- **Clean architecture** (`src/domain`, `src/application`, `src/infrastructure`, `src/presentation`)
- **TanStack Query** — server state
- **Niivue** — in-browser NIfTI preview (client-only, dynamic import)

See [BACKEND-API.md](./BACKEND-API.md) for REST contract details.

## Migrated from

This app replaces the legacy Vite SPA in [`../frontend/`](../frontend/). Use this directory for new frontend work.
