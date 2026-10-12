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
- **Runtime:** Node.js, Express.js
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
│   ├── src/
│   │   ├── config/       # Environment, database, cloud configurations
│   │   ├── controllers/  # Route controller logic
│   │   ├── middleware/   # Auth, validation, error handling
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Core business logic & algorithms
│   │   └── utils/        # Mathematical helpers & formatters
└── README.md
```

## Quick Start

### 1. Backend Setup
```bash
cd server
npm install
cp .env.example .env # configure your MongoDB URI and JWT secrets
npm run dev
```
The server will start on `http://localhost:5000` (API documentation available at `http://localhost:5000/api/docs`).

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
The client application will start on `http://localhost:5173`.

## License

MIT
