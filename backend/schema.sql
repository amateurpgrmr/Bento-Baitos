-- Bento Baitos Database Schema for Cloudflare D1
-- Run this to initialize your database

-- Users table (customers)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster phone lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_uid TEXT UNIQUE NOT NULL, -- e.g., BENTO-20250125-0001
  user_id INTEGER NOT NULL,
  total_price INTEGER NOT NULL, -- in cents (Rp)
  payment_proof_url TEXT, -- URL to R2 stored image or NULL
  payment_verified INTEGER DEFAULT 0, -- 0 = not verified, 1 = verified by admin
  payment_method TEXT DEFAULT 'bank_transfer',
  status TEXT DEFAULT 'pending', -- pending, paid, preparing, ready, completed, cancelled
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_uid ON orders(order_uid);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL, -- in cents (Rp)
  customizations TEXT, -- JSON string for add-ons, notes, etc.
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Create index for faster order item queries
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- in cents (Rp)
  category TEXT, -- e.g., Rice Bowls, Desserts, Beverages
  image_url TEXT,
  stock INTEGER DEFAULT 0, -- Current stock quantity (0 = unlimited/not tracked)
  low_stock_threshold INTEGER DEFAULT 5, -- Alert when stock is below this
  available INTEGER DEFAULT 1, -- 1 = available, 0 = unavailable/sold out
  is_featured INTEGER DEFAULT 0, -- 1 = featured item, 0 = regular
  sort_order INTEGER DEFAULT 0, -- For custom ordering
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_menu_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_available ON menu_items(available);
CREATE INDEX IF NOT EXISTS idx_menu_featured ON menu_items(is_featured);
