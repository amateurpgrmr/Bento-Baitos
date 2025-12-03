/**
 * Bento Baitos - Cloudflare Workers Backend
 *
 * This is the main backend API for the Bento Baitos cafe ordering system.
 * It handles orders, payment proofs, and admin analytics.
 */

export default {
  async fetch(request, env, ctx) {
    // Enable CORS for all requests
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const url = new URL(request.url);
      const path = url.pathname;

      // Router - match the path to the appropriate handler
      let response;

      // Customer endpoints
      if (path === '/api/orders' && request.method === 'POST') {
        response = await createOrder(request, env);
      }
      else if (path.match(/^\/api\/orders\/[^/]+\/proof$/) && request.method === 'POST') {
        const orderId = path.split('/')[3];
        response = await uploadPaymentProof(request, env, orderId);
      }
      else if (path.match(/^\/api\/orders\/[^/]+$/) && request.method === 'GET') {
        const orderId = path.split('/')[3];
        response = await getOrderById(request, env, orderId);
      }
      else if (path.match(/^\/api\/orders\/by-phone\/[^/]+$/) && request.method === 'GET') {
        const phone = decodeURIComponent(path.split('/')[4]);
        response = await getOrdersByPhone(request, env, phone);
      }

      // Menu endpoints (public)
      else if (path === '/api/menu' && request.method === 'GET') {
        response = await getMenuItems(request, env);
      }
      else if (path.match(/^\/api\/menu\/\d+$/) && request.method === 'GET') {
        const itemId = path.split('/')[3];
        response = await getMenuItem(request, env, itemId);
      }

      // Admin endpoints
      else if (path === '/api/admin/orders' && request.method === 'GET') {
        response = await getAdminOrders(request, env);
      }
      else if (path.match(/^\/api\/admin\/orders\/\d+\/status$/) && request.method === 'PUT') {
        const orderId = path.split('/')[4];
        response = await updateOrderStatus(request, env, orderId);
      }
      else if (path.match(/^\/api\/admin\/orders\/\d+\/verify-payment$/) && request.method === 'PUT') {
        const orderId = path.split('/')[4];
        response = await verifyPayment(request, env, orderId);
      }
      else if (path === '/api/admin/stats' && request.method === 'GET') {
        response = await getAdminStats(request, env);
      }

      // Admin menu management endpoints
      else if (path === '/api/admin/menu' && request.method === 'GET') {
        response = await getAdminMenuItems(request, env);
      }
      else if (path === '/api/admin/menu' && request.method === 'POST') {
        response = await createMenuItem(request, env);
      }
      else if (path.match(/^\/api\/admin\/menu\/\d+$/) && request.method === 'PUT') {
        const itemId = path.split('/')[4];
        response = await updateMenuItem(request, env, itemId);
      }
      else if (path.match(/^\/api\/admin\/menu\/\d+$/) && request.method === 'DELETE') {
        const itemId = path.split('/')[4];
        response = await deleteMenuItem(request, env, itemId);
      }
      else if (path.match(/^\/api\/admin\/menu\/\d+\/stock$/) && request.method === 'PUT') {
        const itemId = path.split('/')[4];
        response = await updateMenuStock(request, env, itemId);
      }
      else if (path.match(/^\/api\/admin\/menu\/\d+\/toggle$/) && request.method === 'PUT') {
        const itemId = path.split('/')[4];
        response = await toggleMenuAvailability(request, env, itemId);
      }

      // Health check
      else if (path === '/api/health') {
        response = jsonResponse({ status: 'ok', message: 'Bento Baitos API is running' });
      }

      // 404 Not Found
      else {
        response = jsonResponse({ error: 'Endpoint not found' }, 404);
      }

      // Add CORS headers to response
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    } catch (error) {
      console.error('Unhandled error:', error);
      return jsonResponse({ error: 'Internal server error', details: error.message }, 500);
    }
  }
};

