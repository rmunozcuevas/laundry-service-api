# Laundry Service API - Testing Plan (Swagger UI)

This plan is written so a grader can verify **every endpoint** directly in Swagger UI, including authentication (JWT), authorization (401 vs 403), CRUD, and error handling.

Swagger UI location:
- Local: `http://localhost:3000/api-docs`
- Render: `<your-render-url>/api-docs`

Response shapes used in this plan:
- Validation failures: `400` with `{ "errors": ["..."] }`
- Other errors: `4xx/5xx` with `{ "error": "..." }`

---

## 0) Seed + Known Logins

If running locally:
1. (Optional reset) `SEED_PURGE=true npm run seed:db`
2. Otherwise: `npm run seed:db`

If you are using the provided Render build script, it runs:
- `npm run seed:db` then `npm run seed`
For grading, `npm run seed:db` is the only required seed (it creates all core tables + relationships).

Optional DB “flow” sanity check (verifies tables link correctly):
- Run: `node scripts/verify-db-flow.js`
- Expect output: `DB flow check: OK` and an example `StaffOrder` assignment with linked `order` + `staff`.


Seeded logins (known credentials):
- Admin
  - Email: `admin@laundry.local`
  - Password: `admin-password-123`
- Customer (owns seeded Orders/Garments/Subscriptions; has an active subscription)
  - Email: `customer@laundry.local`
  - Password: `customer-password-123`
- Customer2 (second customer account; useful for cross-ownership 403 tests)
  - Email: `customer2@laundry.local`
  - Password: `customer2-password-123`
- Staff (seeded staff profile exists; useful for “non-admin” 403 tests)
  - Email: `staff@laundry.local`
  - Password: `staff-password-123`
- Staff2 (second staff account; useful for “other staff” 403 tests)
  - Email: `staff2@laundry.local`
  - Password: `staff2-password-123`

Seeded data quick reference (created by `npm run seed:db`):
- Pricing tiers:
  - (0–5kg) base $15, extra $3/kg
  - (5.01–10kg) base $25, extra $3/kg
  - (10.01–20kg) base $40, extra $3.5/kg
  - (20.01–30kg) base $55, extra $4/kg
- Customer seeded Orders (email `customer@laundry.local`):
  - `status: "seed"`, `weight_kg: 7.5`, expected `total_price: 22.5` (10% discount)
  - `status: "seed-2"`, `weight_kg: 3.2`, expected `total_price: 13.5` (10% discount)
  - `status: "seed-heavy"`, `weight_kg: 42.5`, expected `total_price: 94.5` (10% discount, uses “highest tier + extra kg”)
- Customer2 seeded Orders (email `customer2@laundry.local`):
  - `status: "seed-c2-seed"`, `weight_kg: 7.5`, expected `total_price: 25` (no active subscription)
  - `status: "seed-c2-seed-2"`, `weight_kg: 3.2`, expected `total_price: 15` (no active subscription)
- Seeded StaffOrder assignments:
  - The order with `status: "seed"` is assigned to `staff@laundry.local`
  - The order with `status: "seed-2"` is assigned to `staff2@laundry.local`

Note: `pickup_date` is generated at seed-time (today’s date in UTC). Use `status`/`weight_kg` for deterministic matching.

---

## 1) Swagger Auth Setup (required for protected endpoints)

1. Open `/api-docs`
2. Expand **Auth** → `POST /api/auth/login`
3. Click **Try it out**
4. Enter one of the seed credentials → click **Execute**
5. Copy `accessToken` from the response body
6. Click the **Authorize** button (top-right)
7. Paste the token into the bearerAuth input → click **Authorize**

Tip: To test `401 Unauthorized`, click **Authorize** again → **Logout** (or clear the token).

## 1A) Recommended Grading Flow (Admin → Customer → Staff)

Do this order so the grader can move quickly without backtracking tokens:
1. Login as **Admin** → run admin-only endpoints first: PricingTiers, Subscriptions (admin list), Staff, StaffOrders
2. Login as **Customer** → run customer-owned endpoints: Orders, Garments, Subscriptions (me + CRUD)
3. Login as **Staff** → run staff endpoints: Staff (me + self GET), Orders (create), StaffOrders (me)


---

## 2) Capture Working IDs (so no guessing is needed)

Do these once, then reuse the IDs in later steps.

### As Customer
1. Login as **Customer** and Authorize.
2. `GET /api/orders` → **Try it out** → **Execute**
   - Pick an order from the response (prefer one with `status` that starts with `seed`).
   - Save:
     - `customerOrderId = <id>`
     - `customerUserId = <userId>`
