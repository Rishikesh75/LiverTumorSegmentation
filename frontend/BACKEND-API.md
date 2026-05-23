# Backend API contract (Spring Boot)

The Next.js app is built **frontend-first** with a **mock** repository layer when `NEXT_PUBLIC_USE_MOCK_API` is not `false`. HTTP adapters live under `src/infrastructure/http/` and are wired in `src/lib/composition.ts`.

## Suggested REST surface

| Concern | Method | Path | Notes |
|--------|--------|------|--------|
| Health | GET | `/api/health` | Already exists on current backend |
| Auth | POST | `/api/auth/login` | Body: `{ email, password }` → session + token |
| Auth | POST | `/api/auth/logout` | Invalidate session |
| Auth | GET | `/api/auth/me` | Current user |
| Models | GET | `/api/models` | Already exists |
| Volume upload | POST | `/api/volumes` | `multipart/form-data`: `file` or `files[]`, optional `format` |
| Create job | POST | `/api/jobs` | JSON: `{ volumeId, modelType }` |
| List jobs | GET | `/api/jobs` | Scoped to authenticated user |
| Job detail | GET | `/api/jobs/:id` | Include status + result references |
| Job results | GET | `/api/jobs/:id/results` | Slice URLs or mask volume URL |
| Analytics | GET | `/api/users/me/analytics` | Counts + recent jobs for current user |
| User profile | PATCH | `/api/users/me` | Body: `{ displayName?, organization? }` |
| Job email notify | POST | `/api/jobs/:id/notify` | Optional transactional email |

## Local development

- Next.js dev server: `http://localhost:3000`
- API rewrites in `next.config.ts` proxy `/api`, `/oauth2`, and `/login/oauth2` to Spring Boot (`BACKEND_URL`, default `http://localhost:8080`).
- Set **`APP_FRONTEND_URL=http://localhost:3000`** on the Spring Boot backend so Google OAuth redirects back to this app after sign-in.

## Environment variables

| Variable | Scope | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_USE_MOCK_API` | Client | If not `false`, use in-browser mock repositories (`localStorage`). |
| `NEXT_PUBLIC_API_BASE_URL` | Client | API base URL; leave empty for same-origin `/api` via rewrites. |
| `NEXT_PUBLIC_OAUTH_GOOGLE_PATH` | Client | Google OAuth start path (default `/oauth2/authorization/google`). |
| `BACKEND_URL` | Server | Spring Boot URL for Next.js rewrites (default `http://localhost:8080`). |

## Mock notification log (development)

When using mocks, completed jobs append entries to `localStorage` key `liver-tumor-segmentation-mock-notifications-v1` for demo verification.