// ============================================
// CUSTOMER API HANDLERS
// ============================================

/**
 * POST /api/orders
 * Create a new order
 *
 * Request body:
 * {
 *   customer_name: string,
 *   phone: string,
 *   items: [{ item_id: string, quantity: number, unit_price_cents: number, customizations: object }],
 *   payment_method: string
 * }
 */
async function createOrder(request, env) {
  try {
    const body = await request.json();
    const { customer_name, phone, items, payment_method = 'bank_transfer' } = body;

    // Validate input
    if (!customer_name || !phone || !items || items.length === 0) {
      return jsonResponse({ error: 'Missing required fields: customer_name, phone, items' }, 400);
    }

    // Calculate total price
    const total_price = items.reduce((sum, item) => {
      return sum + (item.unit_price_cents * item.quantity);
    }, 0);

    // Generate unique order UID
    const order_uid = await generateOrderUID(env);

    // Start transaction (D1 supports batch statements)
    const db = env.DB;

    // 1. Insert or get user
    let user = await db.prepare(
      'SELECT id FROM users WHERE phone = ?'
    ).bind(phone).first();

    let userId;
    if (!user) {
      const insertUser = await db.prepare(
        'INSERT INTO users (name, phone) VALUES (?, ?)'
      ).bind(customer_name, phone).run();
      userId = insertUser.meta.last_row_id;
    } else {
      userId = user.id;
      // Update name if changed
      await db.prepare(
        'UPDATE users SET name = ? WHERE id = ?'
      ).bind(customer_name, userId).run();
    }

    // 2. Insert order
    // Auto-verify cash payments
    const payment_verified = payment_method === 'cash' ? 1 : 0;
    const insertOrder = await db.prepare(
      'INSERT INTO orders (order_uid, user_id, total_price, payment_method, payment_verified, status) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(order_uid, userId, total_price, payment_method, payment_verified, 'pending').run();

    const orderId = insertOrder.meta.last_row_id;

    // 3. Insert order items
    for (const item of items) {
      const customizations = item.customizations ? JSON.stringify(item.customizations) : null;
      await db.prepare(
        'INSERT INTO order_items (order_id, item_name, quantity, unit_price, customizations) VALUES (?, ?, ?, ?, ?)'
      ).bind(
        orderId,
        item.name || `Item ${item.item_id}` || 'Unknown Item',
        item.quantity,
        item.unit_price_cents,
        customizations
      ).run();
    }

    // Return success response with order details
    const response = {
      success: true,
      order_uid: order_uid,
      order_id: orderId,
      total_cents: total_price,
      status: 'pending',
      payment_method: payment_method,
      payment_verified: payment_verified
    };

    // Add bank details only for bank transfer
    if (payment_method === 'bank_transfer') {
      response.payment = {
        bank: 'BCA | Sheina Angela',
        account_number: '3500032340',
        account_holder: 'Bento Baitos',
        qr_code_url: ''
      };
      response.message = 'Order created successfully. Please transfer the exact amount and upload payment proof.';
    } else {
      response.message = 'Order created successfully. Pay with cash when you receive your order.';
    }

    return jsonResponse(response, 201);

  } catch (error) {
    console.error('Error creating order:', error);
    return jsonResponse({ error: 'Failed to create order', details: error.message }, 500);
  }
}

/**
 * POST /api/orders/:orderId/proof
 * Upload payment proof for an order
 * Supports: multipart/form-data with 'proof' file OR JSON with base64 data
 */
async function uploadPaymentProof(request, env, orderUid) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let imageUrl;

    if (contentType.includes('multipart/form-data')) {
      // Handle multipart file upload
      const formData = await request.formData();
      const proofFile = formData.get('proof');

      if (!proofFile) {
        return jsonResponse({ error: 'No proof file provided' }, 400);
      }

      // Upload to R2
      imageUrl = await uploadToR2(env, proofFile, orderUid);
    }
    else if (contentType.includes('application/json')) {
      // Handle base64 upload
      const body = await request.json();
      if (!body.proof_base64) {
        return jsonResponse({ error: 'No proof_base64 provided' }, 400);
      }

      // Upload base64 to R2
      imageUrl = await uploadBase64ToR2(env, body.proof_base64, orderUid);
    }
    else {
      return jsonResponse({ error: 'Invalid content type. Use multipart/form-data or application/json' }, 400);
    }

    // Update order with proof URL
    const db = env.DB;
    const result = await db.prepare(
      'UPDATE orders SET payment_proof_url = ?, updated_at = CURRENT_TIMESTAMP WHERE order_uid = ?'
    ).bind(imageUrl, orderUid).run();

    if (result.meta.changes === 0) {
      return jsonResponse({ error: 'Order not found' }, 404);
    }

    return jsonResponse({
      success: true,
      proof_url: imageUrl,
      message: 'Payment proof uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading payment proof:', error);
    return jsonResponse({ error: 'Failed to upload payment proof', details: error.message }, 500);
  }
}

