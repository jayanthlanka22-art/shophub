# ShopHub

[![Live Demo](https://img.shields.io/badge/Live_Demo-View_Online-blue?style=for-the-badge)](https://shophub-frontend-4x2h.onrender.com)

A full-stack e-commerce app — product catalog, cart, checkout, order tracking, and an admin panel for managing all of it.

Built with React + Vite + TypeScript on the frontend and Node/Express + MongoDB on the backend, with JWT auth (access + refresh tokens in httpOnly cookies) and Zustand for client state.

## Why this exists

Wanted something bigger than a CRUD tutorial to actually understand how auth, cart persistence, and order state work together in a real app — not just individually. Cart merging on login and the order status state machine were the two things that took the most iteration to get right.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| State | Zustand |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT (access + refresh), bcrypt, httpOnly cookies |
| Validation | Zod |

## Features

- Product catalog with search (debounced), category filter, price sort, pagination
- Cart that works logged-out (localStorage) and logged-in (server-side), merging the two on login
- Checkout flow with a mock payment step — structured so a real gateway (Stripe/Razorpay) can be dropped in later without touching the rest of the order logic
- Order status lifecycle: pending → processing → shipped → delivered, with cancellation as a branch
- Admin panel: product/category CRUD, order management with status transitions, dashboard with revenue/low-stock stats, user list

## Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
# set MONGO_URI, and change the JWT secrets to real random values
npm run seed     # 15 products across 3 categories + an admin account
npm run dev      # http://localhost:5000
```

Seeded admin login (override in `.env` via `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`):
- `admin@example.com` / `Admin@12345`

Registration always creates a `user` role — there's no way to self-promote to admin through the API. To make someone an admin, update it directly in the DB:
```js
db.users.updateOne({ email: "someone@example.com" }, { $set: { role: "admin" } })
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev      # http://localhost:5173
```

### API testing

`backend/api-tests.http` has every endpoint as a runnable request — works with the VS Code REST Client extension, or import into Postman/Insomnia.

## How auth works

Login/register set two httpOnly cookies — a short-lived access token and a longer refresh token scoped to `/api/auth`. The frontend's axios instance catches expired-token 401s, silently calls `/auth/refresh`, and retries the original request, so sessions extend up to 7 days without the user noticing.

## Guest cart

Logged-out users get a cart in `localStorage`. On login/register, those items get pushed into the user's real server-side cart and localStorage is cleared. After that the cart lives entirely on the backend.

## Known limitations

- No real payment gateway — placing an order simulates success immediately. The payment step is isolated enough that swapping in Stripe later shouldn't touch anything else.
- Stock decrement on order placement uses sequential guarded updates rather than a DB transaction, since transactions need a replica set and this was built/tested against a standalone MongoDB instance. Worth switching to `session.withTransaction()` if this ever runs against a replica set or Atlas.
- Deleting a category doesn't cascade to its products — they'll keep a reference to a category that no longer exists. There's a confirm-dialog warning in the admin UI, but no hard block yet.

## Testing checklist

**User flow:** register → browse/search/filter → add to cart as guest → log in and confirm cart merges → checkout → view order in "My Orders."

**Admin flow:** log in as admin → dashboard stats load → create/edit/delete a product and category → view all orders, filter by status, move an order through its lifecycle → view users list.

## License

MIT
