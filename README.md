-Remember to implement kafka for OTP sending
- make the auth system production grade, refer to the claude chat of auth and implement that.


#Good features already implemented:
- Rich text editor
- Auth is good but not best
- Cron Jobs for deleting products that too after a 24hr time to restore it

e-shop monorepo — Setup & Run
=============================

This repository contains a Node.js backend (monorepo with multiple services) and two Next.js frontends (seller and user). The instructions below will get you from a fresh clone to a running local development environment on a new machine.

Prerequisites
-------------
- Node.js (recommended >= 18). Verify with `node -v`.
- npm (bundled with Node) or a package manager you prefer (pnpm/yarn). Examples below use `npm`.
- A MongoDB instance (local or Atlas). You need connection strings for the services that use Prisma (see Environment).

Quick start (recommended)
-------------------------
1. Clone the repo:

	git clone <repo-url> && cd e-shop

2. Install backend workspace dependencies:

	cd backend
	npm install

3. Install each frontend's dependencies (in two terminals or sequentially):

	cd ../seller-frontend
	npm install

	cd ../user-frontend
	npm install

Environment variables
---------------------
Create a `.env` file at `backend/.env` (the backend services load this file). At minimum, set the MongoDB connection and JWT/Stripe/SMTP secrets used by the services. Example (fill in real values):

DATABASE_URL_AUTH_SERVICE="mongodb+srv://<user>:<pass>@cluster0.mongodb.net/auth_service_db?retryWrites=true&w=majority"
DATABASE_URL_PRODUCT_SERVICE="mongodb+srv://<user>:<pass>@cluster0.mongodb.net/product_service_db?retryWrites=true&w=majority"
ACCESS_SECRET="a_strong_jwt_secret"
REFRESH_SECRET="another_strong_jwt_secret"
STRIPE_SECRET_KEY="sk_test_..."
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_SERVICE="gmail"
SMTP_USER="you@example.com"
SMTP_PASSWORD="smtp_password"
NODE_ENV=development

Notes:
- Some Prisma generator datasource values reference environment variables inside `backend/packages/prisma/schema.prisma`. Ensure `DATABASE_URL_AUTH_SERVICE` (and other DB vars) exist.
- Frontends may expect an API base URL. Create `.env.local` inside `seller-frontend` and `user-frontend` with:

  NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

Generate Prisma client (if you change the schema)
------------------------------------------------
Prisma client for the backend is configured under `backend/packages/prisma`. If you change the Prisma schema or want to regenerate the client:

cd backend/packages/prisma
npx prisma generate

If you need to push the schema to a MongoDB database (development only):

npx prisma db push --preview-feature

Run services locally
--------------------
Open separate terminals for these services. Example commands:

# Start auth service (defaults to port 6001)
cd backend/apps/auth-service
npm run dev

# Start product service (defaults to port 6002)
cd backend/apps/product-service
npm run dev

# Start API gateway (defaults to port 8080)
cd backend/apps/api-gateway
npm run dev

Now start the frontends:

cd seller-frontend
npm run dev

cd user-frontend
npm run dev

The API Gateway proxies:
- /api -> auth-service (http://localhost:6001)
- /products -> product-service (http://localhost:6002)

So frontends should use `http://localhost:8080` as the base API URL (see `NEXT_PUBLIC_API_BASE_URL`).

Common commands
---------------
- Install backend workspace deps: `cd backend && npm install`
- Install a single app: `cd backend/apps/auth-service && npm install`
- Generate Prisma client: `cd backend/packages/prisma && npx prisma generate`
- Run a service: `cd backend/apps/<service> && npm run dev`
- Run a frontend: `cd seller-frontend && npm run dev`

Troubleshooting
---------------
- Ports: If a port is busy, adjust the service `PORT` environment variable or stop the conflicting process.
- Missing env var errors: double-check `backend/.env` and service-specific .env files.
- Prisma errors: ensure `DATABASE_URL_*` points to a reachable MongoDB and run `npx prisma generate`.

Notes & TODOs
-------------
- Kafka for OTP sending is not yet implemented.
- Auth can be hardened for production (see auth-service notes).

If you want, I can add a `scripts` helper to spawn all backend services concurrently or add a `.env.example` file — tell me which you prefer.