/**
 * GET /api/orders/:orderId
 * Get order details by order UID
 */
async function getOrderById(request, env, orderUid) {
  try {
    const db = env.DB;

    // Get order with user details
    const order = await db.prepare(`
      SELECT
        o.id, o.order_uid, o.total_price, o.payment_proof_url,
        o.payment_method, o.status, o.created_at, o.updated_at,
        u.name as customer_name, u.phone
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.order_uid = ?
    `).bind(orderUid).first();

    if (!order) {
      return jsonResponse({ error: 'Order not found' }, 404);
    }

    // Get order items
    const items = await db.prepare(`
      SELECT item_name, quantity, unit_price, customizations
      FROM order_items
      WHERE order_id = ?
    `).bind(order.id).all();

    // Parse customizations
    const parsedItems = items.results.map(item => ({
      ...item,
      customizations: item.customizations ? JSON.parse(item.customizations) : null
    }));

    return jsonResponse({
      order_uid: order.order_uid,
      customer_name: order.customer_name,
      phone: order.phone,
      status: order.status,
      payment_method: order.payment_method,
      payment_proof_url: order.payment_proof_url,
      total_price: order.total_price,
      items: parsedItems,
      created_at: order.created_at,
      updated_at: order.updated_at
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    return jsonResponse({ error: 'Failed to fetch order', details: error.message }, 500);
  }
}

/**
 * GET /api/orders/by-phone/:phone
 * Get all orders for a customer by phone number
 */
async function getOrdersByPhone(request, env, phone) {
  try {
    const db = env.DB;

    // Get all orders for this phone number
    const orders = await db.prepare(`
      SELECT
        o.id, o.order_uid, o.total_price, o.payment_proof_url,
        o.status, o.created_at, o.updated_at,
        u.name as customer_name, u.phone
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE u.phone = ?
      ORDER BY o.created_at DESC
    `).bind(phone).all();

    // Get items for each order
    const ordersWithItems = await Promise.all(
      orders.results.map(async (order) => {
        const items = await db.prepare(`
          SELECT item_name, quantity, unit_price
          FROM order_items
          WHERE order_id = ?
        `).bind(order.id).all();

        return {
          order_uid: order.order_uid,
          status: order.status,
          total_price: order.total_price,
          payment_proof_url: order.payment_proof_url,
          items: items.results,
          created_at: order.created_at,
          updated_at: order.updated_at
        };
      })
    );

    return jsonResponse({
      phone,
      orders: ordersWithItems
    });

  } catch (error) {
    console.error('Error fetching orders by phone:', error);
    return jsonResponse({ error: 'Failed to fetch orders', details: error.message }, 500);
  }
}

// ============================================
// ADMIN API HANDLERS
// ============================================

/**
 * GET /api/admin/orders
 * Get all orders for admin dashboard
 * Query params: ?status=pending&limit=50&offset=0
 */
async function getAdminOrders(request, env) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const db = env.DB;

    // Build query
    let query = `
      SELECT
        o.id, o.order_uid, o.total_price, o.payment_proof_url,
        o.payment_method, o.status, o.payment_verified, o.created_at, o.updated_at,
        u.name as customer_name, u.phone
      FROM orders o
      JOIN users u ON o.user_id = u.id
    `;

    const params = [];

    if (status) {
      query += ' WHERE o.status = ?';
      params.push(status);
    }

    query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const orders = await db.prepare(query).bind(...params).all();

    // Get items for each order
    const ordersWithItems = await Promise.all(
      orders.results.map(async (order) => {
        const items = await db.prepare(`
          SELECT item_name, quantity, unit_price, customizations
          FROM order_items
          WHERE order_id = ?
        `).bind(order.id).all();

        return {
          id: order.id,
          order_uid: order.order_uid,
          customer_name: order.customer_name,
          phone: order.phone,
          status: order.status,
          payment_method: order.payment_method,
          payment_proof_url: order.payment_proof_url,
          payment_verified: order.payment_verified || false,
          total_price: order.total_price,
          items: items.results,
          created_at: order.created_at,
          updated_at: order.updated_at
        };
      })
    );

    return jsonResponse({
      orders: ordersWithItems,
      pagination: {
        limit,
        offset,
        count: ordersWithItems.length
      }
    });

  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return jsonResponse({ error: 'Failed to fetch orders', details: error.message }, 500);
  }
}

