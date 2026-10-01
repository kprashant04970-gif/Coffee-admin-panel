-- ============================================================================
-- MANHATTAN COFFEE VENDING NETWORK — DATABASE STORED PROCEDURES & RPCs
-- File: schema/002_functions.sql
-- Engines: PostgreSQL 15+ / Supabase RPC
-- Includes the Dispute Desk Single-Payload Hydration Function,
-- Atomic Wallet Credit, and Emergency Hardware Interlocks.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. fn_ticket_evidence_bundle
-- Atomically returns the complete evidence bundle for the Dispute Desk:
-- Ticket + Order + Dispense Log + Synced Video Clips + Tank State + Health Window
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_ticket_evidence_bundle(p_ticket_id VARCHAR)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSONB;
    v_ticket RECORD;
    v_order RECORD;
    v_dispense RECORD;
    v_tank RECORD;
    v_health JSONB;
    v_clips JSONB;
    v_customer JSONB;
BEGIN
    -- 1. Fetch Ticket
    SELECT * INTO v_ticket FROM support_tickets WHERE id = p_ticket_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Ticket % not found', p_ticket_id;
    END IF;

    -- 2. Fetch Order
    SELECT * INTO v_order FROM orders WHERE id = v_ticket.order_id;

    -- 3. Fetch Dispense Log (Ground truth telemetry)
    SELECT * INTO v_dispense FROM dispense_logs WHERE order_id = v_order.id;

    -- 4. Fetch Tank at pour time
    SELECT * INTO v_tank FROM machine_tanks 
    WHERE machine_id = v_order.machine_id AND status = 'ACTIVE' 
    LIMIT 1;

    -- 5. Fetch Machine Health Logs in ±10 minutes window
    SELECT COALESCE(jsonb_agg(to_jsonb(h)), '[]'::jsonb) INTO v_health
    FROM machine_health_logs h
    WHERE h.machine_id = v_order.machine_id
      AND h.occurred_at BETWEEN (v_order.ordered_at - INTERVAL '10 minutes')
                            AND (v_order.ordered_at + INTERVAL '10 minutes');

    -- 6. Fetch Synchronized Video Clips
    SELECT COALESCE(jsonb_agg(to_jsonb(vc)), '[]'::jsonb) INTO v_clips
    FROM video_clips vc
    WHERE vc.machine_id = v_order.machine_id
      AND (vc.order_id = v_order.id OR vc.ticket_id = p_ticket_id);

    -- 7. Fetch Customer 360 Context & Last 5 Orders
    SELECT jsonb_build_object(
        'profile', to_jsonb(u),
        'stats', to_jsonb(s),
        'recent_orders', (
            SELECT COALESCE(jsonb_agg(to_jsonb(ro)), '[]'::jsonb)
            FROM (
                SELECT id, order_no, variant, net_amount, status, ordered_at
                FROM orders
                WHERE buyer_id = v_ticket.customer_id
                ORDER BY ordered_at DESC
                LIMIT 5
            ) ro
        )
    ) INTO v_customer
    FROM users u
    LEFT JOIN user_stats s ON s.user_id = u.id
    WHERE u.id = v_ticket.customer_id;

    -- Assemble unified atomic response payload
    v_result := jsonb_build_object(
        'ticket', to_jsonb(v_ticket),
        'order', to_jsonb(v_order),
        'dispense_log', to_jsonb(v_dispense),
        'tank_at_pour', to_jsonb(v_tank),
        'health_window_10m', v_health,
        'video_clips', v_clips,
        'customer_context', v_customer,
        'variance_warning', (COALESCE(v_dispense.variance_pct, 0.0) > 15.0)
    );

    RETURN v_result;
END;
$$;

-- ----------------------------------------------------------------------------
-- 2. fn_wallet_credit
-- Atomically credits a customer wallet, records transaction, and updates float
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_wallet_credit(
    p_user_id VARCHAR,
    p_amount DECIMAL,
    p_description TEXT,
    p_reference_id VARCHAR DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_wallet_id UUID;
    v_old_bal DECIMAL(10, 2);
    v_new_bal DECIMAL(10, 2);
    v_tx_id UUID;
BEGIN
    -- Lock wallet row
    SELECT id, balance INTO v_wallet_id, v_old_bal
    FROM wallets
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Wallet for customer % does not exist', p_user_id;
    END IF;

    v_new_bal := v_old_bal + p_amount;

    UPDATE wallets
    SET balance = v_new_bal, updated_at = NOW()
    WHERE id = v_wallet_id;

    INSERT INTO wallet_transactions (
        wallet_id, user_id, type, amount, balance_after, description, reference_id
    ) VALUES (
        v_wallet_id, p_user_id, 'CREDIT', p_amount, v_new_bal, p_description, p_reference_id
    ) RETURNING id INTO v_tx_id;

    RETURN jsonb_build_object(
        'success', TRUE,
        'transaction_id', v_tx_id,
        'previous_balance', v_old_bal,
        'new_balance', v_new_bal
    );
END;
$$;

-- ----------------------------------------------------------------------------
-- 3. fn_resolve_dispute
-- Takes official verdict on Dispute Desk: Updates ticket, initiates refund
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_resolve_dispute(
    p_ticket_id VARCHAR,
    p_verdict VARCHAR, -- 'APPROVE_REFUND', 'REJECT', 'ESCALATE'
    p_resolution_note TEXT,
    p_admin_name VARCHAR
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_ticket RECORD;
    v_order RECORD;
    v_target_status ticket_status;
BEGIN
    SELECT * INTO v_ticket FROM support_tickets WHERE id = p_ticket_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Ticket % not found', p_ticket_id;
    END IF;

    IF p_verdict = 'APPROVE_REFUND' THEN
        v_target_status := 'RESOLVED_REFUND';
        -- Update order status to Cancelled
        UPDATE orders SET status = 'Cancelled' WHERE id = v_ticket.order_id;
        -- Create pending refund
        INSERT INTO refunds (ticket_id, order_id, amount, destination, status)
        VALUES (v_ticket.id, v_ticket.order_id, v_ticket.amount, 'UPI_SOURCE', 'PENDING');
    ELSIF p_verdict = 'REJECT' THEN
        v_target_status := 'RESOLVED_REJECTED';
    ELSE
        v_target_status := 'ESCALATED';
    END IF;

    -- Update Ticket
    UPDATE support_tickets
    SET status = v_target_status,
        resolution = p_resolution_note,
        resolved_at = NOW(),
        resolved_by = p_admin_name
    WHERE id = p_ticket_id;

    -- Append status history
    INSERT INTO ticket_status_history (ticket_id, from_status, to_status, changed_by, note)
    VALUES (p_ticket_id, v_ticket.status, v_target_status, p_admin_name, p_resolution_note);

    RETURN jsonb_build_object(
        'success', TRUE,
        'ticket_id', p_ticket_id,
        'status', v_target_status,
        'resolved_at', NOW()
    );
END;
$$;
