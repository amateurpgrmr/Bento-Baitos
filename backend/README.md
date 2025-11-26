# Bento Baitos Backend - Setup Guide

This is the complete backend API for the Bento Baitos cafe ordering system, built with **Cloudflare Workers** and **D1 Database**.

## What's Included

- **Database Schema** - Tables for users, orders, order items
- **Customer API** - Create orders, upload payment proofs, track status
- **Admin API** - View orders, update status, see analytics
- **Payment Proof Storage** - Upload images to Cloudflare R2
- **Complete Frontend Integration Examples**

## Prerequisites

Before you begin, make sure you have:

1. **Node.js** installed (v16 or higher) - [Download here](https://nodejs.org/)
2. **A Cloudflare account** (free) - [Sign up here](https://dash.cloudflare.com/sign-up)
3. **Wrangler CLI** - Cloudflare's command-line tool

## Quick Start

### Step 1: Install Wrangler CLI

Open your terminal and run:

```bash
npm install -g wrangler
```

Verify installation:
```bash
wrangler --version
```

### Step 2: Login to Cloudflare

```bash
wrangler login
```

This will open your browser to authenticate with Cloudflare.

### Step 3: Navigate to Backend Folder

```bash
cd backend
```

### Step 4: Create D1 Database

Create your production database:

```bash
wrangler d1 create bento-baitos-db
```

You'll see output like:
```
✅ Successfully created DB 'bento-baitos-db'!

[[d1_databases]]
binding = "DB"
database_name = "bento-baitos-db"
database_id = "xxxx-xxxx-xxxx-xxxx"
```

**Important:** Copy the `database_id` value!

### Step 5: Update wrangler.toml

Open `wrangler.toml` and replace `YOUR_DATABASE_ID` with the ID from Step 4:

```toml
[[d1_databases]]
binding = "DB"
database_name = "bento-baitos-db"
database_id = "your-actual-id-here"  # ← Paste your ID here
```

### Step 6: Initialize Database Schema

Run the SQL schema to create all tables:

```bash
wrangler d1 execute bento-baitos-db --file=schema.sql
```

You should see:
```
✅ Executed schema.sql on bento-baitos-db
```

### Step 7: Create R2 Bucket (for Payment Proofs)

```bash
wrangler r2 bucket create bento-baitos-proofs
```

### Step 8: Enable R2 Public Access (Optional)

If you want payment proof images to be publicly viewable:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **R2** → **bento-baitos-proofs**
3. Go to **Settings** → **Public Access**
4. Enable public access and note the public URL
5. Update `wrangler.toml` with your R2 public URL:

```toml
[vars]
R2_PUBLIC_URL = "https://pub-xxxxx.r2.dev"  # Your R2 public URL
```

### Step 9: Deploy to Cloudflare Workers

Deploy your backend:

```bash
wrangler deploy
```

You'll see:
```
✅ Deployed bento-baitos-api
   https://bento-baitos-api.your-subdomain.workers.dev
```

**Copy this URL!** This is your API endpoint.

### Step 10: Test Your API

Test that everything works:

```bash
curl https://bento-baitos-api.your-subdomain.workers.dev/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Bento Baitos API is running"
}
```

## Connect Frontend to Backend

### Update Your React App

1. Create or update `.env` in your frontend root:

```env
VITE_API_BASE=https://bento-baitos-api.your-subdomain.workers.dev
```

2. Your existing `src/api/client.js` will automatically use this URL!

3. Restart your development server:

```bash
npm run dev
```

### Update Frontend Pages

See the complete integration guide: **[FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md)**

The guide includes copy-paste examples for:
- ✅ Checkout page (create order + upload proof)
- ✅ Order status page (track order)
- ✅ Admin orders page (list & update orders)
- ✅ Admin dashboard (statistics & charts)

## API Endpoints Reference

### Customer Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create new order |
| POST | `/api/orders/:orderId/proof` | Upload payment proof |
| GET | `/api/orders/:orderId` | Get order details |
| GET | `/api/orders/by-phone/:phone` | Get orders by phone |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/orders` | List all orders (filter by status) |
| PUT | `/api/admin/orders/:id/status` | Update order status |
| GET | `/api/admin/stats` | Get dashboard statistics |

### Order Status Flow

```
pending → paid → preparing → ready → completed
                       ↓
                   cancelled
```

## Database Schema

### Tables Created

- **users** - Customer information (name, phone)
- **orders** - Order details (order_uid, user_id, total_price, status, payment_proof_url)
- **order_items** - Individual items in each order
- **menu_items** (optional) - Menu catalog

## Payment Proof Upload

The backend supports two methods:

### Method 1: File Upload (Recommended)
```javascript
const formData = new FormData();
formData.append('proof', file);
await api.post(`/api/orders/${orderId}/proof`, formData);
```

### Method 2: Base64 String
```javascript
await api.post(`/api/orders/${orderId}/proof`, {
  proof_base64: "data:image/jpeg;base64,..."
});
```

Images are stored in your R2 bucket at:
```
payment-proofs/BENTO-20250125-0001-1234567890.jpg
```

## Development & Testing

### Local Development

Run your Worker locally:

```bash
wrangler dev
```

This starts a local server at `http://localhost:8787`

Update your frontend `.env`:
```env
VITE_API_BASE=http://localhost:8787
```

### Test with Real Data

Use the included test script to populate your database:

```bash
# Create a test order
curl -X POST http://localhost:8787/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Test User",
    "phone": "081234567890",
    "items": [
      {"item_id": "Espresso", "quantity": 2, "unit_price_cents": 25000},
      {"item_id": "Croissant", "quantity": 1, "unit_price_cents": 15000}
    ],
    "payment_method": "bank_transfer"
  }'
```

### View Database

Query your D1 database:

```bash
wrangler d1 execute bento-baitos-db --command="SELECT * FROM orders"
```

### View Logs

Monitor your Worker logs in real-time:

```bash
wrangler tail
```

## Troubleshooting

### Error: "Database binding not found"

Make sure you've:
1. Created the D1 database
2. Updated `wrangler.toml` with the correct `database_id`
3. Deployed with `wrangler deploy`

### Error: "R2 bucket not configured"

The backend will work without R2 (using placeholder URLs). To enable:
1. Create R2 bucket: `wrangler r2 bucket create bento-baitos-proofs`
2. Update `wrangler.toml` with bucket binding
3. Deploy again

### CORS Errors

The backend has CORS enabled by default. If you still get CORS errors:
1. Check that your frontend is using the correct API URL
2. Clear browser cache
3. Make sure the Worker is deployed

### Orders Not Showing in Admin

1. Check that orders were created successfully
2. Query database: `wrangler d1 execute bento-baitos-db --command="SELECT * FROM orders"`
3. Check browser console for errors
4. Verify API endpoint is correct in `.env`

## Production Deployment

### Custom Domain (Optional)

1. Go to Cloudflare Dashboard → Workers
2. Select your worker → **Triggers**
3. Add a custom domain (e.g., `api.bentobaitos.com`)
4. Update frontend `.env` with new domain

### Environment Variables

For production, you can set different variables:

```bash
wrangler deploy --env production
```

The `wrangler.toml` already has a production environment configured.

### Security Considerations

1. **No authentication by default** - Add authentication if needed
2. **Admin endpoints are open** - Consider adding API keys or authentication
3. **CORS is set to `*`** - Restrict to your domain in production:

```javascript
// In src/index.js, change:
'Access-Control-Allow-Origin': '*',
// To:
'Access-Control-Allow-Origin': 'https://yourdomain.com',
```

### Rate Limiting

Cloudflare Workers have generous free tier limits:
- **100,000 requests/day** on free plan
- **10ms CPU time per request**

For production, consider upgrading to Workers Paid ($5/month) for:
- Unlimited requests
- Higher CPU time limits

## Cost Estimate

Cloudflare offers generous free tiers:

| Service | Free Tier | Typical Usage (100 orders/day) | Cost |
|---------|-----------|-------------------------------|------|
| Workers | 100K req/day | ~3,000 requests/day | Free |
| D1 Database | 5M reads, 100K writes/day | ~10K reads, ~500 writes/day | Free |
| R2 Storage | 10GB storage, 1M reads/month | ~500MB, ~3K reads | Free |

**Total monthly cost: $0** for small to medium cafes!

## Next Steps

1. ✅ **Customize bank details** - Update payment info in `src/index.js` line 114
2. ✅ **Add menu items** - Optionally populate the `menu_items` table
3. ✅ **Integrate frontend** - Follow [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md)
4. ✅ **Test thoroughly** - Create test orders and verify the full flow
5. ✅ **Deploy frontend** - Deploy your React app (Cloudflare Pages, Vercel, etc.)
6. ✅ **Go live!** - Start accepting real orders

## File Structure

```
backend/
├── src/
│   └── index.js           # Main Worker code (all API endpoints)
├── schema.sql             # Database schema
├── wrangler.toml          # Cloudflare configuration
├── README.md              # This file (setup guide)
└── FRONTEND_INTEGRATION.md # Frontend integration examples
```

## Support & Resources

- **Cloudflare Workers Docs**: https://developers.cloudflare.com/workers/
- **D1 Database Docs**: https://developers.cloudflare.com/d1/
- **R2 Storage Docs**: https://developers.cloudflare.com/r2/
- **Wrangler CLI Docs**: https://developers.cloudflare.com/workers/wrangler/

## Example Payment Flow

1. **Customer** selects items → cart
2. **Customer** enters name + phone → checkout
3. **Backend** creates order → returns `order_uid` + bank details
4. **Customer** transfers money → uploads proof
5. **Backend** saves proof to R2 → updates order
6. **Admin** sees new order → verifies payment
7. **Admin** updates status: `pending` → `paid` → `preparing` → `ready`
8. **Customer** sees real-time status updates
9. **Admin** marks as `completed` when order is picked up

## Analytics Dashboard

The `/api/admin/stats` endpoint provides:

```json
{
  "totalOrders": 150,
  "totalRevenue": 7500000,
  "todayOrders": 12,
  "todayRevenue": 600000,
  "items": [
    { "name": "Espresso", "quantity_sold": 245 },
    { "name": "Cappuccino", "quantity_sold": 189 }
  ],
  "ordersByStatus": [
    { "status": "pending", "count": 5 },
    { "status": "completed", "count": 142 }
  ]
}
```

Perfect for Chart.js or Recharts integration!

## License

This backend is provided as-is for the Bento Baitos project. Feel free to modify and extend as needed.

---

**Questions?** Review the [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md) for detailed frontend examples.

**Ready to launch your cafe ordering system!** ☕
