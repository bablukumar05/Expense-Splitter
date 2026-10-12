# Splitly - Smart Expense Splitting & Debt Settlement

A modern, full-stack group expense sharing and financial settlement platform built with React, Vite, Node.js, Express, and MongoDB.

## Features

- **Group Management:** Create trips, household, or event groups with custom currencies and icons.
- **Flexible Splitting:** Split by equal shares, exact amounts, percentages, or weighted shares.
- **Debt Simplification:** Graph-based debt minimization algorithm reduces the total transactions needed to settle up.
- **Multi-Payer Support:** Support for multiple people paying for a single transaction.
- **Invites & Deep Links:** Shareable invite codes and direct links with QR codes and member previews.
- **Activity & Analytics:** Real-time balance calculations, spending categories, PDF/CSV export, and activity audit trails.
- **Responsive UI:** Modern design with light slate surfaces, mobile tab navigation, and desktop sidebar layouts.

## Tech Stack

### Frontend (`client/`)
- **Framework:** React 19, Vite
- **Styling:** Tailwind CSS v4, Lucide Icons
- **State & Data Fetching:** TanStack React Query v5
- **Routing:** React Router v7
- **Forms & Validation:** React Hook Form, Zod

### Backend (`server/`)
- **Runtime:** Node.js (v20+), Express.js
- **Database:** MongoDB via Mongoose
- **Auth & Security:** JWT (Access & Refresh tokens), bcrypt, Helmet, Rate Limiting
- **File Uploads & Media:** Multer, Cloudinary
- **Exports:** PDFKit (PDF reports), CSV generation
- **Documentation:** OpenAPI / Swagger UI

## Repository Layout

```text
.
├── client/          # Frontend React SPA
│   ├── src/
│   │   ├── api/          # API integration layer
│   │   ├── components/   # Reusable UI primitives & layouts
│   │   ├── features/     # Feature-scoped components and hooks
│   │   ├── hooks/        # Shared custom hooks
│   │   ├── lib/          # Utilities and query client
│   │   └── pages/        # Route pages
├── server/          # Backend REST API
│   ├── config/       # Environment, database, cloud configurations
│   ├── controllers/  # Route controller logic
│   ├── middleware/   # Auth, validation, error handling
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API endpoints
│   ├── services/     # Core business logic & algorithms
│   ├── utils/        # Mathematical helpers & formatters
│   ├── server.js     # Server entry point
│   └── app.js        # Express app definition
└── README.md
```

## Quick Start

### 1. Backend Setup
```bash
cd server
npm install
npm run dev
```
The server will start on `http://localhost:5000` (interactive API documentation available at `http://localhost:5000/api/docs`).

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
The client application will start on `http://localhost:5173`.

## Core API Endpoints

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

## License

MIT