3. `GET /api/garments` → Execute → pick any garment.
   - Save: `customerGarmentId = <id>`
4. `GET /api/subscriptions/me` → Execute.
   - If array is non-empty, pick one:
     - Save: `customerSubscriptionId = <id>`
   - If empty: create one using `POST /api/subscriptions`, then repeat `GET /api/subscriptions/me`.

### As Customer2 (optional, for 403 cross-ownership tests)
1. Login as **Customer2** and Authorize.
2. `GET /api/orders` → Execute → pick an order (prefer `status` that starts with `seed-c2-`).
   - Save: `customer2OrderId = <id>` and `customer2UserId = <userId>`
3. `GET /api/garments` → Execute → pick any garment.
   - Save: `customer2GarmentId = <id>`
4. `GET /api/subscriptions/me` → Execute → pick the seeded row.
   - Save: `customer2SubscriptionId = <id>`

### As Staff
1. Login as **Staff** and Authorize.
2. Get your staff profile (this confirms your Staff table row exists):
   - `GET /api/staff/me` → Execute
   - Save: `staffId = <id>` and `staffUserId = <userId>`
3. Create an order so you can confirm non-admin order creation works:
   - `POST /api/orders` with body `{ "weight_kg": 2.5, "status": "pending" }`
   - Save: `staffOrderId = <id>` from the response.

### As Staff2 (optional, for 403 “other staff” tests)
1. Login as **Staff2** and Authorize.
2. `GET /api/staff/me` → Execute.
   - Save: `staff2Id = <id>`

### As Admin
1. Login as **Admin** and Authorize.
2. `GET /api/pricing-tiers` → Execute → pick one tier.
   - Save: `pricingTierId = <id>`

3. Confirm seeded StaffOrder assignments exist (seed-db creates at least 1 assignment):
   - `GET /api/staff-orders` → Execute → pick one row
   - Save: `assignedOrderId = <order_id>` and `assignedStaffId = <staff_id>`

Recommended fixed IDs for “not found” tests:
- Use `{id} = 999999` to trigger `404 Not Found`.
- Use `{id} = 0` (or `-10`) to trigger `400 Bad Request` (invalid id).

---

## Auth

### POST `/api/auth/signup`
- Access Control: Public
- Success (201):
  1. Try it out → body (example):
     - `{ "email": "newuser1@laundry.local", "password": "Password123!", "name": "New User", "address": "1 Main St", "phone": "555-000-0000", "role": "customer" }`
  2. Execute → Expect `201` and a user object (no password field).
- Error 400 (validation):
  - Use an invalid email (e.g. `not-an-email`) or short password (e.g. `123`) → Expect `400`.
- Error 409 (duplicate):
  - Reuse an existing email (e.g. `customer@laundry.local`) → Expect `409`.

### POST `/api/auth/login`
- Access Control: Public
- Success (200):
  - Login with a seed user → Expect `200` with `{ "accessToken": "<jwt>" }`.
- Error 400 (validation):
  - Invalid email format → Expect `400`.
- Error 401 (bad credentials):
  - Correct email + wrong password → Expect `401`.

---

## Orders (Main Resource 1) — `/api/orders`

### GET `/api/orders`
- Access Control:
  - Customer/Staff: only their own orders
  - Admin: all orders
- Success (200):
  - Authorize as customer → Execute → Expect `200` array.
- Error 400 (invalid query):
  - Set `limit = 0` (or `sortBy = notAField`) → Expect `400`.
- Error 401:
  - Logout (remove token) → Execute → Expect `401`.

### POST `/api/orders`
- Access Control:
  - Customer/Staff: create for self only
  - Admin: may create for another user using `userId`
- Success (201, customer):
  - Body: `{ "weight_kg": 7.5, "status": "pending" }` → Expect `201` with an order (includes `id`, `userId`, `pickup_date`, `total_price`).
- Error 400:
  - Remove `weight_kg` (or set `weight_kg: 0`) → Expect `400`.
- Error 403:
  - Login as customer, include a different `userId` than your own (example: `{ "userId": staffUserId, "weight_kg": 1.5 }`) → Expect `403`.
- Error 401:
  - Remove token → Expect `401`.

### GET `/api/orders/{id}`
- Access Control: Owner or Admin
- Success (200):
  - As customer, `{id} = customerOrderId` → Expect `200`.
