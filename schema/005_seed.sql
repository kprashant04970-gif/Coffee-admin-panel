-- ============================================================================
-- MANHATTAN COFFEE VENDING NETWORK — DATABASE SEED DATA
-- File: schema/005_seed.sql
-- Engines: PostgreSQL 15+ / Supabase
-- Populates baseline fleet telemetry, products, active batch tanks,
-- test users, and the live dispute desk records.
-- ============================================================================

-- 1. Roles
INSERT INTO admin_roles (role, label, permissions) VALUES
('owner', 'Chief Owner (Full Root)', '{"all": true}'::jsonb),
('ops', 'Operations Lead', '{"machines": "write", "tanks": "write", "stock": "write"}'::jsonb),
('support', 'Support Desk Agent', '{"tickets": "write", "customers": "read", "orders": "read"}'::jsonb),
('finance', 'Finance & Accounts', '{"wallets": "write", "refunds": "write", "margins": "read"}'::jsonb),
('marketing', 'Growth & Campaigns', '{"coupons": "write", "banners": "write", "push": "write"}'::jsonb),
('viewer', 'Read-Only Viewer', '{"read_only": true}'::jsonb)
ON CONFLICT (role) DO NOTHING;

-- 2. Admin Users
INSERT INTO admin_users (email, phone, full_name, role) VALUES
('pk9410548@gmail.com', '+91 98200 11999', 'Chief Rohan', 'owner'),
('suresh.ops@manhattancoffee.in', '+91 98201 22881', 'Suresh K.', 'ops'),
('imran.support@manhattancoffee.in', '+91 98332 44991', 'Imran S.', 'support')
ON CONFLICT (email) DO NOTHING;

-- 3. Products
INSERT INTO products (id, name, short_name, price, cost_basis, emoji) VALUES
('V1', 'Manhattan Velvet Cappuccino', 'Manhattan Velvet', 50.00, 18.20, '👑'),
('V2', 'Classic Café Latte', 'Classic Latte', 20.00, 8.50, '☕'),
('V3', 'Grande Roast', 'Grande Roast', 30.00, 11.00, '🔥'),
('V4', 'Chilled Manhattan Frappe', 'Chilled Frappe', 45.00, 16.00, '🧊')
ON CONFLICT (id) DO NOTHING;

-- 4. Machines
INSERT INTO machines (id, code, name, city, location, status, mode, temp, target_temp, milk_liters, max_milk_liters, cups_count, signal_dbm) VALUES
('MCH-001', 'MCH-001', 'Campus Hub', 'Mumbai', 'IIT Campus, Cafeteria Quad A', 'ONLINE', 'HOT', 65.40, 66.00, 38.00, 45.00, 142, -68),
('MCH-002', 'MCH-002', 'Mall Lane', 'Mumbai', 'Phoenix Palladium, Ground Concourse', 'ONLINE', 'COLD', 6.20, 6.00, 21.00, 45.00, 88, -74),
('MCH-003', 'MCH-003', 'Tech Park Central', 'Pune', 'CyberCity Wing 4, Lobby B', 'ONLINE', 'HOT', 63.80, 65.00, 42.00, 45.00, 195, -62)
ON CONFLICT (id) DO NOTHING;

