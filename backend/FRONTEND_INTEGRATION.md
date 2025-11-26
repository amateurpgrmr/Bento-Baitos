# Frontend Integration Guide

This guide shows you how to connect your Bento Baitos UI to the backend API.

## Table of Contents
- [Setup](#setup)
- [Customer Endpoints](#customer-endpoints)
- [Admin Endpoints](#admin-endpoints)
- [Error Handling](#error-handling)
- [Complete Examples](#complete-examples)

## Setup

### 1. Set API Base URL

In your React app, update the `.env` file (or create one):

```env
VITE_API_BASE=https://bento-baitos-api.your-worker.workers.dev
```

Or for local development:
```env
VITE_API_BASE=http://localhost:8787
```

### 2. Your API Client is Already Set Up!

Your existing `src/api/client.js` is already configured:

```javascript
import axios from 'axios';
export const API_BASE = import.meta.env.VITE_API_BASE || 'https://api.example.com';
export const api = axios.create({ baseURL: API_BASE, timeout: 10000 });
```

## Customer Endpoints

### 1. Create Order

**Endpoint:** `POST /api/orders`

**Request:**
```javascript
import { api } from './api/client'

async function createOrder(customerName, phone, cartItems) {
  try {
    const response = await api.post('/api/orders', {
      customer_name: customerName,
      phone: phone,
      items: cartItems.map(item => ({
        item_id: item.item_id || item.name,
        quantity: item.quantity,
        unit_price_cents: item.unit_price_cents,
        customizations: item.customizations || null
      })),
      payment_method: 'bank_transfer'
    });

    return response.data;
    // Response: { success: true, order_uid: "BENTO-20250125-0001", total_cents: 50000, ... }
  } catch (error) {
    console.error('Create order error:', error);
    throw error;
  }
}
```

**Response:**
```json
{
  "success": true,
  "order_uid": "BENTO-20250125-0001",
  "order_id": 123,
  "total_cents": 50000,
  "status": "pending",
  "payment": {
    "bank": "BCA",
    "account_number": "1234567890",
    "account_holder": "Bento Baitos",
    "qr_code_url": ""
  },
  "message": "Order created successfully..."
}
```

### 2. Upload Payment Proof

**Endpoint:** `POST /api/orders/:orderId/proof`

**Option A: With File Upload (FormData)**
```javascript
async function uploadPaymentProof(orderUid, file) {
  try {
    const formData = new FormData();
    formData.append('proof', file);

    const response = await api.post(`/api/orders/${orderUid}/proof`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
    // Response: { success: true, proof_url: "https://...", ... }
  } catch (error) {
    console.error('Upload proof error:', error);
    throw error;
  }
}
```

**Option B: With Base64 String**
```javascript
async function uploadPaymentProofBase64(orderUid, base64Image) {
  try {
    const response = await api.post(`/api/orders/${orderUid}/proof`, {
      proof_base64: base64Image // e.g., "data:image/jpeg;base64,/9j/4AAQ..."
    });

    return response.data;
  } catch (error) {
    console.error('Upload proof error:', error);
    throw error;
  }
}
```

### 3. Get Order Status

**Endpoint:** `GET /api/orders/:orderId`

```javascript
async function getOrderStatus(orderUid) {
  try {
    const response = await api.get(`/api/orders/${orderUid}`);
    return response.data;
    /*
    Response: {
      order_uid: "BENTO-20250125-0001",
      customer_name: "John Doe",
      phone: "081234567890",
      status: "preparing",
      payment_proof_url: "https://...",
      total_price: 50000,
      items: [...],
      created_at: "2025-01-25T10:30:00Z"
    }
    */
  } catch (error) {
    console.error('Get order error:', error);
    throw error;
  }
}
```

### 4. Get Orders by Phone Number

**Endpoint:** `GET /api/orders/by-phone/:phone`

```javascript
async function getCustomerOrders(phone) {
  try {
    const response = await api.get(`/api/orders/by-phone/${encodeURIComponent(phone)}`);
    return response.data;
    /*
    Response: {
      phone: "081234567890",
      orders: [
        {
          order_uid: "BENTO-20250125-0001",
          status: "completed",
          total_price: 50000,
          items: [...],
          created_at: "2025-01-25T10:30:00Z"
        },
        ...
      ]
    }
    */
  } catch (error) {
    console.error('Get customer orders error:', error);
    throw error;
  }
}
```

## Admin Endpoints

### 1. Get All Orders

**Endpoint:** `GET /api/admin/orders`

```javascript
async function getAdminOrders(status = null, limit = 50, offset = 0) {
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('limit', limit);
    params.append('offset', offset);

    const response = await api.get(`/api/admin/orders?${params.toString()}`);
    return response.data;
    /*
    Response: {
      orders: [
        {
          id: 123,
          order_uid: "BENTO-20250125-0001",
          customer_name: "John Doe",
          phone: "081234567890",
          status: "pending",
          payment_proof_url: "https://...",
          total_price: 50000,
          items: [...],
          created_at: "2025-01-25T10:30:00Z"
        },
        ...
      ],
      pagination: { limit: 50, offset: 0, count: 10 }
    }
    */
  } catch (error) {
    console.error('Get admin orders error:', error);
    throw error;
  }
}
```

### 2. Update Order Status

**Endpoint:** `PUT /api/admin/orders/:id/status`

```javascript
async function updateOrderStatus(orderId, newStatus) {
  try {
    const response = await api.put(`/api/admin/orders/${orderId}/status`, {
      status: newStatus // 'pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled'
    });

    return response.data;
    // Response: { success: true, order_id: 123, status: "preparing", ... }
  } catch (error) {
    console.error('Update status error:', error);
    throw error;
  }
}
```

### 3. Get Admin Statistics

**Endpoint:** `GET /api/admin/stats`

```javascript
async function getAdminStats() {
  try {
    const response = await api.get('/api/admin/stats');
    return response.data;
    /*
    Response: {
      totalOrders: 150,
      totalRevenue: 7500000,
      todayOrders: 12,
      todayRevenue: 600000,
      items: [
        { name: "Espresso", quantity_sold: 245, order_count: 123 },
        { name: "Cappuccino", quantity_sold: 189, order_count: 98 },
        ...
      ],
      ordersByStatus: [
        { status: "pending", count: 5 },
        { status: "preparing", count: 3 },
        { status: "completed", count: 142 }
      ]
    }
    */
  } catch (error) {
    console.error('Get admin stats error:', error);
    throw error;
  }
}
```

## Error Handling

All endpoints return consistent error responses:

```javascript
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

### Example Error Handler

```javascript
import { api } from './api/client'

// Add a global error interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
      alert(`Error: ${error.response.data.error}`);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.request);
      alert('Network error. Please check your connection.');
    } else {
      // Something else happened
      console.error('Error:', error.message);
      alert('An unexpected error occurred.');
    }
    return Promise.reject(error);
  }
);
```

## Complete Examples

### Example 1: Update Checkout Page

Update your `src/pages/Checkout.jsx`:

```javascript
import { useContext, useState } from 'react'
import { CartContext } from '../state/CartContext'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

export default function Checkout(){
  const { cart, subtotal, clear } = useContext(CartContext)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [proof, setProof] = useState(null)
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  async function placeOrder(){
    if(!name || !phone) return alert('Please enter name and phone')
    if(cart.length === 0) return alert('Cart is empty')

    setLoading(true)

    try {
      // 1. Create order
      const orderResponse = await api.post('/api/orders', {
        customer_name: name,
        phone: phone,
        items: cart.map(item => ({
          item_id: item.item_id || item.name,
          quantity: item.quantity,
          unit_price_cents: item.unit_price_cents,
          customizations: item.customizations || null
        })),
        payment_method: 'bank_transfer'
      });

      const { order_uid } = orderResponse.data;

      // 2. Upload payment proof if provided
      if (proof) {
        const formData = new FormData();
        formData.append('proof', proof);
        await api.post(`/api/orders/${order_uid}/proof`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      // 3. Clear cart and navigate to order status
      clear();
      nav(`/status/${order_uid}`);
    } catch (error) {
      console.error('Order failed:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Checkout</h2>
        <div className="mb-3">
          <label className="block text-sm">Full name</label>
          <input
            value={name}
            onChange={e=>setName(e.target.value)}
            className="w-full p-2 rounded border"
            disabled={loading}
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm">Phone number</label>
          <input
            value={phone}
            onChange={e=>setPhone(e.target.value)}
            className="w-full p-2 rounded border"
            disabled={loading}
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm">Upload payment proof (optional)</label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={e=>setProof(e.target.files[0])}
            disabled={loading}
          />
          {proof && <div className="mt-2 text-sm">Selected: {proof.name}</div>}
        </div>
        <div className="mt-4">
          <button
            onClick={placeOrder}
            className="bg-black text-white px-4 py-2 rounded disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? 'Placing Order...' : 'Place Order & Upload Proof'}
          </button>
        </div>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Order Summary</h3>
        {cart.map((it,idx)=>(
          <div key={idx} className="flex justify-between py-1">
            <div>{it.name} x{it.quantity}</div>
            <div>Rp {(it.unit_price_cents*it.quantity).toLocaleString()}</div>
          </div>
        ))}
        <div className="border-t mt-2 pt-2 flex justify-between font-bold">
          Total <div>Rp {subtotal().toLocaleString()}</div>
        </div>
        <div className="mt-3 text-sm text-gray-600">
          Payment: Bank BCA - 1234567890 (Bento Baitos). Transfer exact amount.
        </div>
      </div>
    </div>
  )
}
```

### Example 2: Update Order Status Page

Update your `src/pages/OrderStatus.jsx`:

```javascript
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '../api/client'

export default function OrderStatus(){
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadOrder()
    // Optionally, poll for updates every 10 seconds
    const interval = setInterval(loadOrder, 10000)
    return () => clearInterval(interval)
  }, [orderId])

  async function loadOrder() {
    try {
      const response = await api.get(`/api/orders/${orderId}`)
      setOrder(response.data)
      setError(null)
    } catch (err) {
      setError('Order not found')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-500">{error}</div>
  if (!order) return <div>Order not found</div>

  const statusSteps = ['pending', 'paid', 'preparing', 'ready', 'completed']
  const currentIndex = statusSteps.indexOf(order.status)
  const progressPercent = ((currentIndex + 1) / statusSteps.length) * 100

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Order Status</h2>

      <div className="bg-white p-6 rounded shadow mb-4">
        <div className="mb-4">
          <span className="text-sm text-gray-500">Order ID:</span>
          <span className="font-mono ml-2 font-bold">{order.order_uid}</span>
        </div>

        <div className="mb-4">
          <span className="text-sm text-gray-500">Customer:</span>
          <span className="ml-2">{order.customer_name} ({order.phone})</span>
        </div>

        <div className="mb-4">
          <span className="text-sm text-gray-500">Status:</span>
          <span className={`ml-2 px-3 py-1 rounded text-sm font-semibold ${
            order.status === 'completed' ? 'bg-green-100 text-green-800' :
            order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {order.status.toUpperCase()}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-3 bg-gray-200 rounded overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-green-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            {statusSteps.map(step => (
              <span key={step}>{step}</span>
            ))}
          </div>
        </div>

        {/* Order items */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">Order Items</h3>
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between py-2">
              <div>
                <div>{item.item_name} x{item.quantity}</div>
                {item.customizations && (
                  <div className="text-xs text-gray-500">{item.customizations}</div>
                )}
              </div>
              <div>Rp {(item.unit_price * item.quantity).toLocaleString()}</div>
            </div>
          ))}
          <div className="border-t mt-2 pt-2 flex justify-between font-bold">
            <span>Total</span>
            <span>Rp {order.total_price.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment proof */}
        {order.payment_proof_url && (
          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold mb-2">Payment Proof</h3>
            <img
              src={order.payment_proof_url}
              alt="Payment proof"
              className="max-w-xs rounded border"
            />
          </div>
        )}
      </div>
    </div>
  )
}
```

### Example 3: Update Admin Orders Page

Update your `src/admin/Orders.jsx`:

```javascript
import { useEffect, useState } from 'react'
import { api } from '../api/client'

export default function Orders(){
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadOrders()
  }, [filter])

  async function loadOrders() {
    try {
      const params = filter !== 'all' ? `?status=${filter}` : ''
      const response = await api.get(`/api/admin/orders${params}`)
      setOrders(response.data.orders)
    } catch (error) {
      console.error('Failed to load orders:', error)
      alert('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(orderId, newStatus) {
    try {
      await api.put(`/api/admin/orders/${orderId}/status`, {
        status: newStatus
      })
      loadOrders() // Reload orders
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('Failed to update order status')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Orders</h2>

        {/* Filter buttons */}
        <div className="flex gap-2">
          {['all', 'pending', 'paid', 'preparing', 'ready', 'completed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded text-sm ${
                filter === status
                  ? 'bg-black text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {orders.length === 0 && (
        <div className="bg-white p-4 rounded shadow">No orders found</div>
      )}

      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-mono font-bold">{order.order_uid}</div>
                <div className="text-sm text-gray-600">
                  {order.customer_name} • {order.phone}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(order.created_at).toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">Rp {order.total_price.toLocaleString()}</div>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  className="mt-2 text-sm border rounded px-2 py-1"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Order items */}
            <div className="border-t pt-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="text-sm py-1">
                  {item.item_name} x{item.quantity}
                </div>
              ))}
            </div>

            {/* Payment proof */}
            {order.payment_proof_url && (
              <div className="mt-2">
                <a
                  href={order.payment_proof_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm hover:underline"
                >
                  View Payment Proof
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Example 4: Update Admin Dashboard

Update your `src/admin/Dashboard.jsx`:

```javascript
import { useEffect, useState } from 'react'
import { api } from '../api/client'

export default function Dashboard(){
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
    // Refresh every 30 seconds
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [])

  async function loadStats() {
    try {
      const response = await api.get('/api/admin/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (!stats) return <div>Failed to load statistics</div>

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Admin Dashboard</h2>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Today's Revenue</div>
          <div className="text-xl font-bold">Rp {stats.todayRevenue.toLocaleString()}</div>
          <div className="text-xs text-gray-400">{stats.todayOrders} orders</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Total Revenue</div>
          <div className="text-xl font-bold">Rp {stats.totalRevenue.toLocaleString()}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Total Orders</div>
          <div className="text-xl font-bold">{stats.totalOrders}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Popular Item</div>
          <div className="text-xl font-bold">
            {stats.items[0]?.name || '—'}
          </div>
          <div className="text-xs text-gray-400">
            {stats.items[0]?.quantity_sold || 0} sold
          </div>
        </div>
      </div>

      {/* Top selling items */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-semibold mb-3">Top Selling Items</h3>
        <div className="space-y-2">
          {stats.items.slice(0, 5).map((item, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <div>
                <span className="font-medium">{item.name}</span>
                <span className="text-sm text-gray-500 ml-2">
                  ({item.order_count} orders)
                </span>
              </div>
              <div className="text-right">
                <div className="font-bold">{item.quantity_sold} sold</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Orders by status */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-3">Orders by Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {stats.ordersByStatus.map(({ status, count }) => (
            <div key={status} className="p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-600 capitalize">{status}</div>
              <div className="text-2xl font-bold">{count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

## Testing

### Test with curl

```bash
# Create order
curl -X POST https://your-worker.workers.dev/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "John Doe",
    "phone": "081234567890",
    "items": [
      {
        "item_id": "espresso",
        "quantity": 2,
        "unit_price_cents": 25000
      }
    ],
    "payment_method": "bank_transfer"
  }'

# Get order status
curl https://your-worker.workers.dev/api/orders/BENTO-20250125-0001

# Get admin stats
curl https://your-worker.workers.dev/api/admin/stats
```

---

## Summary of Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create new order |
| POST | `/api/orders/:id/proof` | Upload payment proof |
| GET | `/api/orders/:id` | Get order details |
| GET | `/api/orders/by-phone/:phone` | Get customer orders |
| GET | `/api/admin/orders` | List all orders (admin) |
| PUT | `/api/admin/orders/:id/status` | Update order status (admin) |
| GET | `/api/admin/stats` | Get statistics (admin) |

All endpoints return JSON and support CORS for frontend integration.
