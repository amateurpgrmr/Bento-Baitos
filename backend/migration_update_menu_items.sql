-- Migration: Update menu_items table with stock management fields
-- Run this if you already have an existing menu_items table

-- Drop existing table and recreate with new schema
DROP TABLE IF EXISTS menu_items;

CREATE TABLE menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  category TEXT,
  image_url TEXT,
  stock INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  available INTEGER DEFAULT 1,
  is_featured INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_menu_category ON menu_items(category);
CREATE INDEX idx_menu_available ON menu_items(available);
CREATE INDEX idx_menu_featured ON menu_items(is_featured);

-- Insert sample menu items
INSERT INTO menu_items (name, description, price, category, image_url, stock, available, is_featured, sort_order) VALUES
('Curry Rice', 'Delicious Japanese curry with rice', 20000, 'Rice Bowls', '/curry.jpeg', 0, 1, 1, 1),
('Panda Teriyaki', 'Teriyaki chicken rice bowl', 20000, 'Rice Bowls', '/panda teriyaki.jpeg', 0, 1, 1, 2),
('Japanese Sando', 'Traditional Japanese sandwich', 10000, 'Desserts', '/japanese sando.jpeg', 0, 1, 0, 3),
('Java Tea', 'Refreshing jasmine tea', 10000, 'Beverages', '/java tea.jpeg', 0, 1, 0, 4);