/**
 * PUT /api/admin/orders/:id/status
 * Update order status
 *
 * Request body:
 * {
 *   status: 'pending' | 'paid' | 'preparing' | 'ready' | 'completed' | 'cancelled'
 * }
 */
async function updateOrderStatus(request, env, orderId) {
  try {
    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ['pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return jsonResponse({
        error: 'Invalid status',
        valid_statuses: validStatuses
      }, 400);
    }

    const db = env.DB;

    const result = await db.prepare(
      'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(status, orderId).run();

    if (result.meta.changes === 0) {
      return jsonResponse({ error: 'Order not found' }, 404);
    }

    return jsonResponse({
      success: true,
      order_id: orderId,
      status: status,
      message: 'Order status updated successfully'
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    return jsonResponse({ error: 'Failed to update order status', details: error.message }, 500);
  }
}

/**
 * PUT /api/admin/orders/:id/verify-payment
 * Mark payment as verified for an order
 */
async function verifyPayment(request, env, orderId) {
  try {
    const db = env.DB;

    const result = await db.prepare(
      'UPDATE orders SET payment_verified = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(orderId).run();

    if (result.meta.changes === 0) {
      return jsonResponse({ error: 'Order not found' }, 404);
    }

    return jsonResponse({
      success: true,
      order_id: orderId,
      message: 'Payment verified successfully'
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    return jsonResponse({ error: 'Failed to verify payment', details: error.message }, 500);
  }
}

/**
 * GET /api/admin/stats
 * Get admin dashboard statistics
 *
 * Returns:
 * {
 *   totalOrders: number,
 *   totalRevenue: number,
 *   todayRevenue: number,
 *   items: [{ name: string, quantity_sold: number }]
 * }
 */
async function getAdminStats(request, env) {
  try {
    const db = env.DB;

    // Get total orders and revenue
    const totals = await db.prepare(`
      SELECT
        COUNT(*) as total_orders,
        SUM(total_price) as total_revenue
      FROM orders
      WHERE status != 'cancelled'
    `).first();

    // Get today's revenue (using date function)
    const today = await db.prepare(`
      SELECT
        COUNT(*) as today_orders,
        COALESCE(SUM(total_price), 0) as today_revenue
      FROM orders
      WHERE DATE(created_at) = DATE('now')
      AND status != 'cancelled'
    `).first();

    // Get top selling items
    const items = await db.prepare(`
      SELECT
        oi.item_name,
        SUM(oi.quantity) as quantity_sold,
        COUNT(DISTINCT oi.order_id) as order_count
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
      GROUP BY oi.item_name
      ORDER BY quantity_sold DESC
      LIMIT 10
    `).all();

    // Get orders by status
    const ordersByStatus = await db.prepare(`
      SELECT
        status,
        COUNT(*) as count
      FROM orders
      GROUP BY status
    `).all();

    return jsonResponse({
      totalOrders: totals.total_orders || 0,
      totalRevenue: totals.total_revenue || 0,
      todayOrders: today.today_orders || 0,
      todayRevenue: today.today_revenue || 0,
      items: items.results.map(item => ({
        name: item.item_name,
        quantity_sold: item.quantity_sold,
        order_count: item.order_count
      })),
      ordersByStatus: ordersByStatus.results
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return jsonResponse({ error: 'Failed to fetch stats', details: error.message }, 500);
  }
}

// ============================================
// MENU API HANDLERS (PUBLIC)
// ============================================

/**
 * GET /api/menu
 * Get all available menu items (public endpoint)
 */
async function getMenuItems(request, env) {
  try {
    const db = env.DB;

    const items = await db.prepare(`
      SELECT
        id, name, description, price, category, image_url,
        stock, low_stock_threshold, available, is_featured, sort_order
      FROM menu_items
      WHERE available = 1
      ORDER BY sort_order ASC, name ASC
    `).all();

    return jsonResponse({
      items: items.results.map(item => ({
        ...item,
        price_cents: item.price, // For backwards compatibility
        is_low_stock: item.stock > 0 && item.stock <= item.low_stock_threshold,
        is_sold_out: item.stock === 0 && item.available === 0
      }))
    });

  } catch (error) {
    console.error('Error fetching menu items:', error);
    return jsonResponse({ error: 'Failed to fetch menu items', details: error.message }, 500);
  }
}

/**
 * GET /api/menu/:id
 * Get single menu item by ID
 */
async function getMenuItem(request, env, itemId) {
  try {
    const db = env.DB;

    const item = await db.prepare(`
      SELECT
        id, name, description, price, category, image_url,
        stock, low_stock_threshold, available, is_featured
      FROM menu_items
      WHERE id = ? AND available = 1
    `).bind(itemId).first();

    if (!item) {
      return jsonResponse({ error: 'Menu item not found' }, 404);
    }

    return jsonResponse({
      ...item,
      price_cents: item.price,
      is_low_stock: item.stock > 0 && item.stock <= item.low_stock_threshold,
      is_sold_out: item.stock === 0 && item.available === 0
    });

  } catch (error) {
    console.error('Error fetching menu item:', error);
    return jsonResponse({ error: 'Failed to fetch menu item', details: error.message }, 500);
  }
}

// ============================================
// ADMIN MENU MANAGEMENT HANDLERS
// ============================================

/**
 * GET /api/admin/menu
 * Get all menu items (including unavailable) for admin
 */
async function getAdminMenuItems(request, env) {
  try {
    const db = env.DB;

    const items = await db.prepare(`
      SELECT
        id, name, description, price, category, image_url,
        stock, low_stock_threshold, available, is_featured, sort_order,
        created_at, updated_at
      FROM menu_items
      ORDER BY sort_order ASC, created_at DESC
    `).all();

    return jsonResponse({
      items: items.results.map(item => ({
        ...item,
        price_cents: item.price,
        is_low_stock: item.stock > 0 && item.stock <= item.low_stock_threshold,
        is_sold_out: item.stock === 0 && item.available === 0
      }))
    });

  } catch (error) {
    console.error('Error fetching admin menu items:', error);
    return jsonResponse({ error: 'Failed to fetch menu items', details: error.message }, 500);
  }
}

/**
 * POST /api/admin/menu
 * Create new menu item
 */
async function createMenuItem(request, env) {
  try {
    const body = await request.json();
    const { name, description, price, category, image_url, stock, low_stock_threshold, is_featured, sort_order } = body;

    if (!name || !price || !category) {
      return jsonResponse({ error: 'Missing required fields: name, price, category' }, 400);
    }

    const db = env.DB;

    const result = await db.prepare(`
      INSERT INTO menu_items (name, description, price, category, image_url, stock, low_stock_threshold, is_featured, sort_order, available)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).bind(
      name,
      description || null,
      price,
      category,
      image_url || null,
      stock || 0,
      low_stock_threshold || 5,
      is_featured ? 1 : 0,
      sort_order || 0
    ).run();

    return jsonResponse({
      success: true,
      item_id: result.meta.last_row_id,
      message: 'Menu item created successfully'
    }, 201);

  } catch (error) {
    console.error('Error creating menu item:', error);
    return jsonResponse({ error: 'Failed to create menu item', details: error.message }, 500);
  }
}

/**
 * PUT /api/admin/menu/:id
 * Update menu item
 */
async function updateMenuItem(request, env, itemId) {
  try {
    const body = await request.json();
    const { name, description, price, category, image_url, stock, low_stock_threshold, is_featured, sort_order } = body;

    const db = env.DB;

    const result = await db.prepare(`
      UPDATE menu_items
      SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        category = COALESCE(?, category),
        image_url = COALESCE(?, image_url),
        stock = COALESCE(?, stock),
        low_stock_threshold = COALESCE(?, low_stock_threshold),
        is_featured = COALESCE(?, is_featured),
        sort_order = COALESCE(?, sort_order),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      name || null,
      description || null,
      price || null,
      category || null,
      image_url || null,
      stock !== undefined ? stock : null,
      low_stock_threshold || null,
      is_featured !== undefined ? (is_featured ? 1 : 0) : null,
      sort_order !== undefined ? sort_order : null,
      itemId
    ).run();

    if (result.meta.changes === 0) {
      return jsonResponse({ error: 'Menu item not found' }, 404);
    }

    return jsonResponse({
      success: true,
      message: 'Menu item updated successfully'
    });

  } catch (error) {
    console.error('Error updating menu item:', error);
    return jsonResponse({ error: 'Failed to update menu item', details: error.message }, 500);
  }
}

/**
 * DELETE /api/admin/menu/:id
 * Delete menu item
 */
async function deleteMenuItem(request, env, itemId) {
  try {
    const db = env.DB;

    const result = await db.prepare(
      'DELETE FROM menu_items WHERE id = ?'
    ).bind(itemId).run();

    if (result.meta.changes === 0) {
      return jsonResponse({ error: 'Menu item not found' }, 404);
    }

    return jsonResponse({
      success: true,
      message: 'Menu item deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting menu item:', error);
    return jsonResponse({ error: 'Failed to delete menu item', details: error.message }, 500);
  }
}

/**
 * PUT /api/admin/menu/:id/stock
 * Update menu item stock
 */
async function updateMenuStock(request, env, itemId) {
  try {
    const body = await request.json();
    const { stock, operation } = body; // operation: 'set', 'add', 'subtract'

    const db = env.DB;

    let query, params;

    if (operation === 'add') {
      query = 'UPDATE menu_items SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      params = [stock, itemId];
    } else if (operation === 'subtract') {
      query = 'UPDATE menu_items SET stock = MAX(0, stock - ?), updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      params = [stock, itemId];
    } else {
      query = 'UPDATE menu_items SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      params = [stock, itemId];
    }

    const result = await db.prepare(query).bind(...params).run();

    if (result.meta.changes === 0) {
      return jsonResponse({ error: 'Menu item not found' }, 404);
    }

    // Get updated item to check if it's sold out
    const item = await db.prepare('SELECT stock, low_stock_threshold FROM menu_items WHERE id = ?').bind(itemId).first();

    // Auto-mark as unavailable if stock is 0
    if (item.stock === 0) {
      await db.prepare('UPDATE menu_items SET available = 0 WHERE id = ?').bind(itemId).run();
    }

    return jsonResponse({
      success: true,
      stock: item.stock,
      is_low_stock: item.stock > 0 && item.stock <= item.low_stock_threshold,
      is_sold_out: item.stock === 0,
      message: 'Stock updated successfully'
    });

  } catch (error) {
    console.error('Error updating stock:', error);
    return jsonResponse({ error: 'Failed to update stock', details: error.message }, 500);
  }
}

/**
 * PUT /api/admin/menu/:id/toggle
 * Toggle menu item availability
 */
async function toggleMenuAvailability(request, env, itemId) {
  try {
    const db = env.DB;

    // Get current availability
    const item = await db.prepare('SELECT available FROM menu_items WHERE id = ?').bind(itemId).first();

    if (!item) {
      return jsonResponse({ error: 'Menu item not found' }, 404);
    }

    const newAvailability = item.available === 1 ? 0 : 1;

    await db.prepare(
      'UPDATE menu_items SET available = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(newAvailability, itemId).run();

    return jsonResponse({
      success: true,
      available: newAvailability,
      message: `Menu item ${newAvailability === 1 ? 'enabled' : 'disabled'} successfully`
    });

  } catch (error) {
    console.error('Error toggling availability:', error);
    return jsonResponse({ error: 'Failed to toggle availability', details: error.message }, 500);
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate unique order UID
 * Format: BENTO-YYYYMMDD-XXXX
 */
async function generateOrderUID(env) {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');

  // Get count of orders today
  const db = env.DB;
  const count = await db.prepare(`
    SELECT COUNT(*) as count
    FROM orders
    WHERE order_uid LIKE ?
  `).bind(`BENTO-${dateStr}-%`).first();

  const orderNum = (count.count + 1).toString().padStart(4, '0');
  return `BENTO-${dateStr}-${orderNum}`;
}

/**
 * Upload file to Cloudflare R2
 */
async function uploadToR2(env, file, orderUid) {
  if (!env.BUCKET) {
    // Fallback: return a placeholder URL if R2 is not configured
    console.warn('R2 bucket not configured. Using placeholder URL.');
    return `https://placeholder.com/proof-${orderUid}.jpg`;
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const filename = `payment-proofs/${orderUid}-${Date.now()}.${getFileExtension(file.name)}`;

    await env.BUCKET.put(filename, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });

    // Return public URL (you'll need to configure R2 public access or use a custom domain)
    // For now, return the R2 object key
    return `${env.R2_PUBLIC_URL || 'https://r2.example.com'}/${filename}`;
  } catch (error) {
    console.error('R2 upload error:', error);
    throw new Error('Failed to upload to R2');
  }
}

/**
 * Upload base64 image to R2
 */
async function uploadBase64ToR2(env, base64Data, orderUid) {
  if (!env.BUCKET) {
    console.warn('R2 bucket not configured. Using placeholder URL.');
    return `https://placeholder.com/proof-${orderUid}.jpg`;
  }

  try {
    // Extract mime type and data
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 string');
    }

    const mimeType = matches[1];
    const data = matches[2];

    // Convert base64 to buffer
    const buffer = Uint8Array.from(atob(data), c => c.charCodeAt(0));

    const ext = mimeType.split('/')[1] || 'jpg';
    const filename = `payment-proofs/${orderUid}-${Date.now()}.${ext}`;

    await env.BUCKET.put(filename, buffer, {
      httpMetadata: {
        contentType: mimeType,
      },
    });

    return `${env.R2_PUBLIC_URL || 'https://r2.example.com'}/${filename}`;
  } catch (error) {
    console.error('R2 base64 upload error:', error);
    throw new Error('Failed to upload base64 to R2');
  }
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename) {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1] : 'jpg';
}

/**
 * Helper to create JSON response
 */
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
