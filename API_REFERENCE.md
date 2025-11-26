# Bento Baitos API Quick Reference

Base URL: `https://bento-baitos-api.your-subdomain.workers.dev`

## Customer Endpoints

### Create Order
```http
POST /api/orders
Content-Type: application/json

{
  "customer_name": "John Doe",
  "phone": "081234567890",
  "items": [
    {
      "item_id": "espresso",
      "quantity": 2,
      "unit_price_cents": 25000,
      "customizations": null
    }
  ],
  "payment_method": "bank_transfer"
}

Response 201:
{
  "success": true,
  "order_uid": "BENTO-20250125-0001",
  "total_cents": 50000,
  "status": "pending",
  "payment": {
    "bank": "BCA",
    "account_number": "1234567890",
    "account_holder": "Bento Baitos"
  }
}
```

### Upload Payment Proof (FormData)
```http
POST /api/orders/:orderId/proof
Content-Type: multipart/form-data

FormData: { proof: <File> }

Response 200:
{
  "success": true,
  "proof_url": "https://r2.../payment-proofs/BENTO-20250125-0001.jpg"
}
```

### Upload Payment Proof (Base64)
```http
POST /api/orders/:orderId/proof
Content-Type: application/json

{
  "proof_base64": "data:image/jpeg;base64,/9j/4AAQ..."
}

Response 200:
{
  "success": true,
  "proof_url": "https://r2.../payment-proofs/BENTO-20250125-0001.jpg"
}
```

### Get Order by ID
```http
GET /api/orders/:orderId

Response 200:
{
  "order_uid": "BENTO-20250125-0001",
  "customer_name": "John Doe",
  "phone": "081234567890",
  "status": "preparing",
  "payment_proof_url": "https://...",
  "total_price": 50000,
  "items": [
    {
      "item_name": "espresso",
      "quantity": 2,
      "unit_price": 25000,
      "customizations": null
    }
  ],
  "created_at": "2025-01-25T10:30:00Z",
  "updated_at": "2025-01-25T10:35:00Z"
}
```

### Get Orders by Phone
```http
GET /api/orders/by-phone/:phone

Example: GET /api/orders/by-phone/081234567890

Response 200:
{
  "phone": "081234567890",
  "orders": [
    {
      "order_uid": "BENTO-20250125-0001",
      "status": "completed",
      "total_price": 50000,
      "items": [...],
      "created_at": "2025-01-25T10:30:00Z"
    }
  ]
}
```

## Admin Endpoints

### List All Orders
```http
GET /api/admin/orders?status=pending&limit=50&offset=0

Query Parameters:
- status (optional): pending|paid|preparing|ready|completed|cancelled
- limit (optional): default 50
- offset (optional): default 0

Response 200:
{
  "orders": [
    {
      "id": 123,
      "order_uid": "BENTO-20250125-0001",
      "customer_name": "John Doe",
      "phone": "081234567890",
      "status": "pending",
      "payment_proof_url": "https://...",
      "total_price": 50000,
      "items": [...],
      "created_at": "2025-01-25T10:30:00Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "count": 10
  }
}
```

### Update Order Status
```http
PUT /api/admin/orders/:id/status
Content-Type: application/json

{
  "status": "preparing"
}

Valid statuses:
- pending
- paid
- preparing
- ready
- completed
- cancelled

Response 200:
{
  "success": true,
  "order_id": 123,
  "status": "preparing"
}
```

### Get Admin Statistics
```http
GET /api/admin/stats

Response 200:
{
  "totalOrders": 150,
  "totalRevenue": 7500000,
  "todayOrders": 12,
  "todayRevenue": 600000,
  "items": [
    {
      "name": "Espresso",
      "quantity_sold": 245,
      "order_count": 123
    }
  ],
  "ordersByStatus": [
    { "status": "pending", "count": 5 },
    { "status": "completed", "count": 142 }
  ]
}
```

