-- ============================================================================
-- MANHATTAN COFFEE VENDING NETWORK — MASTER DATABASE DDL SCHEMA
-- File: schema/001_full_schema.sql
-- Engines: PostgreSQL 15+ / Supabase
-- Target Tables: Exactly 68 Core Entities covering Telemetry, Orders, Dispense Logs,
-- Wallets, Food Safety Tanks, Dispute Desk, RBAC, Supply Chain, and Marketing.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE machine_status AS ENUM ('ONLINE', 'OFFLINE', 'WARNING');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE machine_mode AS ENUM ('HOT', 'COLD');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE tank_status AS ENUM ('ACTIVE', 'EXPIRED', 'DISPOSED', 'RESERVE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('Completed', 'Preparing', 'Pending', 'Cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('UPI', 'Wallet', 'Cash', 'Coins');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE ticket_status AS ENUM ('OPEN', 'CLAIMED', 'RESOLVED_REFUND', 'RESOLVED_REJECTED', 'ESCALATED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE ticket_priority AS ENUM ('HIGH', 'MEDIUM', 'LOW');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('owner', 'ops', 'support', 'finance', 'marketing', 'viewer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- MODULE 1: SYSTEM, RBAC ROLES, CONFIG & AUDIT TRAILS (Tables 1-7)
-- ============================================================================

-- Table 1: admin_roles
CREATE TABLE IF NOT EXISTS admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role user_role NOT NULL UNIQUE,
    label VARCHAR(64) NOT NULL,
    permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 2: admin_users
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(32) NOT NULL UNIQUE,
    full_name VARCHAR(128) NOT NULL,
    role user_role NOT NULL REFERENCES admin_roles(role) ON UPDATE CASCADE,
    mfa_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    mfa_secret VARCHAR(128),
    is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 3: admin_sessions
CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    token_hash VARCHAR(128) NOT NULL UNIQUE,
    user_agent TEXT,
    ip_address INET,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 4: audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admin_users(id),
    admin_name VARCHAR(128) NOT NULL,
    role user_role NOT NULL,
    action VARCHAR(64) NOT NULL,
    target VARCHAR(128) NOT NULL,
    details TEXT NOT NULL,
    before_state JSONB,
    after_state JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 5: app_config
CREATE TABLE IF NOT EXISTS app_config (
    id VARCHAR(64) PRIMARY KEY,
    key_name VARCHAR(64) NOT NULL UNIQUE,
    value JSONB NOT NULL,
    is_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
    updated_by UUID REFERENCES admin_users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 6: secret_rotations
CREATE TABLE IF NOT EXISTS secret_rotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    secret_name VARCHAR(64) NOT NULL,
    version INT NOT NULL DEFAULT 1,
    checksum VARCHAR(64) NOT NULL,
    rotated_by UUID REFERENCES admin_users(id),
    rotated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 7: api_keys
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(64) NOT NULL,
    key_prefix VARCHAR(16) NOT NULL,
    key_hash VARCHAR(128) NOT NULL UNIQUE,
    scopes JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES admin_users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- MODULE 2: MACHINES, HARDWARE & TELEMETRY (Tables 8-18)
-- ============================================================================

-- Table 8: machines
CREATE TABLE IF NOT EXISTS machines (
    id VARCHAR(32) PRIMARY KEY,
    code VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(128) NOT NULL,
    city VARCHAR(64) NOT NULL,
    location TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status machine_status NOT NULL DEFAULT 'ONLINE',
    mode machine_mode NOT NULL DEFAULT 'HOT',
    temp DECIMAL(5, 2) NOT NULL DEFAULT 65.4,
    target_temp DECIMAL(5, 2) NOT NULL DEFAULT 66.0,
    milk_liters DECIMAL(5, 2) NOT NULL DEFAULT 38.0,
    max_milk_liters DECIMAL(5, 2) NOT NULL DEFAULT 45.0,
    cups_count INT NOT NULL DEFAULT 142,
    max_cups INT NOT NULL DEFAULT 250,
    kits_count INT NOT NULL DEFAULT 168,
    signal_dbm INT NOT NULL DEFAULT -68,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    sd_card_free_mb INT NOT NULL DEFAULT 24800,
    firmware_version VARCHAR(32) NOT NULL DEFAULT 'v2.4.1-rc3',
    firmware_checksum VARCHAR(64) NOT NULL DEFAULT '9a4c8e71b2f09d8e',
    boot_count INT NOT NULL DEFAULT 14,
    wdt_resets INT NOT NULL DEFAULT 0,
    last_ping_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 9: machine_telemetry
CREATE TABLE IF NOT EXISTS machine_telemetry (
    id BIGSERIAL PRIMARY KEY,
    machine_id VARCHAR(32) NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    boiler_temp DECIMAL(5, 2) NOT NULL,
    milk_liters DECIMAL(5, 2) NOT NULL,
    signal_dbm INT NOT NULL,
    voltage_mv INT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_telemetry_machine_time ON machine_telemetry (machine_id, recorded_at DESC);

-- Table 10: machine_health_logs
CREATE TABLE IF NOT EXISTS machine_health_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id VARCHAR(32) NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    fault_code VARCHAR(64) NOT NULL,
    severity VARCHAR(16) NOT NULL,
    description TEXT NOT NULL,
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_health_logs_window ON machine_health_logs (machine_id, occurred_at DESC);

-- Table 11: machine_firmware_versions
CREATE TABLE IF NOT EXISTS machine_firmware_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_tag VARCHAR(32) NOT NULL UNIQUE,
    binary_url TEXT NOT NULL,
    sha256_checksum VARCHAR(64) NOT NULL,
    changelog TEXT,
    is_stable BOOLEAN NOT NULL DEFAULT TRUE,
    released_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 12: machine_commands
CREATE TABLE IF NOT EXISTS machine_commands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id VARCHAR(32) NOT NULL REFERENCES machines(id),
    command_name VARCHAR(64) NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    result_json JSONB,
    requested_by VARCHAR(128),
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    executed_at TIMESTAMPTZ
);

-- Table 13: machine_maintenance_logs
CREATE TABLE IF NOT EXISTS machine_maintenance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id VARCHAR(32) NOT NULL REFERENCES machines(id),
    technician_name VARCHAR(128) NOT NULL,
    task_title VARCHAR(128) NOT NULL,
    details TEXT NOT NULL,
    duration_mins INT,
    performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 14: machine_cleaning_cycles
CREATE TABLE IF NOT EXISTS machine_cleaning_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id VARCHAR(32) NOT NULL REFERENCES machines(id),
    cycle_type VARCHAR(32) NOT NULL, -- FLUSH, DESCALING, SANITIZE
    water_volume_ml INT NOT NULL DEFAULT 500,
    chemical_used VARCHAR(64),
    performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 15: machine_power_events
CREATE TABLE IF NOT EXISTS machine_power_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id VARCHAR(32) NOT NULL REFERENCES machines(id),
    event_type VARCHAR(32) NOT NULL, -- POWER_CUT, RESTORED, SURGE
    voltage INT,
    event_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 16: machine_sensors
CREATE TABLE IF NOT EXISTS machine_sensors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id VARCHAR(32) NOT NULL REFERENCES machines(id),
    sensor_name VARCHAR(64) NOT NULL,
    sensor_type VARCHAR(32) NOT NULL,
    calibration_offset DECIMAL(6, 3) NOT NULL DEFAULT 0.0,
    last_calibrated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 17: cameras
CREATE TABLE IF NOT EXISTS cameras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id VARCHAR(32) NOT NULL REFERENCES machines(id),
    channel_no INT NOT NULL,
    stream_url TEXT,
    is_online BOOLEAN NOT NULL DEFAULT TRUE,
    last_frame_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 18: video_clips
CREATE TABLE IF NOT EXISTS video_clips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id VARCHAR(32) NOT NULL REFERENCES machines(id),
    camera_channel INT NOT NULL,
    order_id VARCHAR(32),
    ticket_id VARCHAR(32),
    clip_url TEXT NOT NULL,
    duration_secs INT NOT NULL DEFAULT 30,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- MODULE 3: MILK TANKS & SUPPLY CHAIN (Tables 19-27)
-- ============================================================================

-- Table 19: machine_tanks
CREATE TABLE IF NOT EXISTS machine_tanks (
    id VARCHAR(32) PRIMARY KEY,
    machine_id VARCHAR(32) NOT NULL REFERENCES machines(id),
    tank_uid VARCHAR(64) NOT NULL UNIQUE,
    liters DECIMAL(5, 2) NOT NULL,
    max_liters DECIMAL(5, 2) NOT NULL DEFAULT 45.0,
    filled_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    status tank_status NOT NULL DEFAULT 'ACTIVE',
    disposal_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 20: machine_tank_events
CREATE TABLE IF NOT EXISTS machine_tank_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tank_id VARCHAR(32) NOT NULL REFERENCES machine_tanks(id),
    machine_id VARCHAR(32) NOT NULL REFERENCES machines(id),
    technician_id UUID REFERENCES admin_users(id),
    event_type VARCHAR(32) NOT NULL,
    notes TEXT,
    event_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 21: machine_stock
CREATE TABLE IF NOT EXISTS machine_stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id VARCHAR(32) NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    variant_name VARCHAR(128) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    max_capacity INT NOT NULL DEFAULT 120,
    reorder_threshold INT NOT NULL DEFAULT 20,
    last_refill_at TIMESTAMPTZ,
    last_refill_by VARCHAR(128),
    CONSTRAINT uq_machine_variant UNIQUE (machine_id, variant_name)
);

-- Table 22: machine_stock_events
CREATE TABLE IF NOT EXISTS machine_stock_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id VARCHAR(32) NOT NULL REFERENCES machines(id),
    variant_name VARCHAR(128) NOT NULL,
    delta_qty INT NOT NULL,
    reason VARCHAR(64) NOT NULL,
    technician_name VARCHAR(128),
    logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 23: raw_materials
CREATE TABLE IF NOT EXISTS raw_materials (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    unit VARCHAR(16) NOT NULL,
    reorder_level DECIMAL(10, 2) NOT NULL,
    unit_cost DECIMAL(10, 2) NOT NULL
);

-- Table 24: warehouse_inventory
CREATE TABLE IF NOT EXISTS warehouse_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raw_material_id VARCHAR(32) NOT NULL REFERENCES raw_materials(id),
    batch_no VARCHAR(64) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    expires_at DATE,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 25: supplier_orders
CREATE TABLE IF NOT EXISTS supplier_orders (
    id VARCHAR(32) PRIMARY KEY,
    supplier_name VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    total_amount DECIMAL(10, 2) NOT NULL,
    ordered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 26: supplier_order_items
CREATE TABLE IF NOT EXISTS supplier_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_order_id VARCHAR(32) NOT NULL REFERENCES supplier_orders(id),
    raw_material_id VARCHAR(32) NOT NULL REFERENCES raw_materials(id),
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL
);

-- Table 27: stock_waste_logs
CREATE TABLE IF NOT EXISTS stock_waste_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id VARCHAR(32) REFERENCES machines(id),
    item_name VARCHAR(128) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    waste_reason VARCHAR(128) NOT NULL,
    recorded_by VARCHAR(128) NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- MODULE 4: PRODUCTS, RECIPES & KITS (Tables 28-31)
-- ============================================================================

-- Table 28: products
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    short_name VARCHAR(64) NOT NULL,
    price DECIMAL(6, 2) NOT NULL,
    cost_basis DECIMAL(6, 2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    emoji VARCHAR(8)
);

-- Table 29: product_variants
CREATE TABLE IF NOT EXISTS product_variants (
    id VARCHAR(32) PRIMARY KEY,
    product_id VARCHAR(32) NOT NULL REFERENCES products(id),
    variant_label VARCHAR(64) NOT NULL,
    sugar_default INT NOT NULL DEFAULT 1,
    milk_ml INT NOT NULL DEFAULT 180,
    price_delta DECIMAL(6, 2) NOT NULL DEFAULT 0.0
);

-- Table 30: kit_templates
CREATE TABLE IF NOT EXISTS kit_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id VARCHAR(32) NOT NULL REFERENCES products(id),
    name VARCHAR(128) NOT NULL,
    powder_weight_g DECIMAL(5, 2) NOT NULL,
    sugar_sachets INT NOT NULL DEFAULT 1,
    stirrer_included BOOLEAN NOT NULL DEFAULT TRUE,
    cup_size VARCHAR(16) NOT NULL DEFAULT '8oz'
);

-- Table 31: kit_components
CREATE TABLE IF NOT EXISTS kit_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kit_template_id UUID NOT NULL REFERENCES kit_templates(id),
    component_name VARCHAR(64) NOT NULL,
    quantity INT NOT NULL DEFAULT 1
);

-- ============================================================================
-- MODULE 5: CUSTOMERS, WALLETS, LOYALTY & CONSENTS (Tables 32-41)
-- ============================================================================

-- Table 32: users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(32) PRIMARY KEY,
    phone VARCHAR(32) NOT NULL UNIQUE,
    full_name VARCHAR(128) NOT NULL,
    avatar_initials VARCHAR(4) NOT NULL,
    city VARCHAR(64) NOT NULL,
    college_or_work TEXT,
    segment VARCHAR(32) NOT NULL DEFAULT 'Active Today',
    is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 33: user_profiles
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id VARCHAR(32) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    age_band VARCHAR(16),
    preferred_drink VARCHAR(128),
    notification_token TEXT,
    fcm_registered_at TIMESTAMPTZ
);

-- Table 34: user_stats
CREATE TABLE IF NOT EXISTS user_stats (
    user_id VARCHAR(32) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    orders_count INT NOT NULL DEFAULT 0,
    total_spend DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
    current_streak INT NOT NULL DEFAULT 0,
    longest_streak INT NOT NULL DEFAULT 0,
    favorite_variant VARCHAR(128),
    last_order_at TIMESTAMPTZ
);

-- Table 35: user_consents
CREATE TABLE IF NOT EXISTS user_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(32) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    leaderboard_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
    public_handle_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
    consent_version VARCHAR(16) NOT NULL DEFAULT 'v2.1',
    consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 36: customer_notes
CREATE TABLE IF NOT EXISTS customer_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id VARCHAR(32) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    author_name VARCHAR(128) NOT NULL,
    note_content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 37: loyalty_tiers
CREATE TABLE IF NOT EXISTS loyalty_tiers (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    min_cups INT NOT NULL,
    discount_pct DECIMAL(5, 2) NOT NULL DEFAULT 0.0,
    perks JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- Table 38: wallets
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(32) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
    coin_balance INT NOT NULL DEFAULT 0,
    currency VARCHAR(8) NOT NULL DEFAULT 'INR',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 39: wallet_transactions
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES wallets(id),
    user_id VARCHAR(32) NOT NULL REFERENCES users(id),
    type VARCHAR(16) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    balance_after DECIMAL(10, 2) NOT NULL,
    description TEXT NOT NULL,
    reference_id VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_user ON wallet_transactions (user_id, created_at DESC);

-- Table 40: referrals
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id VARCHAR(32) NOT NULL REFERENCES users(id),
    referred_id VARCHAR(32) NOT NULL REFERENCES users(id),
    reward_amount DECIMAL(6, 2) NOT NULL DEFAULT 20.0,
    is_claimed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 41: gifts
CREATE TABLE IF NOT EXISTS gifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id VARCHAR(32) NOT NULL REFERENCES users(id),
    recipient_phone VARCHAR(32) NOT NULL,
    product_id VARCHAR(32) REFERENCES products(id),
    status VARCHAR(16) NOT NULL DEFAULT 'SENT',
    redeemed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- MODULE 6: ORDERS, DISPENSE & PAYMENTS (Tables 42-48)
-- ============================================================================

-- Table 42: orders
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(32) PRIMARY KEY,
    order_no VARCHAR(32) NOT NULL UNIQUE,
    machine_id VARCHAR(32) NOT NULL REFERENCES machines(id),
    machine_name VARCHAR(128) NOT NULL,
    product_id VARCHAR(32) REFERENCES products(id),
    variant VARCHAR(128) NOT NULL,
    amount DECIMAL(8, 2) NOT NULL,
    discount DECIMAL(8, 2) NOT NULL DEFAULT 0.0,
    net_amount DECIMAL(8, 2) NOT NULL,
    cost_basis DECIMAL(8, 2) NOT NULL,
    payment_method payment_method NOT NULL,
    status order_status NOT NULL DEFAULT 'Completed',
    is_flagged BOOLEAN NOT NULL DEFAULT FALSE,
    utr VARCHAR(64),
    buyer_id VARCHAR(32) REFERENCES users(id),
    buyer_name VARCHAR(128) NOT NULL,
    buyer_phone VARCHAR(32) NOT NULL,
    tank_uid VARCHAR(64),
    ordered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_machine_time ON orders (machine_id, ordered_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders (buyer_id, ordered_at DESC);

-- Table 43: order_items
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(32) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(32) REFERENCES products(id),
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(6, 2) NOT NULL,
    total_price DECIMAL(6, 2) NOT NULL
);

-- Table 44: payment_transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(32) NOT NULL REFERENCES orders(id),
    gateway VARCHAR(32) NOT NULL, -- RAZORPAY, PHONEPE, WALLET
    gateway_payment_id VARCHAR(128),
    amount DECIMAL(8, 2) NOT NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'INR',
    status VARCHAR(32) NOT NULL DEFAULT 'SUCCESS',
    response_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 45: dispense_logs
CREATE TABLE IF NOT EXISTS dispense_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(32) NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    valve_open_ms INT NOT NULL,
    flow_pulses INT NOT NULL,
    expected_ml INT NOT NULL,
    dispensed_ml INT NOT NULL,
    variance_pct DECIMAL(5, 2) NOT NULL,
    cup_detected BOOLEAN NOT NULL DEFAULT TRUE,
    kit_dropped BOOLEAN NOT NULL DEFAULT TRUE,
    malai_pump_ms INT DEFAULT 0,
    conveyor_steps INT DEFAULT 450,
    window_opened BOOLEAN NOT NULL DEFAULT TRUE,
    pickup_detected BOOLEAN NOT NULL DEFAULT TRUE,
    logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 46: invoice_receipts
CREATE TABLE IF NOT EXISTS invoice_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(32) NOT NULL REFERENCES orders(id),
    invoice_no VARCHAR(64) NOT NULL UNIQUE,
    gstin VARCHAR(32),
    tax_amount DECIMAL(6, 2) NOT NULL DEFAULT 0.0,
    pdf_url TEXT,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 47: qr_codes
CREATE TABLE IF NOT EXISTS qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash VARCHAR(128) NOT NULL UNIQUE,
    order_id VARCHAR(32) REFERENCES orders(id),
    user_id VARCHAR(32) REFERENCES users(id),
    source VARCHAR(32) NOT NULL DEFAULT 'Purchase',
    share_count INT NOT NULL DEFAULT 0,
    is_redeemed BOOLEAN NOT NULL DEFAULT FALSE,
    redeemed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 48: qr_code_events
CREATE TABLE IF NOT EXISTS qr_code_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_code_id UUID NOT NULL REFERENCES qr_codes(id),
    event_type VARCHAR(32) NOT NULL,
    ip_or_device TEXT,
    event_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- MODULE 7: SUPPORT, DISPUTE DESK & QUALITY (Tables 49-57)
-- ============================================================================

-- Table 49: support_tickets
CREATE TABLE IF NOT EXISTS support_tickets (
    id VARCHAR(32) PRIMARY KEY,
    ticket_no VARCHAR(32) NOT NULL UNIQUE,
    order_id VARCHAR(32) NOT NULL REFERENCES orders(id),
    order_no VARCHAR(32) NOT NULL,
    customer_id VARCHAR(32) NOT NULL REFERENCES users(id),
    customer_name VARCHAR(128) NOT NULL,
    customer_phone VARCHAR(32) NOT NULL,
    machine_id VARCHAR(32) NOT NULL REFERENCES machines(id),
    machine_name VARCHAR(128) NOT NULL,
    amount DECIMAL(8, 2) NOT NULL,
    utr VARCHAR(64),
    reason VARCHAR(64) NOT NULL,
    reason_label VARCHAR(128) NOT NULL,
    status ticket_status NOT NULL DEFAULT 'OPEN',
    priority ticket_priority NOT NULL DEFAULT 'MEDIUM',
    sla_remaining_minutes INT NOT NULL DEFAULT 5,
    sla_deadline TIMESTAMPTZ NOT NULL,
    channel VARCHAR(32) NOT NULL DEFAULT 'Bot',
    customer_message TEXT NOT NULL,
    dispense_variance DECIMAL(5, 2) NOT NULL DEFAULT 0.0,
    resolution TEXT,
    resolved_at TIMESTAMPTZ,
    resolved_by VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tickets_status_sla ON support_tickets (status, sla_deadline ASC);

-- Table 50: ticket_status_history
CREATE TABLE IF NOT EXISTS ticket_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id VARCHAR(32) NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    from_status ticket_status,
    to_status ticket_status NOT NULL,
    changed_by VARCHAR(128) NOT NULL,
    note TEXT,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 51: ticket_evidence
CREATE TABLE IF NOT EXISTS ticket_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id VARCHAR(32) NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    evidence_type VARCHAR(32) NOT NULL, -- VIDEO_CLIP, SENSOR_LOG, IMAGE
    url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 52: refunds
CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id VARCHAR(32) REFERENCES support_tickets(id),
    order_id VARCHAR(32) NOT NULL REFERENCES orders(id),
    amount DECIMAL(8, 2) NOT NULL,
    destination VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    approved_by UUID REFERENCES admin_users(id),
    bank_payout_ref VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 53: dispute_verdicts
CREATE TABLE IF NOT EXISTS dispute_verdicts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id VARCHAR(32) NOT NULL REFERENCES support_tickets(id),
    verdict VARCHAR(32) NOT NULL, -- APPROVED, REJECTED, ESCALATED
    justification TEXT NOT NULL,
    decided_by UUID REFERENCES admin_users(id),
    decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 54: feedback_ratings
CREATE TABLE IF NOT EXISTS feedback_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(32) REFERENCES orders(id),
    machine_id VARCHAR(32) REFERENCES machines(id),
    user_id VARCHAR(32) REFERENCES users(id),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    tag VARCHAR(64),
    comments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 55: customer_satisfaction_surveys
CREATE TABLE IF NOT EXISTS customer_satisfaction_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id VARCHAR(32) REFERENCES users(id),
    csat_score INT NOT NULL,
    survey_category VARCHAR(64),
    feedback TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 56: fraud_blacklist
CREATE TABLE IF NOT EXISTS fraud_blacklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier VARCHAR(128) NOT NULL UNIQUE,
    identifier_type VARCHAR(32) NOT NULL,
    severity VARCHAR(16) NOT NULL DEFAULT 'CRITICAL',
    reason TEXT NOT NULL,
    added_by UUID REFERENCES admin_users(id),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 57: support_macros
CREATE TABLE IF NOT EXISTS support_macros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    macro_key VARCHAR(64) NOT NULL UNIQUE,
    title VARCHAR(128) NOT NULL,
    response_template TEXT NOT NULL,
    category VARCHAR(32) NOT NULL
);

-- ============================================================================
-- MODULE 8: MARKETING, ADS & ENGAGEMENT (Tables 58-68)
-- ============================================================================

-- Table 58: offers
CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(128) NOT NULL,
    discount_type VARCHAR(16) NOT NULL,
    value DECIMAL(6, 2) NOT NULL,
    min_order DECIMAL(6, 2) DEFAULT 0.0,
    budget_cap DECIMAL(10, 2) NOT NULL,
    budget_burned DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL
);

-- Table 59: coupons
CREATE TABLE IF NOT EXISTS coupons (
    id VARCHAR(32) PRIMARY KEY,
    code VARCHAR(32) NOT NULL UNIQUE,
    title VARCHAR(128) NOT NULL,
    type VARCHAR(16) NOT NULL,
    value DECIMAL(6, 2) NOT NULL,
    min_order DECIMAL(6, 2) DEFAULT 0.0,
    usage_count INT NOT NULL DEFAULT 0,
    max_usage INT NOT NULL DEFAULT 500,
    budget_cap DECIMAL(10, 2) NOT NULL,
    budget_burned DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
    status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE',
    expires_at TIMESTAMPTZ NOT NULL
);

-- Table 60: coupon_redemptions
CREATE TABLE IF NOT EXISTS coupon_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id VARCHAR(32) NOT NULL REFERENCES coupons(id),
    user_id VARCHAR(32) NOT NULL REFERENCES users(id),
    order_id VARCHAR(32) NOT NULL REFERENCES orders(id),
    discount_applied DECIMAL(6, 2) NOT NULL,
    redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 61: banners
CREATE TABLE IF NOT EXISTS banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(128) NOT NULL,
    placement VARCHAR(32) NOT NULL,
    impressions INT NOT NULL DEFAULT 0,
    clicks INT NOT NULL DEFAULT 0,
    priority INT NOT NULL DEFAULT 1,
    status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE',
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 62: push_notifications
CREATE TABLE IF NOT EXISTS push_notifications (
    id VARCHAR(32) PRIMARY KEY,
    title VARCHAR(128) NOT NULL,
    body TEXT NOT NULL,
    target_segment VARCHAR(64) NOT NULL,
    delivered INT NOT NULL DEFAULT 0,
    opened INT NOT NULL DEFAULT 0,
    open_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.0,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 63: notification_deliveries
CREATE TABLE IF NOT EXISTS notification_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id VARCHAR(32) NOT NULL REFERENCES push_notifications(id),
    user_id VARCHAR(32) NOT NULL REFERENCES users(id),
    status VARCHAR(16) NOT NULL DEFAULT 'DELIVERED',
    read_at TIMESTAMPTZ
);

-- Table 64: user_badges
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(32) NOT NULL REFERENCES users(id),
    badge_name VARCHAR(64) NOT NULL,
    badge_icon VARCHAR(16),
    awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 65: leaderboard_entries
CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(32) NOT NULL REFERENCES users(id),
    cups_purchased INT NOT NULL DEFAULT 0,
    rank INT NOT NULL,
    period_tag VARCHAR(16) NOT NULL -- 'WEEKLY', 'MONTHLY'
);

