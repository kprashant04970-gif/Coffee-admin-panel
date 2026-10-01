-- ==============================================================================
-- Manhattan Coffee Vending Network — PostgreSQL Database Schema
-- File: scripts/init-db.sql
-- Hostinger VPS Self-Hosted PostgreSQL Configuration
-- ==============================================================================

-- Enable UUID and Cryptographic extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. USERS & OPERATORS (Authentication & RBAC)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'support', 'ops', 'marketing', 'finance', 'owner')),
    phone VARCHAR(30),
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- OTP Codes for Passwordless & Two-Factor Authentication
CREATE TABLE IF NOT EXISTS otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL,
    purpose VARCHAR(50) NOT NULL DEFAULT 'LOGIN', -- 'LOGIN', 'MFA', 'SECRET_ROTATION'
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_otp_email_purpose ON otp_codes (email, purpose, used);

-- ------------------------------------------------------------------------------
-- 2. VENDING MACHINES & IOT TELEMETRY
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS machines (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'MCH-001'
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(255) NOT NULL,
    zone VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ONLINE' CHECK (status IN ('ONLINE', 'OFFLINE', 'FAULT', 'MAINTENANCE')),
    mode VARCHAR(20) NOT NULL DEFAULT 'HOT' CHECK (mode IN ('HOT', 'COLD')),
    current_temp NUMERIC(5, 2) NOT NULL DEFAULT 88.5,
    target_temp NUMERIC(5, 2) NOT NULL DEFAULT 92.0,
    boiler_pressure NUMERIC(5, 2) NOT NULL DEFAULT 9.2,
    water_flow_rate NUMERIC(5, 2) NOT NULL DEFAULT 45.0,
    milk_level_liters NUMERIC(5, 2) NOT NULL DEFAULT 38.5,
    milk_capacity_liters NUMERIC(5, 2) NOT NULL DEFAULT 50.0,
    cups_dispensed_today INT NOT NULL DEFAULT 0,
    cleaning_status VARCHAR(50) DEFAULT 'CERTIFIED_OK',
    last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. ORDERS & TRANSACTIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'ORD-9842'
    machine_id VARCHAR(50) REFERENCES machines(id) ON DELETE SET NULL,
    customer_id VARCHAR(50),
    customer_name VARCHAR(150),
    beverage_name VARCHAR(150) NOT NULL,
    temperature_mode VARCHAR(20) DEFAULT 'HOT',
    sugar_level VARCHAR(30) DEFAULT 'Medium',
    amount_inr NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'UPI',
    status VARCHAR(50) NOT NULL DEFAULT 'DISPENSED' CHECK (status IN ('QUEUED', 'DISPENSING', 'DISPENSED', 'FAILED', 'DISPUTED', 'REFUNDED')),
    qr_token VARCHAR(255),
    error_code VARCHAR(50),
    dispense_time_seconds INT DEFAULT 42,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_machine ON orders (machine_id);

-- ------------------------------------------------------------------------------
-- 4. CUSTOMERS & WALLETS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'CUS-401'
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(255),
    wallet_balance_inr NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_orders INT NOT NULL DEFAULT 0,
    loyalty_tier VARCHAR(50) NOT NULL DEFAULT 'Silver',
    is_blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. SUPPORT TICKETS & DISPUTE DESK
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS support_tickets (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'TKT-8902'
    ticket_no VARCHAR(50) UNIQUE NOT NULL,
    order_id VARCHAR(50) REFERENCES orders(id) ON DELETE SET NULL,
    machine_id VARCHAR(50) REFERENCES machines(id) ON DELETE SET NULL,
    customer_id VARCHAR(50) REFERENCES customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(150) NOT NULL,
    issue_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_REVIEW', 'APPROVED', 'REJECTED')),
    priority VARCHAR(50) NOT NULL DEFAULT 'HIGH',
    flow_rate_variance NUMERIC(5, 2) DEFAULT 0.0,
    expected_grams NUMERIC(6, 2) DEFAULT 220.0,
    dispensed_grams NUMERIC(6, 2) DEFAULT 180.0,
    video_clip_uri VARCHAR(500),
    sla_seconds_remaining INT DEFAULT 300,
    operator_verdict VARCHAR(50),
    operator_note TEXT,
    resolved_by VARCHAR(255),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets (status);

-- ------------------------------------------------------------------------------
-- 6. INVENTORY: TANKS & CONSUMABLES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory_tanks (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'TNK-901'
    batch_no VARCHAR(100) NOT NULL,
    supplier_name VARCHAR(150) NOT NULL,
    fssai_cert_no VARCHAR(100) NOT NULL,
    liters_capacity NUMERIC(6, 2) NOT NULL DEFAULT 50.0,
    current_liters NUMERIC(6, 2) NOT NULL DEFAULT 50.0,
    temperature_c NUMERIC(5, 2) DEFAULT 3.8,
    status VARCHAR(50) NOT NULL DEFAULT 'MOUNTED' CHECK (status IN ('MOUNTED', 'IN_TRANSIT', 'DEPLETED', 'RESERVE')),
    assigned_machine_id VARCHAR(50) REFERENCES machines(id) ON DELETE SET NULL,
    mounted_at TIMESTAMPTZ DEFAULT NOW(),
    expiry_date TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS inventory_stock (
    id VARCHAR(50) PRIMARY KEY,
    item_name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    unit VARCHAR(30) NOT NULL,
    reorder_level INT NOT NULL DEFAULT 50,
    cost_basis_inr NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. MARKETING: COUPONS, ADS, BANNERS & NOTIFICATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coupons (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(150) NOT NULL,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('FLAT', 'PERCENT')),
    discount_value NUMERIC(10, 2) NOT NULL,
    budget_inr NUMERIC(10, 2) NOT NULL,
    spent_inr NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    redemptions_count INT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_banners (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    subtitle VARCHAR(255),
    image_url VARCHAR(500) NOT NULL,
    cta_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    order_index INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ad_space_bookings (
    id VARCHAR(50) PRIMARY KEY,
    sponsor_name VARCHAR(150) NOT NULL,
    campaign_name VARCHAR(150) NOT NULL,
    machine_id VARCHAR(50) REFERENCES machines(id) ON DELETE CASCADE,
    daily_impressions INT DEFAULT 0,
    daily_rate_inr NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE'
);

-- ------------------------------------------------------------------------------
-- 8. AUDIT LOGS (Immutable Security Log)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    permission VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'SUCCESS',
    ip_address VARCHAR(50) DEFAULT '127.0.0.1',
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs (created_at DESC);

-- ------------------------------------------------------------------------------
-- SEED INITIAL OWNER & SUPER ADMIN ACCOUNT
-- Password: "Admin@Manhattan2026!"
-- ------------------------------------------------------------------------------
INSERT INTO users (email, full_name, password_hash, role, is_active)
VALUES (
    'admin@manhattancoffee.in',
    'Chief Operator (Root)',
    -- Pre-hashed bcrypt for 'Admin@Manhattan2026!'
    '$2a$10$wN9aA7k6vHq10F1Rj1hGLeE7C7cO5E0Qp5f3N0h7t6k9y0x1Z2m4q',
    'owner',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- Seed Sample Machines
INSERT INTO machines (id, code, name, location, zone, status, mode, current_temp, target_temp, milk_level_liters, cups_dispensed_today)
VALUES
    ('MCH-001', 'BKC-01', 'BKC Financial Center', 'One BKC Tower, Ground Lobby', 'South Mumbai', 'ONLINE', 'HOT', 92.4, 92.0, 42.0, 184),
    ('MCH-002', 'MAL-02', 'Phoenix Palladium Mall', 'Level 2 Food Courtyard', 'Lower Parel', 'ONLINE', 'HOT', 91.8, 92.0, 21.0, 142),
    ('MCH-003', 'CMP-03', 'IIT Powai Campus Hub', 'Student Gymkhana Corridor', 'Powai', 'FAULT', 'HOT', 76.5, 92.0, 12.0, 68),
    ('MCH-004', 'AIR-04', 'T2 Chhatrapati Terminal', 'Arrivals Gate 4 Pier', 'Andheri East', 'ONLINE', 'COLD', 4.2, 4.0, 36.0, 219),
    ('MCH-005', 'ITP-05', 'Nesco IT Park Tower 3', 'Tower 3 Main Lobby', 'Goregaon East', 'ONLINE', 'HOT', 93.1, 92.0, 29.5, 115)
ON CONFLICT (id) DO NOTHING;
