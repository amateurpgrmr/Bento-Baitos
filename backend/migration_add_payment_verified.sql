-- Migration: Add payment_verified column to orders table
-- Run this if you already have an existing database

ALTER TABLE orders ADD COLUMN payment_verified INTEGER DEFAULT 0;
