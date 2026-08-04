-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS TABLE (Email & Password Authentication)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'STORE_MANAGER',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. CUSTOMERS TABLE (Jewelry Shop Owners & Retail Buyers)
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    gstin VARCHAR(50) DEFAULT 'UNREGISTERED',
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. MATERIAL TRANSACTIONS TABLE (Gold 995 24K, Diamond, Gemstone)
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP DEFAULT NOW(),
    direction VARCHAR(20) CHECK (direction IN ('INWARD', 'OUTWARD')) NOT NULL,
    material_type VARCHAR(20) CHECK (material_type IN ('gold', 'diamond', 'gemstone')) NOT NULL,
    weight DECIMAL(10, 3) NOT NULL,
    purity VARCHAR(20) DEFAULT '995 (24K)',
    size VARCHAR(50),
    vendor_name VARCHAR(255) NOT NULL,
    manufacturer_id UUID,
    price DECIMAL(12, 2) NOT NULL,
    total_amount DECIMAL(14, 2) NOT NULL,
    product_type VARCHAR(100),
    photo_url TEXT,
    created_by UUID REFERENCES users(id)
);

-- 4. MANUFACTURERS / KARIGARS TABLE
CREATE TABLE IF NOT EXISTS manufacturers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    office TEXT NOT NULL,
    photo_url TEXT,
    jobs_done INT DEFAULT 0,
    jobs_ongoing INT DEFAULT 0,
    gold_remaining DECIMAL(10, 3) DEFAULT 0.000, -- 24K fine gold balance in grams
    making_charge DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 5. TAGGED INVENTORY STOCK CATALOG TABLE
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag_code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    purity_karat VARCHAR(50) NOT NULL,
    gross_weight DECIMAL(10, 3) NOT NULL,
    stone_weight DECIMAL(10, 3) DEFAULT 0.000,
    net_weight DECIMAL(10, 3) NOT NULL,
    fine_weight DECIMAL(10, 3) NOT NULL,
    making_charge DECIMAL(10, 2) DEFAULT 0.00,
    status VARCHAR(30) DEFAULT 'IN_STOCK',
    assigned_customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    photo_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. B2B & RETAIL INVOICES TABLE
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    gstin VARCHAR(50),
    customer_address TEXT,
    phone VARCHAR(20),
    item_tag VARCHAR(100),
    item_name VARCHAR(255),
    net_weight DECIMAL(10, 3),
    invoice_date DATE DEFAULT CURRENT_DATE,
    gold_rate_applied DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(14, 2) NOT NULL,
    old_gold_deduction DECIMAL(12, 2) DEFAULT 0.00,
    cgst_amount DECIMAL(10, 2) DEFAULT 0.00,
    sgst_amount DECIMAL(10, 2) DEFAULT 0.00,
    final_amount DECIMAL(14, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
