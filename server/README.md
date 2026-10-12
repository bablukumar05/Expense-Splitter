# Expense Splitter API

RESTful API backend for Splitly, a collaborative group expense splitting and debt settlement application.

## Overview

The API manages shared group finances, multi-payer expense tracking, debt simplification, settlement logs, and export reporting. Stored financial values use integer sub-units (paise) internally for arithmetic precision, with decimal rupees exposed at the API boundaries.

## Tech Stack

- **Runtime:** Node.js (v20+)
- **Framework:** Express 4
- **Database:** MongoDB via Mongoose ODM
- **Authentication:** JWT (Access & Refresh tokens) + bcrypt password hashing
- **Validation:** Zod schemas on requests
- **Documentation:** Swagger / OpenAPI via `swagger-ui-express`
- **Utilities:** Winston logger, Multer & Cloudinary (receipt uploads), PDFKit (PDF exports), node-cron (recurring expenses)

## Project Structure

```text
src/
  config/         Database connection, environment variables, Cloudinary, Swagger spec
  controllers/    HTTP request controllers
  jobs/           Cron scheduler for recurring transactions
  middleware/     Authentication, RBAC access control, rate limiting, error handler
  models/         Mongoose schemas (User, Group, Expense, Settlement, Activity)
  routes/         Express route definitions
  scripts/        Database seeding utility
  services/       Business logic (balances, debt simplification, exports, email)
  utils/          Math precision, debt minimization algorithm, tokens, async wrapper
  validators/     Zod request validation schemas
```

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- MongoDB instance (local replica set or MongoDB Atlas)

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   MONGO_URI=mongodb://localhost:27017/expense-splitter
   JWT_ACCESS_SECRET=your_super_secret_access_key_min_32_chars
   JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars
   ```

3. Seed demo data (optional):
   ```bash
   npm run seed
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Access interactive Swagger documentation:
   `http://localhost:5000/api/docs`

## Available Scripts

- `npm run dev`: Starts the server with Node watch mode.
- `npm start`: Runs the server in production mode.
- `npm run seed`: Seeds sample users and groups for local testing.
- `npm run check`: Performs syntax checks on entry files.

## API Endpoints

| Resource | Route | Description |
| :--- | :--- | :--- |
| **Auth** | `/api/auth` | User registration, login, logout, refresh token, password reset |
| **Users** | `/api/users` | Profile management, personal balances, notification settings |
| **Groups** | `/api/groups` | Group CRUD, member management, invite links, roles |
| **Expenses** | `/api/expenses` | Add, update, delete shared expenses, receipts, comments |
| **Balances** | `/api/groups/:id/balances` | Real-time group balances and debt simplification plan |
| **Settlements**| `/api/settlements` | Record debt payments and settle-up transactions |
| **Analytics** | `/api/groups/:id/stats` | Spending breakdowns, trends, and category distribution |
| **Exports** | `/api/groups/:id/export` | Download expenses in CSV or PDF formats |
| **Invites** | `/api/invite` | Public group preview and join by code |