## Health Check

```http
GET /api/health

Response 200:
{
  "status": "ok",
  "message": "Bento Baitos API is running"
}
```

## Error Responses

All endpoints return consistent error format:

```json
{
  "error": "Human-readable error message",
  "details": "Technical details (if available)"
}
```

Common status codes:
- `200` - Success
- `201` - Created (new order)
- `400` - Bad request (invalid input)
- `404` - Not found (order doesn't exist)
- `500` - Server error

## Order Status Flow

```
pending → paid → preparing → ready → completed
                       ↓
                   cancelled
```

## Frontend Integration Examples

### JavaScript/Axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://bento-baitos-api.your-subdomain.workers.dev'
});

// Create order
const response = await api.post('/api/orders', {
  customer_name: 'John Doe',
  phone: '081234567890',
  items: [{ item_id: 'espresso', quantity: 2, unit_price_cents: 25000 }],
  payment_method: 'bank_transfer'
});

// Upload proof
const formData = new FormData();
formData.append('proof', file);
await api.post(`/api/orders/${orderId}/proof`, formData);

// Get order status
const order = await api.get(`/api/orders/${orderId}`);

// Admin: Update status
await api.put(`/api/admin/orders/${orderId}/status`, { status: 'preparing' });
```

### cURL Examples

```bash
# Create order
curl -X POST https://your-worker.workers.dev/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customer_name":"John","phone":"081234567890","items":[{"item_id":"espresso","quantity":2,"unit_price_cents":25000}]}'

# Get order
curl https://your-worker.workers.dev/api/orders/BENTO-20250125-0001

# Upload proof
curl -X POST https://your-worker.workers.dev/api/orders/BENTO-20250125-0001/proof \
  -F "proof=@payment-proof.jpg"

# Admin: Get all orders
curl https://your-worker.workers.dev/api/admin/orders

# Admin: Update status
curl -X PUT https://your-worker.workers.dev/api/admin/orders/123/status \
  -H "Content-Type: application/json" \
  -d '{"status":"preparing"}'

# Get stats
curl https://your-worker.workers.dev/api/admin/stats
```

## Database Schema

### users
```sql
id INTEGER PRIMARY KEY
name TEXT
phone TEXT
created_at DATETIME
```

### orders
```sql
id INTEGER PRIMARY KEY
order_uid TEXT UNIQUE
user_id INTEGER → users.id
total_price INTEGER (cents)
payment_proof_url TEXT
payment_method TEXT
status TEXT
created_at DATETIME
updated_at DATETIME
```

### order_items
```sql
id INTEGER PRIMARY KEY
order_id INTEGER → orders.id
item_name TEXT
quantity INTEGER
unit_price INTEGER (cents)
customizations TEXT (JSON)
created_at DATETIME
```

## CORS Configuration

The API has CORS enabled by default:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

For production, restrict origin in `src/index.js`:
```javascript
'Access-Control-Allow-Origin': 'https://yourdomain.com'
```

## Rate Limits

Free tier:
- 100,000 requests/day
- 10ms CPU time per request

Paid tier ($5/month):
- Unlimited requests
- 50ms CPU time per request

## Storage Limits

**D1 Database (Free tier):**
- 5M reads/day
- 100K writes/day
- 5GB storage

**R2 Storage (Free tier):**
- 10GB storage
- 1M Class A operations/month
- 10M Class B operations/month

## Quick Commands

```bash
# Deploy
cd backend && npm run deploy

# View logs
npm run logs

# Query database
wrangler d1 execute bento-baitos-db --command="SELECT COUNT(*) FROM orders"

# Test health
curl https://your-worker.workers.dev/api/health
```

## Support

- GitHub Issues: Report bugs or request features
- Cloudflare Docs: https://developers.cloudflare.com/
- Discord: https://discord.gg/cloudflaredev

---

**Last Updated:** January 2025
**API Version:** 1.0.0
