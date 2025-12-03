-- Migration: Update menu items - Replace curry/teriyaki with butterfly pea tea/mango sago, remove java tea
-- Date: 2025-12-03

-- Delete Java Tea
DELETE FROM menu_items WHERE name = 'Java Tea';

-- Update Curry Rice to Butterfly Pea Tea
UPDATE menu_items
SET
  name = 'BUTTERFLY PEA TEA',
  description = 'Refreshing sparkling lemonade with a splash of butterfly pea tea!',
  price = 10000,
  category = 'Beverages',
  image_url = '/curry.jpeg',
  updated_at = CURRENT_TIMESTAMP
WHERE name = 'Curry Rice';

-- Update Panda Teriyaki to Mango Sago
UPDATE menu_items
SET
  name = 'MANGO SAGO',
  description = 'Sweet and refreshing mango sago dessert',
  price = 10000,
  category = 'Beverages',
  image_url = '/mango-sago.jpeg',
  updated_at = CURRENT_TIMESTAMP
WHERE name = 'Panda Teriyaki';

-- Japanese Sando remains unchanged