- Error 400:
  - `{id} = 0` → Expect `400`.
- Error 401:
  - Remove token → Expect `401`.
- Error 403:
  1. As customer, confirm `customerOrderId`.
  2. Login as staff.
  3. Call `GET /api/orders/{id}` with `{id} = customerOrderId` → Expect `403`.
- Error 404:
  - `{id} = 999999` → Expect `404`.

### PUT `/api/orders/{id}`
- Access Control: Owner or Admin
- Success (200):
  - As customer, `{id} = customerOrderId`, body: `{ "status": "in_progress" }` → Expect `200`.
- Error 400:
  - Empty body `{}` → Expect `400` (at least one field required).
- Error 401:
  - Remove token → Expect `401`.
- Error 403:
  - Login as staff, `{id} = customerOrderId` → Expect `403`.
- Error 404:
  - `{id} = 999999` → Expect `404`.

### DELETE `/api/orders/{id}`
- Access Control: Owner or Admin
- Success (204):
  1. As customer, create a new order (`POST /api/orders`).
  2. Copy its id as `tempOrderId`.
  3. `DELETE /api/orders/{id}` with `{id} = tempOrderId` → Expect `204`.
- Error 400 / 401 / 403 / 404:
  - `{id}=0` → `400`, no token → `401`, staff deleting customer order → `403`, `{id}=999999` → `404`.

---

## Garments (Main Resource 2) — `/api/garments`

### GET `/api/garments`
- Access Control:
  - Customer/Staff: only garments on their own orders
  - Admin: all garments
- Success (200):
  - As customer, Execute → Expect `200` array.
- Error 400 (invalid query):
  - Set `limit = 0` (or `sortBy = notAField`) → Expect `400`.
- Error 401:
  - Remove token → Expect `401`.

### POST `/api/garments`
- Access Control:
  - Customer/Staff: can only create garments for orders they own
  - Admin: can create garments for any order
- Success (201, customer):
  - Body example:
    - `{ "orderId": customerOrderId, "type": "Shirt", "quantity": 2, "care_instructions": "Wash cold", "delicate_flag": true, "unit_price": 3.5 }`
  - Expect `201`.
- Error 400 (validation):
  - Set `quantity = 0` OR set `delicate_flag = false` OR remove a required field (e.g. remove `type`) → Expect `400`.
