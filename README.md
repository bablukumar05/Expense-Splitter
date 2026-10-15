# SplitMate — Group Expense Sharing & Debt Simplification Platform

[![Live Demo](https://img.shields.io/badge/Demo-Live_Website-6366f1?style=for-the-badge&logo=vercel)](https://expense-splitter-ochre-seven.vercel.app)
[![API Docs](https://img.shields.io/badge/API-Swagger_Docs-10b981?style=for-the-badge&logo=swagger)](https://expense-splitter-e70k.onrender.com/api/docs)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

A modern, full-stack expense sharing web application built with the MERN stack. Split expenses across multiple payers and custom splits (Equal, Exact, Percentage, Shares), track net group balances, and minimize settlement transactions using graph-based debt simplification with one-click UPI payments.

---

## 🚀 Live Links

- **Web Application:** [https://expense-splitter-ochre-seven.vercel.app](https://expense-splitter-ochre-seven.vercel.app)
- **Backend API:** [https://expense-splitter-e70k.onrender.com](https://expense-splitter-e70k.onrender.com)
- **Interactive Swagger API Docs:** [https://expense-splitter-e70k.onrender.com/api/docs](https://expense-splitter-e70k.onrender.com/api/docs)

---

## ⚡ Key Engineering Highlights

- **Discrete Integer Paise Precision:** All money values, splits, and balances are calculated and stored as integer paise to eliminate IEEE-754 floating-point inaccuracies. Implements the Largest Remainder Method to guarantee split totals match exactly with zero variance.
- **Graph Debt Simplification:** Automatically collapses complex circular debts among members into the minimal number of direct settlement transfers.
- **ACID Database Transactions:** Multi-document MongoDB transactions ensure atomicity across expense creation, balance revisions, and settlement recording.
- **Progressive Web App (PWA):** Installable on desktop and mobile devices with Workbox offline precaching support.
- **Production-Grade Security:** JWT access and refresh token rotation, cross-tab synchronization via Web Locks API, rate limiting, and HTTP-only cookie support.

---

## ✨ Features

- **Group Management:** Categories (Trip, Home, Friends, etc.), invite links with expiration and usage limits, QR code scanning, and placeholder members.
- **Flexible Expense Splitting:** Equal, Exact, Percentage, and Shares-based allocations with support for multiple payers.
- **Receipt Attachments:** Image upload with automated in-browser client compression powered by Cloudinary.
- **One-Tap Settle Up:** Minimal payment plans with deep-linked UPI settlement links (`upi://pay`) and settlement reversal/undo capabilities.
- **Visual Analytics:** Interactive monthly spending charts, category breakdown donuts, and top spender bars powered by Recharts.
- **Export Statements:** Instant export of complete group expense histories to CSV and PDF formats.
- **Recurring Expenses:** Automated weekly and monthly scheduled expenses with pause, resume, and skip controls.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS v4, TanStack Query v5, React Hook Form, Zod, Recharts, Lucide Icons, Vite PWA |
| **Backend** | Node.js (v20+), Express.js, MongoDB Atlas, Mongoose, JWT, Nodemailer, Cloudinary, Swagger / OpenAPI 3.0 |
| **Deployment** | Vercel (Frontend), Render (Backend), MongoDB Atlas (Database) |

---

## 🏁 Getting Started

### Prerequisites
- Node.js >= 20.0.0
- MongoDB instance (Local or Atlas)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/bablukumar05/Expense-Splitter.git
cd Expense-Splitter
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_jwt_secret_min_32_characters
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173
```

Start backend development server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```

Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_URL=http://localhost:5173
```

Start frontend development server:
```bash
npm run dev
```

The application will be live at `http://localhost:5173`.

---

## 📜 Available Scripts

### Client (`/client`)
- `npm run dev`: Launch local development server with HMR
- `npm run build`: Compile optimized production build with PWA service worker
- `npm run preview`: Preview production build locally
- `npm run lint`: Run Oxlint code analysis

### Server (`/server`)
- `npm run dev`: Launch server with file watching
- `npm start`: Start production server
- `npm run check`: Verify syntax on server entry files
- `npm run seed`: Seed database with demo group and mock data

---

## 👨‍💻 Author

**Bablu Kumar**  
- GitHub: [@bablukumar05](https://github.com/bablukumar05)

---

## 📄 License

This project is licensed under the MIT License.
