# Storefront (Customer App)

Customer-facing storefront built with React 19 + Vite + Tailwind CSS.

## Features

- Browse products, categories, collections
- Product details + variants (UI)
- Cart + wishlist (wishlist is stored in browser localStorage)
- Customer signup/login + profile
- Checkout with Razorpay (and COD if enabled on backend)
- Track shipments (AWB tracking UI)

## Tech Stack

- React 19, Vite
- Tailwind CSS
- React Router
- Axios

## Local Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Set `VITE_API_URL` in `frontend/.env` to match your backend (include `/api`), for example:

```env
VITE_API_URL=http://localhost:8000/api
```