-- Table 66: ad_networks
CREATE TABLE IF NOT EXISTS ad_networks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(64) NOT NULL,
    ecpm DECIMAL(6, 2) NOT NULL,
    daily_impressions INT NOT NULL DEFAULT 0,
    daily_revenue DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
    status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE'
);

-- Table 67: ad_spaces
CREATE TABLE IF NOT EXISTS ad_spaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id VARCHAR(32) NOT NULL REFERENCES machines(id),
    slot_name VARCHAR(64) NOT NULL,
    surface_area VARCHAR(32),
    rate_monthly DECIMAL(10, 2) NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'AVAILABLE'
);

-- Table 68: ad_space_bookings
CREATE TABLE IF NOT EXISTS ad_space_bookings (
    id VARCHAR(32) PRIMARY KEY,
    space_id UUID REFERENCES ad_spaces(id),
    machine_id VARCHAR(32) NOT NULL REFERENCES machines(id),
    slot_name VARCHAR(64) NOT NULL,
    advertiser VARCHAR(128) NOT NULL,
    rate_monthly DECIMAL(10, 2) NOT NULL,
    months_booked INT NOT NULL DEFAULT 1,
    status VARCHAR(16) NOT NULL DEFAULT 'PAID',
    renewal_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- VERIFICATION COUNT: Exactly 68 Enterprise Production Tables
-- ============================================================================
