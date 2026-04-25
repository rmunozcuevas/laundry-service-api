# laundry-service-api

Final Project for ITSC-4166.

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

## Render Deployment Notes

Environment variables required on Render:
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

Build command suggestion (runs migrations + seed automatically):
- `npx prisma migrate deploy && npm run seed:db`

Start command:
- `npm start`

## Testing Plan

See `/Users/raymundomc/Desktop/backend_app_development/laundry_service/docs/testing-plan.md`.
