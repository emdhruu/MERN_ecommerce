# MERN E-Commerce Platform

Full-stack e-commerce application with admin panel and customer storefront.

## Tech Stack

**Backend:** Node.js, Express 5, TypeScript, MongoDB, Mongoose, Redis, JWT, Nodemailer, node-cron  
**Frontend:** React 19, TypeScript, Vite, Redux Toolkit (RTK Query), React Router v7, Tailwind CSS, Radix UI, Recharts, Zod

## Backend Features

- JWT access/refresh token rotation with multi-device support
- Email OTP verification with Redis-backed cooldown and lockout
- Role-based access control (user/admin) with middleware chain
- Transactional order creation with atomic inventory reservation (MongoDB sessions)
- Full order lifecycle: Reserve > Payment > Confirm/Cancel with stock rollback
- Inventory ledger with audit trail (IN, OUT, RESERVE, RELEASE, ADJUST)
- Purchase Order to GRN (Goods Receipt Note) inbound flow with partial delivery
- Low stock threshold alerts via email
- Coupon engine: percentage/fixed discounts, min purchase, usage limits, per-user tracking
- Tax and Charges configuration (all products or selective, min/max order conditions)
- Invoice generation (Sales from orders, Purchase from POs) with auto-numbering
- Admin dashboard analytics: revenue aggregation, top products, sales stats
- Notification system: new order, payment failure, low stock, daily summary cron
- Customer email notifications on order status changes
- Redis response caching middleware with request hashing
- Refresh token array cleanup on rotation (removes expired tokens)

## Frontend

React SPA with two layouts: customer storefront and admin panel.

**Storefront:** Product listing with filters/sort/search, product detail, cart with quantity management, checkout with address selection and coupon application, order history with detail dialog, user profile with address CRUD, product reviews.

**Admin Panel:** Dashboard with revenue charts, product/category/brand management, order management with status actions and invoice generation, inventory with stock operations, purchase orders with GRN flow, inventory ledger with per-product PDF reports, coupons, invoices (PDF/CSV download), user management, tax and charges configuration, store settings, notification preferences.

## Run Locally

```bash
# Backend
cd backend
npm install
npm run seed   # Seeds admin, user, categories, brands, products, inventory, coupons, taxes, charges
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## Login Credentials

After running seed:

| Role  | Email                | Password |
| ----- | -------------------- | -------- |
| Admin | admin@mern-ekart.com | admin123 |
| User  | user@mern-ekart.com  | user1234 |

## Environment Variables (backend/.env)

```
PORT=3000
MONGO_URI=
JWT_ACCESS_TOKEN_SECRET=
JWT_REFRESH_TOKEN_SECRET=
REDIS_URL=
EMAIL_USER=
EMAIL_PASS=
TOKEN_KEY=
```
