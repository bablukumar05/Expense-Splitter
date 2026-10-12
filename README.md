# Splitly

A modern full-stack web application to split group expenses and settle debts with the fewest transactions.

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, TanStack React Query
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, Zod

## Features

- **Group Expenses:** Create groups, add members, and split expenses equally, by exact amounts, percentages, or shares.
- **Smart Debt Simplification:** Graph-based minimization algorithm reduces overall payment transactions.
- **Invite Links & QR:** Shareable group invite links with instant member previews.
- **Analytics & Exports:** Visual spending breakdowns and PDF/CSV export support.

## Getting Started

### Prerequisites

- Node.js (v20+)
- MongoDB database (local or MongoDB Atlas)

### 1. Backend Setup

```bash
cd server
npm install
npm run dev
```

Server runs on `http://localhost:5000` (API documentation: `http://localhost:5000/api/docs`).

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev
```

Client runs on `http://localhost:5173`.

## Environment Variables

**Backend (`server/.env`):**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
CLIENT_URL=http://localhost:5173
```

**Frontend (`client/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
```

## License

MIT
