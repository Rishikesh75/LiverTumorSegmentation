# Backend API contract (Spring Boot follow-up)

The React app is built **frontend-first** with a **mock** repository layer when `VITE_USE_MOCK_API` is not `false`. Replace mocks by implementing HTTP adapters under `src/infrastructure/http/` and wiring them in `src/app/composition.ts`.

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
| User profile | PATCH | `/api/users/me` | Body: `{ displayName?, organization? }` (email read-only or separate verified flow) |
| Job email notify | POST | `/api/jobs/:id/notify` | Optional: enqueue transactional email with result links; may instead be triggered automatically when job status → completed |

Legacy 2D endpoints (`POST /api/upload`, `POST /api/segment`, `GET /api/images/...`) can remain for single-slice flows; **do not** force NIfTI/DICOM through them until the backend accepts volumetric uploads and returns job IDs.

## Local development

- Vite dev server: `http://localhost:5173`
- Optional proxy: `vite.config.ts` proxies `/api` → `http://localhost:8080` so you can call relative `/api/...` without CORS during dev.
- Spring **CORS** must allow origin `http://localhost:5173` (the repo previously allowed only `http://localhost:4200`).

## Environment variables

| Variable | Purpose |
|----------|---------|
| `VITE_USE_MOCK_API` | If not `false`, use in-browser mock repositories (`localStorage`). |
| `VITE_API_BASE_URL` | Base URL for HTTP adapters (e.g. `http://localhost:8080`). |

## Mock notification log (development)

When using mocks, completed jobs call `MockNotificationRepository`, which appends entries to `localStorage` key `liver-tumor-segmentation-mock-notifications-v1` (capped list) for demo verification.
