-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE stock_status AS ENUM ('IN_STOCK', 'OUT_OF_STOCK', 'PRE_ORDER');
CREATE TYPE instance_status AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD', 'BOUGHT_BACK');
CREATE TYPE order_status AS ENUM ('PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
CREATE TYPE buyback_status AS ENUM ('REQUESTED', 'EVIDENCE_REVIEW', 'APPROVED', 'PRODUCT_RECEIVED', 'VERIFIED', 'PAID', 'REJECTED', 'CANCELLED');

-- Categories table
CREATE TABLE categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  weight_g DOUBLE PRECISION NOT NULL,
  fineness DOUBLE PRECISION NOT NULL,
  dimensions TEXT,
  base_price_irr DOUBLE PRECISION NOT NULL,
  premium_percent DOUBLE PRECISION DEFAULT 0,
  use_live_price BOOLEAN DEFAULT true,
  stock_status stock_status DEFAULT 'IN_STOCK',
  stock_count INTEGER DEFAULT 0,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product images table
CREATE TABLE product_images (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product instances (serialized items)
CREATE TABLE product_instances (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  serial TEXT UNIQUE NOT NULL,
  status instance_status DEFAULT 'AVAILABLE',
  sold_at TIMESTAMPTZ,
  order_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scan2Value product data
CREATE TABLE scan2value_products (
  serial TEXT PRIMARY KEY,
  weight_g DOUBLE PRECISION NOT NULL,
  fineness DOUBLE PRECISION NOT NULL,
  buy_price_per_g_irr DOUBLE PRECISION NOT NULL,
  buy_date TIMESTAMPTZ NOT NULL,
  branch TEXT NOT NULL,
  status TEXT NOT NULL,
  remaining_weight_g DOUBLE PRECISION NOT NULL,
  qr_payload_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table (designed for Clerk integration)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  national_code TEXT UNIQUE,
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Addresses table
CREATE TABLE addresses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  province TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  full_address TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shopping carts
CREATE TABLE carts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cart items
CREATE TABLE cart_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  cart_id TEXT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_at_add DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cart_id, product_id)
);

-- Orders table
CREATE TABLE orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  order_number TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  subtotal DOUBLE PRECISION NOT NULL,
  shipping_cost DOUBLE PRECISION DEFAULT 0,
  discount DOUBLE PRECISION DEFAULT 0,
  total_amount DOUBLE PRECISION NOT NULL,
  status order_status DEFAULT 'PENDING',
  shipping_address TEXT NOT NULL,
  payment_method TEXT,
  transaction_id TEXT,
  paid_at TIMESTAMPTZ,
  tracking_code TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items
CREATE TABLE order_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_snapshot TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price_per_unit DOUBLE PRECISION NOT NULL,
  subtotal DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Buyback requests
CREATE TABLE buyback_requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  request_number TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  serial TEXT NOT NULL REFERENCES scan2value_products(serial) ON DELETE RESTRICT,
  type TEXT NOT NULL,
  requested_qty_g DOUBLE PRECISION,
  quoted_price_irr DOUBLE PRECISION NOT NULL,
  evidence_photos TEXT[] NOT NULL DEFAULT '{}',
  status buyback_status DEFAULT 'REQUESTED',
  return_method TEXT,
  tracking_code TEXT,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  final_price_irr DOUBLE PRECISION,
  paid_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key for product instances order
ALTER TABLE product_instances 
  ADD CONSTRAINT fk_order_id 
  FOREIGN KEY (order_id) 
  REFERENCES orders(id) 
  ON DELETE SET NULL;

-- Indexes for performance
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_instances_product_id ON product_instances(product_id);
CREATE INDEX idx_product_instances_serial ON product_instances(serial);
CREATE INDEX idx_product_instances_status ON product_instances(status);
CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_buyback_requests_user_id ON buyback_requests(user_id);
CREATE INDEX idx_buyback_requests_serial ON buyback_requests(serial);
CREATE INDEX idx_buyback_requests_status ON buyback_requests(status);
