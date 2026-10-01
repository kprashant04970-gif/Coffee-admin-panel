-- ============================================================================
-- MANHATTAN COFFEE VENDING NETWORK — ROW LEVEL SECURITY (RLS) POLICIES
-- File: schema/004_rls_policies.sql
-- Engines: PostgreSQL 15+ / Supabase RLS
-- Implements the 6-Role Access Control Matrix:
-- 'owner', 'ops', 'support', 'finance', 'marketing', 'viewer'
-- ============================================================================

-- Helper function to extract current authenticated admin role from JWT / Context
CREATE OR REPLACE FUNCTION current_admin_role()
RETURNS user_role
LANGUAGE sql
STABLE
AS $$
    SELECT COALESCE(
        (current_setting('request.jwt.claim.role', true))::user_role,
        'viewer'::user_role
    );
$$;

-- Enable RLS across sensitive entities
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE machine_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE machine_tanks ENABLE ROW LEVEL SECURITY;
ALTER TABLE machine_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispense_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 1. MACHINES POLICIES
-- ----------------------------------------------------------------------------
-- Everyone can view machines
CREATE POLICY p_machines_read ON machines
    FOR SELECT TO authenticated
    USING (TRUE);

-- Only 'ops' or 'owner' can update machine hardware state
CREATE POLICY p_machines_update ON machines
    FOR UPDATE TO authenticated
    USING (current_admin_role() IN ('owner', 'ops'))
    WITH CHECK (current_admin_role() IN ('owner', 'ops'));

-- ----------------------------------------------------------------------------
-- 2. ORDERS & DISPENSE LOGS POLICIES
-- ----------------------------------------------------------------------------
-- Read-only for authenticated roles
CREATE POLICY p_orders_read ON orders
    FOR SELECT TO authenticated
    USING (TRUE);

CREATE POLICY p_dispense_logs_read ON dispense_logs
    FOR SELECT TO authenticated
    USING (TRUE);

-- ----------------------------------------------------------------------------
-- 3. SUPPORT TICKETS & DISPUTE DESK
-- ----------------------------------------------------------------------------
-- Support, Ops, Finance, Owner can read tickets
CREATE POLICY p_tickets_read ON support_tickets
    FOR SELECT TO authenticated
    USING (current_admin_role() IN ('owner', 'ops', 'support', 'finance'));

-- Support, Ops, Owner can mutate tickets
CREATE POLICY p_tickets_mutate ON support_tickets
    FOR UPDATE TO authenticated
    USING (current_admin_role() IN ('owner', 'ops', 'support'))
    WITH CHECK (current_admin_role() IN ('owner', 'ops', 'support'));

-- ----------------------------------------------------------------------------
-- 4. REFUNDS & FINANCIAL LEDGER
-- Separation of Duties: Support CANNOT authorize payout; Ops or Finance required.
-- ----------------------------------------------------------------------------
CREATE POLICY p_refunds_read ON refunds
    FOR SELECT TO authenticated
    USING (current_admin_role() IN ('owner', 'ops', 'finance', 'support'));

CREATE POLICY p_refunds_authorize ON refunds
    FOR UPDATE TO authenticated
    USING (current_admin_role() IN ('owner', 'ops', 'finance'))
    WITH CHECK (current_admin_role() IN ('owner', 'ops', 'finance'));

CREATE POLICY p_wallets_read ON wallets
    FOR SELECT TO authenticated
    USING (current_admin_role() IN ('owner', 'finance', 'support'));

CREATE POLICY p_wallets_mutate ON wallets
    FOR ALL TO authenticated
    USING (current_admin_role() IN ('owner', 'finance'));

-- ----------------------------------------------------------------------------
-- 5. MARKETING & COUPONS
-- ----------------------------------------------------------------------------
CREATE POLICY p_coupons_read ON coupons
    FOR SELECT TO authenticated
    USING (TRUE);

CREATE POLICY p_coupons_mutate ON coupons
    FOR ALL TO authenticated
    USING (current_admin_role() IN ('owner', 'marketing'));

-- ----------------------------------------------------------------------------
-- 6. SECURITY & CONFIG
-- Only 'owner' can touch secret rotation or fraud blacklists
-- ----------------------------------------------------------------------------
CREATE POLICY p_config_owner ON app_config
    FOR ALL TO authenticated
    USING (current_admin_role() = 'owner');

CREATE POLICY p_blacklist_owner ON fraud_blacklist
    FOR ALL TO authenticated
    USING (current_admin_role() = 'owner');

CREATE POLICY p_audit_logs_read ON audit_logs
    FOR SELECT TO authenticated
    USING (current_admin_role() = 'owner');
