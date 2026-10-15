# SplitMate — Group Expense Sharing & Debt Simplification Platform

A production-grade, full-stack expense sharing application built with the MERN stack. Create groups, split expenses across multiple payers and split types, track net balances, and minimize settlement transactions using graph-based debt simplification.

## Key Engineering Highlights

- **Financial Precision in Discrete Integer Paise**: All expense amounts, splits, and balances are stored as discrete integer paise, eliminating IEEE-754 floating-point inaccuracies. Split rounding implements the Largest Remainder Method to guarantee that sum of splits equals total amount with 0 paise variance.
- **Graph Debt Simplification Algorithm**: Collapses multi-party circular debts into the minimum possible settlement transactions.
- **ACID Transactions**: MongoDB multi-document transactions ensure atomicity during expense creation, deletion, and settlement processing.
- **Modern Responsive UX**: Glassmorphism dark mode with Tailwind CSS v4, PWA offline support with precaching, and TanStack React Query for async state management and cache invalidation.

## Core Features

- **Groups & Invites**: Group creation with categories, secure invite links with expiration/usage limits, QR codes, and placeholder members.
- **Multi-Method Expense Splitting**: Supports Equal, Exact, Percentage, and Shares-based allocations with multiple payers.
- **Receipts & Attachments**: Photo upload with in-browser compression.
- **Settlement & Settle Up**: Minimum-transactions debt simplification plan, UPI deep link integration, and transaction undo functionality.
- **Analytics & Visualizations**: Category breakdowns, monthly spending trends, and top spender tracking powered by Recharts.
- **Export Reports**: One-click statement generation in CSV and PDF formats.
- **Recurring Expenses**: Automated weekly/monthly recurring rules with pause, resume, and skip controls.
- **Authentication & Security**: JWT with access and refresh token rotation, Web Locks tab synchronization, and secure password reset workflows.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS v4, TanStack Query, React Hook Form, Zod, Recharts, Lucide Icons, Vite PWA
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, Swagger OpenAPI

## Getting Started

### 1. Backend Setup
```bash
cd server
npm install
npm run dev
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```

### Environment Configuration

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (e.g. `http://localhost:5000/api`) |
| `VITE_APP_URL` | Public application URL |
| `VITE_DEMO_EMAIL` | Optional live demo email credentials |
| `VITE_DEMO_PASSWORD` | Optional live demo password credentials |

## Available Scripts

- `npm run dev`: Launch local development server
- `npm run build`: Production build with PWA service worker precaching
- `npm run preview`: Preview production build locally

## Deployment

- **Frontend**: Vercel (SPA routing configured in `vercel.json`)
- **Backend**: Render
- **Database**: MongoDB Atlas
