# DealFlow360 — Enterprise B2B Revenue Operations Platform

> **Odoo Hackathon 2026 — Final Round Submission** | Team ByteMatrix

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript)](https://typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-3.11+-3776ab?logo=python)](https://python.org)

---

## 🎯 What is DealFlow360?

DealFlow360 is a full-stack, enterprise-grade B2B CRM and Revenue Operations platform that unifies deal management, subscription billing, multi-level approval workflows, and customer self-service — all in a single, beautifully designed portal.

### The Problem We Solve

B2B companies lose revenue because:
- Sales teams manage quotes in spreadsheets
- Finance uses disconnected billing systems  
- Customers have no real-time visibility into their invoices/subscriptions
- Discount approvals happen over email with no audit trail

**DealFlow360 fixes all of this.**

---

## ✨ Key Features

| Module | What It Does |
|--------|-------------|
| 🎯 **CRM Pipeline** | Lead-to-deal tracking with stage management |
| 📋 **Quotation Engine** | Multi-product quotes with discount tier pricing |
| ✅ **Approval Workflows** | Multi-level approvals (Sales → Finance → Admin) |
| 💳 **Billing & Invoicing** | Subscription billing, invoice management |
| 🏢 **Customer Portal** | Self-service: invoices, quotes, subscriptions |
| 📊 **Deal Health** | AI-assisted deal scoring and risk alerts |
| 🏭 **Warehouse** | Inventory tracking and stock adjustments |
| 👥 **User Management** | Role-based access control |
| 🔖 **Discount Tiers** | Bronze/Silver/Gold/Platinum customer tiers |

---

## 👥 Role-Based Access Control

| Feature | Admin | Sales Manager | Finance | Customer |
|---------|:-----:|:-------------:|:-------:|:--------:|
| Dashboard | ✅ | ✅ | ✅ | — |
| Customers | ✅ CRUD | 👁 View | 👁 View | — |
| **Discount Tiers** | ✅ **Manage** | 👁 View | 👁 View | — |
| Quotations | ✅ All | ✅ Create | ✅ Approve | — |
| Billing | ✅ All | — | ✅ Full | 👁 Own |
| Portal | — | — | — | ✅ |

> 🔑 **Only Admins** can upgrade/downgrade customer discount tiers. This is enforced at both the API and UI level.

---

## 🔐 Authentication

- **Email + Password** login
- **2FA via TOTP** (Google Authenticator / Authy compatible)
- **JWT Bearer tokens** (access + refresh)
- **Auto-refresh** on 401 responses
- **Role-based** route protection

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL (or SQLite for dev)

### Backend
```bash
cd backend
cp .env.example .env   # configure your DB URL
pip install -r requirements.txt
alembic upgrade head   # run migrations
uvicorn main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL
npm run dev
```

App available at: http://localhost:3000

---

## 🛠️ Tech Stack

**Frontend**: Next.js 15 (App Router) · TypeScript · Tailwind CSS · Radix UI · Recharts · TanStack Query  
**Backend**: FastAPI · SQLAlchemy 2.x · Alembic · PyJWT · PyOTP · Pydantic v2  
**Database**: PostgreSQL (production) / SQLite (dev)

---

## 📁 Structure

```
dealflowbyteamatri/
├── backend/          # FastAPI application
│   ├── app/
│   │   ├── api/v1/   # 13 API endpoint modules
│   │   ├── models/   # SQLAlchemy models
│   │   ├── schemas/  # Pydantic schemas
│   │   └── services/ # Business logic
│   └── alembic/      # Database migrations
│
└── frontend/         # Next.js application
    └── src/
        ├── app/
        │   ├── (auth)/       # Auth pages
        │   ├── (workspace)/  # Admin workspace (30+ pages)
        │   └── (portal)/     # Customer portal
        ├── components/       # UI component library
        └── lib/api/          # API client + services
```

---

## 🧪 Quality

- ✅ **0 ESLint errors**
- ✅ **0 TypeScript errors** (strict mode)
- ✅ **45 routes** build successfully
- ✅ **CORS** configured for local + production
- ✅ **Graceful fallback** to sample data when backend offline

---

## 🔗 API Endpoints

| Group | Prefix | Description |
|-------|--------|-------------|
| Auth | `/api/v1/auth` | Login, refresh, 2FA |
| Users | `/api/v1/users` | User CRUD, roles |
| Customers | `/api/v1/customers` | Customer management + tiers |
| Quotations | `/api/v1/quotations` | Quote lifecycle |
| Approvals | `/api/v1/approvals` | Approval workflows |
| Billing | `/api/v1/billing` | Invoices, payments |
| Subscriptions | `/api/v1/subscriptions` | Recurring billing |
| Catalog | `/api/v1/products` | Products + variants |
| Pricing | `/api/v1/pricing` | Pricelists, ceilings |
| Discount | `/api/v1/discounts` | Tiers + rules |
| Warehouse | `/api/v1/warehouse` | Stock, adjustments |
| Upsell | `/api/v1/upsell` | Upsell rules |
| Portal | `/api/v1/portal` | Customer self-service |

---

## 📸 Screenshots

> Run the app locally to see the full enterprise UI experience.

---

*Built with ❤️ for Odoo Hackathon 2026 by Team ByteMatrix*
