# 🎉 Bento Baitos - Local Deployment Complete!

Your complete cafe ordering system is now running locally!

## ✅ What's Running

### Backend API Server
- **URL:** http://localhost:8787
- **Status:** Running with Wrangler
- **Database:** D1 (SQLite) - Local
- **Storage:** R2 (Mock) - Local

### Frontend UI
- **URL:** http://localhost:5173
- **Status:** Running with Vite
- **Framework:** React + Tailwind CSS

## 🚀 Access Your Application

### Customer Interface
Open your browser and visit:
```
http://localhost:5173
```

You can:
- Browse menu items
- Add items to cart
- Place orders
- Track order status
- Upload payment proofs

### Admin Dashboard
Visit the admin panel:
```
http://localhost:5173/admin
```

You can:
- View all orders
- Update order statuses
- See analytics and stats
- Review payment proofs

## 📊 Test Data

I've created a test order for you:

**Order ID:** `BENTO-20251125-0001`
**Customer:** Test User (081234567890)
**Items:** 2x Espresso (Rp 50,000)
**Status:** Pending

### View Test Order
Visit: http://localhost:5173/status/BENTO-20251125-0001

## 🧪 Testing the API

The backend API is fully functional. Test with curl:

### Health Check
```bash
curl http://localhost:8787/api/health
```

### Create Order
```bash
curl -X POST http://localhost:8787/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "John Doe",
    "phone": "081234567890",
    "items": [
      {"item_id": "Cappuccino", "quantity": 1, "unit_price_cents": 35000}
    ],
    "payment_method": "bank_transfer"
  }'
```

### Get Order Status
```bash
curl http://localhost:8787/api/orders/BENTO-20251125-0001
```

### Get Admin Stats
```bash
curl http://localhost:8787/api/admin/stats
```

### List All Orders (Admin)
```bash
curl http://localhost:8787/api/admin/orders
```

## 📁 Local Database

Your local database is stored at:
```
backend/.wrangler/state/v3/d1/
```

### Query Database Directly
```bash
cd backend
wrangler d1 execute bento-baitos-db --local --command="SELECT * FROM orders"
```

### View All Orders
```bash
cd backend
wrangler d1 execute bento-baitos-db --local --command="
  SELECT o.order_uid, u.name, u.phone, o.status, o.total_price
  FROM orders o
  JOIN users u ON o.user_id = u.id
"
```

## 🎨 Making Changes

### Frontend Changes
The frontend automatically reloads when you make changes to:
- `src/**/*.jsx` - React components
- `src/**/*.css` - Styles
- Any other source files

Just edit and save - changes appear instantly!

### Backend Changes
After editing `backend/src/index.js`, the server will auto-reload.

If it doesn't, restart with:
```bash
# Stop current server (Ctrl+C in the terminal running wrangler)
# Then start again:
cd backend
wrangler dev --local --port 8787
```

## 📋 Complete Workflow Test

### 1. Customer Places Order
1. Visit http://localhost:5173
2. Browse menu (or add items manually)
3. Click cart icon
4. Go to checkout
5. Enter name and phone
6. Place order
7. Note the order ID

### 2. Customer Tracks Order
1. Visit http://localhost:5173/status/YOUR-ORDER-ID
2. See order details and status

### 3. Admin Manages Order
1. Visit http://localhost:5173/admin/orders
2. Find the order
3. Update status: pending → paid → preparing → ready → completed
4. Customer sees real-time updates!

### 4. Admin Views Analytics
1. Visit http://localhost:5173/admin
2. See:
   - Total revenue
   - Order counts
   - Popular items
   - Orders by status

## 🛠️ Troubleshooting

### Backend Not Responding
```bash
# Check if backend is running
curl http://localhost:8787/api/health

# If not, restart:
cd backend
wrangler dev --local --port 8787
```

### Frontend Not Loading
```bash
# Check if frontend is running
# Visit http://localhost:5173

# If not, restart:
npm run dev
```

### Port Already in Use
```bash
# If port 8787 is busy:
cd backend
wrangler dev --local --port 8788

# Update .env:
VITE_API_BASE=http://localhost:8788

# Restart frontend:
npm run dev
```

### Database Issues
```bash
# Reset database
cd backend
rm -rf .wrangler/state/v3/d1/
wrangler d1 execute bento-baitos-db --local --file=schema.sql
```

## 📝 Current Configuration

### Environment Variables
Location: `.env`
```
VITE_API_BASE=http://localhost:8787
```

### Backend Config
Location: `backend/wrangler.toml`
- Database: bento-baitos-db (local)
- R2 Bucket: bento-baitos-proofs (local)

## 🚀 Next Steps

### To Customize
1. **Update Bank Details**
   - Edit `backend/src/index.js` line 114
   - Change bank name, account number, account holder

2. **Add Menu Items**
   - Edit your frontend menu data
   - Or populate the `menu_items` table

3. **Customize Order ID Format**
   - Edit `backend/src/index.js` line 399
   - Change from `BENTO-YYYYMMDD-XXXX` to your format

### To Deploy to Production
When you're ready to go live:

1. **Follow the deployment guide:**
   - Read `DEPLOYMENT_GUIDE.md`
   - Deploy backend to Cloudflare
   - Deploy frontend to Vercel/Netlify/Cloudflare Pages

2. **Update configuration:**
   - Get your production Worker URL
   - Update `.env` with production URL
   - Deploy!

## 📚 Documentation

- **API Reference:** `API_REFERENCE.md`
- **Backend Setup:** `backend/README.md`
- **Frontend Integration:** `backend/FRONTEND_INTEGRATION.md`
- **Deployment Guide:** `DEPLOYMENT_GUIDE.md`
- **Architecture:** `ARCHITECTURE.md`

## ✨ Features Available

### Customer Side
- ✅ Browse menu
- ✅ Add to cart
- ✅ Place orders
- ✅ Upload payment proofs
- ✅ Track order status
- ✅ View order history by phone

### Admin Side
- ✅ View all orders
- ✅ Filter by status
- ✅ Update order status
- ✅ View analytics dashboard
- ✅ See top-selling items
- ✅ Track revenue (today/total)
- ✅ View payment proofs

## 🎯 Quick Links

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Admin Dashboard | http://localhost:5173/admin |
| Backend API | http://localhost:8787 |
| API Health | http://localhost:8787/api/health |
| Test Order | http://localhost:5173/status/BENTO-20251125-0001 |

## 🎉 You're All Set!

Your Bento Baitos ordering system is now fully functional locally.

Try placing an order, uploading a payment proof, and managing it from the admin panel!

**Happy coding!** ☕🚀

---

**Need help?** Check the troubleshooting section above or consult the documentation files.