-- 5. Milk Batch Tanks (FSSAI)
INSERT INTO machine_tanks (id, machine_id, tank_uid, liters, max_liters, filled_at, expires_at, status) VALUES
('TNK-901', 'MCH-001', 'FSSAI-MH-2026-901', 38.00, 45.00, NOW() - INTERVAL '6 hours', NOW() + INTERVAL '12 hours', 'ACTIVE'),
('TNK-884', 'MCH-002', 'FSSAI-MH-2026-884', 21.00, 45.00, NOW() - INTERVAL '8 hours', NOW() + INTERVAL '10 hours', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 6. Customers
INSERT INTO users (id, phone, full_name, avatar_initials, city, college_or_work, segment) VALUES
('CUS-401', '+91 98201 44820', 'Aman Sharma', 'AS', 'Mumbai', 'IIT Bombay, Dept of CS', 'High Value'),
('CUS-402', '+91 97112 99014', 'Pooja Iyer', 'PI', 'Mumbai', 'Powai Tech Park', 'Active Today'),
('CUS-403', '+91 98334 11209', 'Vikram Seth', 'VS', 'Mumbai', 'Morgan Stanley', 'Active Today')
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_stats (user_id, orders_count, total_spend, current_streak, longest_streak, favorite_variant) VALUES
('CUS-401', 38, 1780.00, 12, 21, 'Manhattan Velvet Cappuccino'),
('CUS-402', 22, 840.00, 5, 14, 'Classic Café Latte'),
('CUS-403', 17, 720.00, 3, 9, 'Chilled Manhattan Frappe')
ON CONFLICT (user_id) DO NOTHING;

-- 7. Orders & Dispense Logs
INSERT INTO orders (id, order_no, machine_id, machine_name, variant, amount, net_amount, cost_basis, payment_method, status, is_flagged, utr, buyer_id, buyer_name, buyer_phone, tank_uid) VALUES
('ORD-9842', '#ORD-9842', 'MCH-001', 'Campus Hub', 'Manhattan Velvet Cappuccino', 50.00, 50.00, 18.20, 'UPI', 'Completed', TRUE, 'UPI/20261001/9842011245', 'CUS-401', 'Aman Sharma', '+91 98201 44820', 'FSSAI-MH-2026-901'),
('ORD-9841', '#ORD-9841', 'MCH-001', 'Campus Hub', 'Classic Café Latte', 20.00, 20.00, 8.50, 'Wallet', 'Completed', FALSE, 'WLT/88392110', 'CUS-402', 'Pooja Iyer', '+91 97112 99014', 'FSSAI-MH-2026-901')
ON CONFLICT (id) DO NOTHING;

INSERT INTO dispense_logs (order_id, valve_open_ms, flow_pulses, expected_ml, dispensed_ml, variance_pct, cup_detected, kit_dropped, pickup_detected) VALUES
('ORD-9842', 2100, 14, 180, 147, 18.33, TRUE, TRUE, FALSE),
('ORD-9841', 2500, 18, 180, 178, 1.11, TRUE, TRUE, TRUE)
ON CONFLICT (order_id) DO NOTHING;

-- 8. Support Tickets
INSERT INTO support_tickets (id, ticket_no, order_id, order_no, customer_id, customer_name, customer_phone, machine_id, machine_name, amount, utr, reason, reason_label, status, priority, sla_deadline, channel, customer_message, dispense_variance) VALUES
('TKT-8902', 'TKT-8902', 'ORD-9842', '#ORD-9842', 'CUS-401', 'Aman Sharma', '+91 98201 44820', 'MCH-001', 'Campus Hub', 50.00, 'UPI/20261001/9842011245', 'cup_stuck', 'Cup stuck in chute & incomplete pour', 'OPEN', 'HIGH', NOW() + INTERVAL '4 minutes', 'Bot', 'I scanned the QR code, cup got stuck slightly tilted and only half coffee poured.', 18.33)
ON CONFLICT (id) DO NOTHING;

-- 9. Coupons
INSERT INTO coupons (id, code, title, type, value, min_order, usage_count, max_usage, budget_cap, budget_burned, status, expires_at) VALUES
('CPN-1', 'CAMPUSLOVE', 'Student Welcome ₹15 Off', 'FLAT', 15.00, 30.00, 142, 500, 7500.00, 2130.00, 'ACTIVE', NOW() + INTERVAL '14 days'),
('CPN-2', 'VELVET20', 'Manhattan Velvet 20% Special', 'PERCENT', 20.00, 40.00, 88, 300, 3000.00, 880.00, 'ACTIVE', NOW() + INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;
