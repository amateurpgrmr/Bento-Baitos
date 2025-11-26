# Bento Baitos — Frontend UI (v1.1)

This project is a frontend-first UI/UX starter for the Bento Baitos cafe ordering system.

## What I added in this version
- Admin Dashboard UI (Menu manager, Orders, Proofs)
- Full client-side cart logic (with localStorage persistence)
- Payment proof upload in Checkout
- Menu categories & search filters
- Animations using Framer Motion
- API helper (axios) and graceful fallbacks for demo mode

## How to run
1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Environment: set `VITE_API_BASE` to your backend API URL for real integration.

## How the UI connects to backend
- `GET /api/items` -> menu list
- `POST /api/orders` -> create order (returns `order_uid`, payment details)
- `POST /api/orders/:order_uid/proof` -> upload proof (multipart/form-data)
- Admin endpoints under `/api/admin/...`

See `src/api/client.js` and pages for usage examples.
