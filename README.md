# laundry-service-api

Final Project for ITSC-4166.

Live links (fill these in for your submission PDF):
- Render API (base): `https://laundry-service-api-k1h3.onrender.com` (endpoints live under `/api`)
- Swagger UI: `https://laundry-service-api-k1h3.onrender.com/api-docs`
- Repo: `https://github.com/rmunozcuevas/laundry-service-api`

## Local Dev

- Install: `npm install`
- Run: `npm run dev`
- Swagger UI: `http://localhost:3000/api-docs`

## Seed

- Seed DB: `npm run seed:db`
- Optional seed cleanup + reseed: `SEED_PURGE=true npm run seed:db`

Seeded logins:
- Admin: `admin@laundry.local` / `admin-password-123`
- Customer: `customer@laundry.local` / `customer-password-123`
- Customer2: `customer2@laundry.local` / `customer2-password-123`
- Staff: `staff@laundry.local` / `staff-password-123`
- Staff2: `staff2@laundry.local` / `staff2-password-123`

## Render Deployment Notes

Environment variables required on Render:
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

Build command (runs migrations + seed automatically):
- `npm run render-build`

Start command:
- `npm start`

## Testing Plan

See `docs/testing-plan.md`.

## API Documentation

OpenAPI spec: `docs/openapi.yaml` (Swagger UI is served at `/api-docs`).
