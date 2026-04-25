# Laundry Service API - Testing Plan (Swagger UI)

These steps are designed to be followed in Swagger UI at `/api-docs`.

## Seed Credentials (Known Logins)

Run `npm run seed:db` first.

- Admin
  - Email: `admin@laundry.local`
  - Password: `admin-password-123`
- Customer
  - Email: `customer@laundry.local`
  - Password: `customer-password-123`

## Authentication Setup (Swagger)

1. Open `/api-docs`
2. Use `POST /api/auth/login` with one of the seed users
3. Copy `accessToken`
4. Click **Authorize** and paste the token (JWT only)

---

## Auth

### POST `/api/auth/signup`
- Access Control: Public
- Success:
  - Provide a new email + valid password and required fields
  - Expect `201` with a user object (no password)
- 400:
  - Invalid email or password too short
  - Expect `400`
- 409:
  - Use an email that already exists (e.g. `customer@laundry.local`)
  - Expect `409`

### POST `/api/auth/login`
- Access Control: Public
- Success:
  - Login with seed credentials
  - Expect `200` and an `accessToken`
- 401:
  - Wrong password
  - Expect `401`

---

## Orders (Main Resource 1)

### GET `/api/orders`
- Access Control:
  - Customer: only their own orders
  - Admin: all orders
- Setup: Authorize as customer or admin
- Success:
  - Expect `200` array
- 401:
  - Remove the JWT and retry
  - Expect `401`

### POST `/api/orders`
- Access Control:
  - Customer: can create orders for themselves only
  - Admin: can create orders for any user (optional `userId`)
- Setup: Authorize
- Success (customer):
  - Body: `{ "weight_kg": 7.5, "status": "pending" }`
  - Expect `201`
- 400:
  - Remove `weight_kg`
  - Expect `400`
- 403:
  - As customer, include a different `userId`
  - Expect `403`

### GET `/api/orders/{id}`
- Access Control:
  - Owner or Admin
- Setup:
  - First call `GET /api/orders` and copy an order id
- Success:
  - Expect `200`
- 403:
  - Login as a different non-admin user and try someone else's order
  - Expect `403`
- 404:
  - Use an id that does not exist (e.g. `999999`)
  - Expect `404`

### PUT `/api/orders/{id}`
- Access Control:
  - Owner or Admin
- Setup: use an existing order id
- Success:
  - Body: `{ "status": "in_progress" }` or `{ "weight_kg": 9.0 }`
  - Expect `200`
- 400:
  - Provide an empty body
  - Expect `400`
- 401:
  - Remove JWT
  - Expect `401`
- 403:
  - Non-owner non-admin
  - Expect `403`

### DELETE `/api/orders/{id}`
- Access Control:
  - Owner or Admin
- Success:
  - Expect `204`
- 401/403/404 as above

---

## Garments (Main Resource 2)

### GET `/api/garments`
- Access Control:
  - Customer: only garments on their own orders
  - Admin: all garments
- Setup: Authorize
- Success:
  - Expect `200` array
- 401:
  - Remove JWT
  - Expect `401`

### POST `/api/garments`
- Access Control:
  - Customer: can only create garments for their own orders
  - Admin: can create garments for any order
- Setup:
  1. Authorize as customer
  2. Create an order or use an existing one from `GET /api/orders`
- Success:
  - Body example:
    - `{ "orderId": 1, "type": "Shirt", "quantity": 2, "care_instructions": "Wash cold", "delicate_flag": false, "unit_price": 3.5 }`
  - Expect `201`
- 400:
  - Use a non-existent `orderId` (e.g. `999999`)
  - Expect `400`
- 403:
  - Use an `orderId` belonging to a different user (non-admin)
  - Expect `403`

### GET `/api/garments/{id}`
- Access Control:
  - Owner (via order) or Admin
- Success:
  - Expect `200`
- 403/404 as above

### PUT `/api/garments/{id}`
- Access Control:
  - Owner or Admin
- Success:
  - Body: `{ "quantity": 5 }`
  - Expect `200`
- 403/404 as above

### DELETE `/api/garments/{id}`
- Access Control:
  - Owner or Admin
- Success:
  - Expect `204`

---

## Subscriptions (Main Resource 3)

### POST `/api/subscriptions`
- Access Control: Authenticated users (creates for self), Admin can specify `userId`
- Setup: Authorize as customer
- Success:
  - Body: `{ "plan": "basic", "discount_percentage": 10, "active_flag": true }`
  - Expect `201`
- 401:
  - Remove JWT
  - Expect `401`

### GET `/api/subscriptions/me`
- Access Control: Authenticated user
- Success:
  - Expect `200` array

### GET `/api/subscriptions`
- Access Control: Admin only
- Setup: Authorize as admin
- Success:
  - Expect `200` array
- 403:
  - Authorize as customer
  - Expect `403`

### PUT/DELETE `/api/subscriptions/{id}`
- Access Control: Owner or Admin
- Setup: get an id from `/api/subscriptions/me`
- Success:
  - Expect `200` on PUT, `204` on DELETE
- 403/404/401 as above