- Error 403 (ownership):
  - Login as staff, try creating a garment on a customer-owned order (use a VALID body so you don't get `400` first):
    - `{ "orderId": customerOrderId, "type": "Staff Attempt Shirt", "quantity": 1, "care_instructions": "Wash cold", "delicate_flag": true, "unit_price": 3.5 }` → Expect `403`.
- Error 404 (non-admin + missing order):
  - As customer, use `orderId = 999999` → Expect `404` (order not found during ownership check).
- Error 400 (admin + missing order):
  - As admin, use `orderId = 999999` → Expect `400` (invalid orderId / foreign key).
- Error 401:
  - Remove token → Expect `401`.

### GET `/api/garments/{id}`
- Access Control: Owner (via garment’s order) or Admin
- Success (200):
  - As customer, `{id} = customerGarmentId` → Expect `200`.
- Error 400:
  - `{id} = 0` → Expect `400`.
- Error 401:
  - Remove token → Expect `401`.
- Error 403:
  - Login as staff, `{id} = customerGarmentId` → Expect `403`.
- Error 404:
  - `{id} = 999999` → Expect `404`.

### PUT `/api/garments/{id}`
- Access Control: Owner or Admin
- Success (200):
  - As customer, `{id} = customerGarmentId`, body: `{ "quantity": 5 }` → Expect `200`.
- Error 400:
  - Empty body `{}` → Expect `400`.
- Error 401 / 403 / 404:
  - Remove token → `401`, staff updating customer garment → `403`, `{id}=999999` → `404`.

### DELETE `/api/garments/{id}`
- Access Control: Owner or Admin
- Success (204):
  1. Create a garment (POST) and save its id as `tempGarmentId`.
  2. `DELETE /api/garments/{id}` with `{id} = tempGarmentId` → Expect `204`.
- Error 400 / 401 / 403 / 404:
  - `{id}=0` → `400`, no token → `401`, staff deleting customer garment → `403`, `{id}=999999` → `404`.

---

## Subscriptions (Main Resource 3) — `/api/subscriptions`

### GET `/api/subscriptions` (Admin list)
- Access Control: Admin only
- Success (200):
  - Login as admin → Execute → Expect `200` array.
- Error 401:
  - Remove token → Expect `401`.
- Error 403:
  - Login as customer → Expect `403`.

### GET `/api/subscriptions/me`
- Access Control: Authenticated user
- Success (200):
  - Login as customer → Execute → Expect `200` array.
- Error 401:
  - Remove token → Expect `401`.

### POST `/api/subscriptions`
- Access Control:
  - Customer/Staff: create for self only
  - Admin: may create for another user using `userId`
- Success (201, customer):
  - Body: `{ "plan": "basic", "discount_percentage": 10, "active_flag": true }` → Expect `201`.
- Error 400:
  - Remove `plan` OR set `discount_percentage = 101` → Expect `400`.
- Error 403:
  - Login as staff, set `userId = customerUserId` (someone else) → Expect `403`.
- Error 401:
  - Remove token → Expect `401`.

### GET `/api/subscriptions/{id}`
- Access Control: Owner or Admin
- Success (200):
  - As customer, `{id} = customerSubscriptionId` → Expect `200`.
- Error 400:
  - `{id}=0` → Expect `400`.
- Error 401:
  - Remove token → Expect `401`.
- Error 403:
  - Login as staff, `{id} = customerSubscriptionId` → Expect `403`.
- Error 404:
  - `{id}=999999` → Expect `404`.

### PUT `/api/subscriptions/{id}`
- Access Control: Owner or Admin
- Success (200):
  - As customer, `{id} = customerSubscriptionId`, body: `{ "discount_percentage": 15 }` → Expect `200`.
- Error 400:
  - Empty body `{}` → Expect `400`.
- Error 401 / 403 / 404:
  - Remove token → `401`, staff updating customer subscription → `403`, `{id}=999999` → `404`.

### DELETE `/api/subscriptions/{id}`
- Access Control: Owner or Admin
- Success (204):
  1. Create a subscription (POST) and save its id as `tempSubscriptionId`.
  2. `DELETE /api/subscriptions/{id}` with `{id} = tempSubscriptionId` → Expect `204`.
- Error 400 / 401 / 403 / 404:
  - `{id}=0` → `400`, no token → `401`, staff deleting customer subscription → `403`, `{id}=999999` → `404`.

---

## Pricing Tiers — `/api/pricing-tiers`

### GET `/api/pricing-tiers`
- Access Control: Public
- Success (200):
  - Execute → Expect `200` array.
- Error 400 (invalid query):
  - Set `limit = 0` or `sortBy = notAField` → Expect `400`.

### GET `/api/pricing-tiers/{id}`
- Access Control: Public
- Success (200):
  - `{id} = pricingTierId` → Expect `200`.
- Error 400:
  - `{id}=0` → Expect `400`.
- Error 404:
  - `{id}=999999` → Expect `404`.

### POST `/api/pricing-tiers`
- Access Control: Admin only
- Success (201):
  - Login as admin, body: `{ "min_weight_kg": 21, "max_weight_kg": 30, "base_price": 55, "extra_kg_price": 4 }` → Expect `201`.
- Error 400:
  - Set `min_weight_kg = 10` and `max_weight_kg = 5` → Expect `400`.
- Error 401:
  - Remove token → Expect `401`.
- Error 403:
  - Login as customer → Expect `403`.

### PUT `/api/pricing-tiers/{id}`
- Access Control: Admin only
- Success (200):
  - Login as admin, `{id} = pricingTierId`, body: `{ "base_price": 99 }` → Expect `200`.
- Error 400:
  - Empty body `{}` → Expect `400`.
- Error 401 / 403 / 404:
  - Remove token → `401`, customer token → `403`, `{id}=999999` → `404`.

### DELETE `/api/pricing-tiers/{id}`
- Access Control: Admin only
- Success (204):
  1. Create a new tier (POST) and save its id as `tempTierId`.
  2. Delete it → Expect `204`.
- Error 400 / 401 / 403 / 404:
  - `{id}=0` → `400`, no token → `401`, customer token → `403`, `{id}=999999` → `404`.

---

## Staff — `/api/staff`

These endpoints validate the **Staff** table and its relationship to **User**.

### GET `/api/staff`
- Access Control: Admin only
- Success (200):
  - Login as admin → Execute → Expect `200` array.
- Error 401:
  - Remove token → Expect `401`.
- Error 403:
  - Login as customer or staff → Expect `403`.

### POST `/api/staff`
- Access Control: Admin only
- Setup:
  1. Use `POST /api/auth/signup` to create a new user with `role: "staff"`.
  2. Copy the returned `id` as `newStaffUserId`.
- Success (201):
  - Login as admin → Body: `{ "userId": newStaffUserId, "employee_role": "washer", "active_flag": true }` → Expect `201`.
- Error 400 (validation):
  - Remove `userId` or `employee_role` → Expect `400`.
- Error 400 (foreign key):
  - Use `userId = 999999` → Expect `400`.
- Error 401/403:
  - Remove token → `401`; login as non-admin → `403`.

### GET `/api/staff/me`
- Access Control: Authenticated
- Success (200):
  - Login as the seeded staff user (`staff@laundry.local`) → Execute → Expect `200` staff profile with an `id`.
  - Save: `staffId = <id>`.
- Error 401:
  - Remove token → Expect `401`.
- Error 404:
  - Login as customer and call it (customer has no staff profile) → Expect `404`.

### GET `/api/staff/{id}`
- Access Control: Admin or “self”
- Success (200):
  - Login as staff → set `{id} = staffId` (from `/api/staff/me`) → Expect `200`.
- Error 400:
  - `{id}=0` → Expect `400`.
- Error 401:
  - Remove token → Expect `401`.
- Error 403:
  - Use a different staff id than your own (recommended: the seeded Staff2):
    1. Login as staff2 → `GET /api/staff/me` → save `staff2Id`
    2. Login as staff → `GET /api/staff/{id}` with `{id} = staff2Id` → Expect `403`.
  - (Alternate) Create a second staff profile using the POST steps above and use `otherStaffId`.
- Error 404:
  - `{id}=999999` → Expect `404`.

### PUT `/api/staff/{id}`
- Access Control: Admin only
- Success (200):
  - Login as admin → `{id} = staffId` → body `{ "employee_role": "driver" }` → Expect `200`.
- Error 400:
  - Empty body `{}` → Expect `400`.
- Error 401/403/404:
  - Remove token → `401`; login as non-admin → `403`; `{id}=999999` → `404`.

### DELETE `/api/staff/{id}`
- Access Control: Admin only
- Success (204):
  - Use the staff record you created in POST (not the seeded one): `{id} = otherStaffId` → Expect `204`.
- Error 400/401/403/404:
  - `{id}=0` → `400`; remove token → `401`; non-admin → `403`; `{id}=999999` → `404`.

---

## Staff Assignments (Join Table) — `/api/staff-orders`

These endpoints validate the **StaffOrder** join table between **Staff** and **Order**.

### GET `/api/staff-orders`
- Access Control: Admin only
- Success (200):
  - Login as admin → Execute → Expect `200` array.
- Error 401/403:
  - Remove token → `401`; non-admin → `403`.

### POST `/api/staff-orders`
- Access Control: Admin only
- Setup:
  - Use an order that is **not already assigned** (seed creates at least 2 assignments).
  - Recommended deterministic choice:
    - Login as customer → `GET /api/orders` → pick the order with `status: "seed-heavy"` → save `customerHeavyOrderId`.
    - Login as staff → `GET /api/staff/me` → save `staffId`.
- Success (201):
  - Login as admin → Body: `{ "orderId": customerHeavyOrderId, "staffId": staffId }` → Expect `201`.
- Error 409:
  - Execute the same request again (same orderId + staffId) → Expect `409`.
- Error 400:
  - Use `orderId=999999` or `staffId=999999` → Expect `400`.
- Error 401/403:
  - Remove token → `401`; non-admin → `403`.

### DELETE `/api/staff-orders`
- Access Control: Admin only
- Success (204):
  - Delete the assignment you created in POST:
    - Login as admin → Body: `{ "orderId": customerHeavyOrderId, "staffId": staffId }` → Expect `204`.
- Error 404:
  - Execute the same delete again (assignment no longer exists) → Expect `404`.
- Error 400:
  - Use invalid ids (0 or negative) → Expect `400`.
- Error 401/403:
  - Remove token → `401`; non-admin → `403`.

### GET `/api/staff-orders/me`
- Access Control: Authenticated
- Success (200):
  - Login as seeded staff → Execute → Expect `200` array.
  - If empty, login as admin and create an assignment using `POST /api/staff-orders`, then retry `GET /api/staff-orders/me`.
- Error 401:
  - Remove token → Expect `401`.
- Error 404:
  - Login as customer and call it (customer has no staff profile) → Expect `404`.