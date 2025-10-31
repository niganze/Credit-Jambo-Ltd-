Credit Jambo Ltd — Junior Developer Practical Test (Mono-repo)

This repository is a mono-repo containing three main apps:

backend/ — Node.js / Express API (authentication, savings, admin features)

frontend/ — React web client (customer UI and/or management UI)

mobile/ — React Native (optional) mobile client

Goal: implement a Savings Management System that supports customers (register, login, deposit, withdraw, view transactions) and admin/management interfaces (verify devices, view customers, balances, transactions).

Table of contents

Highlights / What I implemented

Repo structure

Prerequisites

Setup & Run (local)

Backend

Frontend

Mobile (optional)

Environment variables (.env.example)

Key API Endpoints (core)

Auth & Security

Data Transfer Objects (DTOs)

Testing

Deployment notes

Assumptions & Notes to reviewers

Contact / Submission info

Highlights / What I implemented

Mono-repo containing backend, frontend, mobile (if mobile built).

Customer flows: register, login, deposit, withdraw, view balance & transactions.

Admin flows: verify device IDs, view customers & transaction history.

Security: SHA-512 password hashing (on backend), JWT auth, input validation, secure headers, rate limiting basics.

DTOs applied to responses to remove sensitive fields.

Basic protection: withdrawals prevented if balance insufficient.

Example .env.example and README for each sub-project.

Basic tests for critical backend routes (if tests folder present).

Optional: Postman collection / Swagger (if included, located in /docs).

Repo structure
/ (root)
├─ backend/
│  ├─ src/
│  │  ├─ controllers/
│  │  ├─ services/
│  │  ├─ models/
│  │  ├─ dtos/
│  │  ├─ middlewares/
│  │  └─ utils/
│  ├─ tests/
│  ├─ package.json
│  └─ server.ts
├─ frontend/
│  ├─ src/
│  │  ├─ components/
│  │  ├─ pages/   (or app/ if Next.js)
│  │  ├─ services/
│  │  └─ utils/
│  ├─ public/
│  └─ package.json
├─ mobile/ (optional)
│  └─ ...
├─ .gitignore
├─ README.md
└─ .env.example

Prerequisites

Node.js >= 16 (or matching your project target)

npm or yarn / pnpm

(Optional) Docker if using dockerized setup

(Optional) Expo / React Native CLI for mobile

Setup & Run (local)

All commands are run from the repository root unless noted.

Backend

Install dependencies:

cd backend
npm install
# or: yarn


Create .env from .env.example and set values.

Run database migrations / seed (if included):

npm run migrate
npm run seed


Start the dev server:

npm run dev


Default: http://localhost:4000 (adjust if different).

Typical scripts in backend/package.json:

dev: start in dev (nodemon / ts-node)

start: production start

test: run tests

Frontend

Install:

cd frontend
npm install
# or: yarn


Configure environment variables (if any) — usually NEXT_PUBLIC_API_URL or VITE_API_URL.

Start:

npm run dev


Default: http://localhost:3000 (Next/Vite default)

Mobile (optional)

Install:

cd mobile
npm install


Start (Gradle / RN):

npm run start

Environment variables (.env.example)

Place an .env at the root of backend/ and frontend/ as required.

Example for backend/.env.example:

PORT=4000
DATABASE_URL=postgres://user:pass@localhost:5432/creditjambo
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1d
SALT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100


Example for frontend/.env.example:

VITE_API_URL=http://localhost:4000


Do not commit real secrets — only .env.example must be committed.

Key API Endpoints (core)

Base: POST http://localhost:4000/api (example)

Auth

POST /auth/register — register a customer

Body: { name, email, password, deviceId }

Password hashed with SHA-512 (server-side). Device ID stored as unverified until admin verifies.

POST /auth/login — login

Body: { email, password, deviceId }

Requires device verified by admin for successful login.

POST /auth/logout — logout (invalidate token or rely on JWT expiry)

Customer (protected)

GET /customers/me — get profile and balance (DTO applied)

POST /savings/deposit — deposit to account

Body: { amount }

POST /savings/withdraw — withdraw (fails if insufficient funds)

Body: { amount }

GET /savings/transactions — list transaction history

Admin (protected — admin auth)

GET /admin/customers — list all customers (DTO output)

GET /admin/customers/:id/transactions — view transactions for customer

POST /admin/devices/:deviceId/verify — mark device as verified

GET /admin/stats — optional stats endpoint

Auth & Security

Passwords hashed using SHA-512 (server-side). Consider adding salts.

JWT tokens for sessions. JWT secret provided via env var.

Device verification: each registered deviceId is stored and must be verified by admin before allowing login from that device.

Rate limiting middleware (e.g., express-rate-limit) applied to auth endpoints.

Input validation & sanitization (Joi / Zod / express-validator).

Secure HTTP headers (helmet).

Secrets are in .env, not committed.

Data Transfer Objects (DTOs)

DTOs transform model objects to response payloads, omitting sensitive fields (passwordHash, internal IDs, salts).

Example CustomerDTO:

{
  id: string;
  name: string;
  email: string;
  balance: number;
  isVerified: boolean;
}


DTOs live in backend/src/dtos/ and used in controllers to map model -> DTO.

Testing

Backend tests (unit/integration) live in backend/tests/.

Run backend tests:

cd backend
npm run test


Use Jest / Vitest depending on your setup.

Deployment notes

Backend: deploy to Heroku / Railway / Render / DigitalOcean. Ensure env vars are set.

Frontend: deploy to Vercel (Next.js) or Netlify (Vite/React). Set VITE_API_URL/NEXT_PUBLIC_API_URL.

Mobile: publish or share Expo link.

(Optional) Docker: docker-compose for DB + backend; include Dockerfile for each service if provided.

Assumptions & Notes to reviewers

This repo is a mono-repo. The frontend, backend and mobile implementations live in separate folders (/frontend, /backend, /mobile).

Password hashing uses SHA-512 per spec — in production prefer bcrypt/argon2 or SHA with robust salt and good iteration strategy.

Device verification is per device ID supplied at registration/login — admin must approve device in admin panel for that ID to allow logins.

Sessions are JWT-based: short expiry, rely on refresh strategy or re-login on expiry.

DTOs are applied to all responses to protect sensitive fields.

For time constraints, optional features (push notifications, full analytics dashboard) may be stubbed or included partially — see project README in each subfolder for details.

Developer tips & recommended workflow

Work one flow at a time: auth → deposit/withdraw → admin verify → transactions.

Keep commits small and descriptive (e.g., feat(auth): implement login flow, fix: prevent overdraft withdrawals).

Use Postman / Insomnia to test endpoints and include a collection under /docs if possible.

Add README.md to both backend/ and frontend/ describing local start scripts and env vars.

What I submitted (links)

Live site: https://credit-jambo-ltd.vercel.app/

Figma: https://www.figma.com/design/eyXglWKX2gcFTszneYvlBj/jamboo?node-id=0-1&p=f&t=bvzq7YwwXxeAMVYM-0

GitHub mono-repo: https://github.com/niganze/Credit-Jambo-Ltd-

Contact / Submission info

Submitted by: Alain NIGANZE
GitHub: https://github.com/niganze

LinkedIn: https://www.linkedin.com/in/alain-dev/

Email: niganzealain@gmail.com

Final note to reviewers

If anything needs to be run differently on your environment (different ports, different DB url), please check the per-app README.md files in /backend and /frontend for exact scripts and .env names.
