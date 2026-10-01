/**
 * Manhattan Coffee Vending Network — Supabase / PostgreSQL Database Types
 * File: types/database.ts
 *
 * Full TypeScript definition corresponding to ALL 68 DATABASE TABLES
 * in `schema/001_full_schema.sql` and stored procedures in `schema/002_functions.sql`.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type MachineStatus = 'ONLINE' | 'OFFLINE' | 'WARNING';
export type MachineMode = 'HOT' | 'COLD';
export type TankStatus = 'ACTIVE' | 'EXPIRED' | 'DISPOSED' | 'RESERVE';
export type OrderStatus = 'Completed' | 'Preparing' | 'Pending' | 'Cancelled';
export type PaymentMethod = 'UPI' | 'Wallet' | 'Cash' | 'Coins';
export type TicketStatus = 'OPEN' | 'CLAIMED' | 'RESOLVED_REFUND' | 'RESOLVED_REJECTED' | 'ESCALATED';
export type TicketPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type UserRole = 'owner' | 'ops' | 'support' | 'finance' | 'marketing' | 'viewer';

export interface Database {
  public: {
    Tables: {
      // 1. admin_roles
      admin_roles: {
        Row: { id: string; role: UserRole; label: string; permissions: Json; created_at: string };
        Insert: { id?: string; role: UserRole; label: string; permissions?: Json; created_at?: string };
        Update: { id?: string; role?: UserRole; label?: string; permissions?: Json; created_at?: string };
      };
      // 2. admin_users
      admin_users: {
        Row: { id: string; email: string; phone: string; full_name: string; role: UserRole; mfa_enabled: boolean; mfa_secret: string | null; is_suspended: boolean; last_login_at: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; email: string; phone: string; full_name: string; role: UserRole; mfa_enabled?: boolean; mfa_secret?: string | null; is_suspended?: boolean; last_login_at?: string | null; created_at?: string; updated_at?: string };
        Update: { id?: string; email?: string; phone?: string; full_name?: string; role?: UserRole; mfa_enabled?: boolean; mfa_secret?: string | null; is_suspended?: boolean; last_login_at?: string | null; created_at?: string; updated_at?: string };
      };
      // 3. admin_sessions
      admin_sessions: {
        Row: { id: string; admin_id: string; token_hash: string; user_agent: string | null; ip_address: string | null; expires_at: string; created_at: string };
        Insert: { id?: string; admin_id: string; token_hash: string; user_agent?: string | null; ip_address?: string | null; expires_at: string; created_at?: string };
        Update: { id?: string; admin_id?: string; token_hash?: string; user_agent?: string | null; ip_address?: string | null; expires_at?: string; created_at?: string };
      };
      // 4. audit_logs
      audit_logs: {
        Row: { id: string; admin_id: string | null; admin_name: string; role: UserRole; action: string; target: string; details: string; before_state: Json | null; after_state: Json | null; ip_address: string | null; created_at: string };
        Insert: { id?: string; admin_id?: string | null; admin_name: string; role: UserRole; action: string; target: string; details: string; before_state?: Json | null; after_state?: Json | null; ip_address?: string | null; created_at?: string };
        Update: { id?: string; admin_id?: string | null; admin_name?: string; role?: UserRole; action?: string; target?: string; details?: string; before_state?: Json | null; after_state?: Json | null; ip_address?: string | null; created_at?: string };
      };
      // 5. app_config
      app_config: {
        Row: { id: string; key_name: string; value: Json; is_sensitive: boolean; updated_by: string | null; updated_at: string };
        Insert: { id: string; key_name: string; value: Json; is_sensitive?: boolean; updated_by?: string | null; updated_at?: string };
        Update: { id?: string; key_name?: string; value?: Json; is_sensitive?: boolean; updated_by?: string | null; updated_at?: string };
      };
      // 6. secret_rotations
      secret_rotations: {
        Row: { id: string; secret_name: string; version: number; checksum: string; rotated_by: string | null; rotated_at: string };
        Insert: { id?: string; secret_name: string; version?: number; checksum: string; rotated_by?: string | null; rotated_at?: string };
        Update: { id?: string; secret_name?: string; version?: number; checksum?: string; rotated_by?: string | null; rotated_at?: string };
      };
      // 7. api_keys
      api_keys: {
        Row: { id: string; name: string; key_prefix: string; key_hash: string; scopes: Json; is_active: boolean; created_by: string | null; created_at: string };
        Insert: { id?: string; name: string; key_prefix: string; key_hash: string; scopes?: Json; is_active?: boolean; created_by?: string | null; created_at?: string };
        Update: { id?: string; name?: string; key_prefix?: string; key_hash?: string; scopes?: Json; is_active?: boolean; created_by?: string | null; created_at?: string };
      };

      // 8. machines
      machines: {
        Row: { id: string; code: string; name: string; city: string; location: string; latitude: number | null; longitude: number | null; status: MachineStatus; mode: MachineMode; temp: number; target_temp: number; milk_liters: number; max_milk_liters: number; cups_count: number; max_cups: number; kits_count: number; signal_dbm: number; is_locked: boolean; sd_card_free_mb: number; firmware_version: string; firmware_checksum: string; boot_count: number; wdt_resets: number; last_ping_at: string; created_at: string; updated_at: string };
        Insert: { id: string; code: string; name: string; city: string; location: string; latitude?: number | null; longitude?: number | null; status?: MachineStatus; mode?: MachineMode; temp?: number; target_temp?: number; milk_liters?: number; max_milk_liters?: number; cups_count?: number; max_cups?: number; kits_count?: number; signal_dbm?: number; is_locked?: boolean; sd_card_free_mb?: number; firmware_version?: string; firmware_checksum?: string; boot_count?: number; wdt_resets?: number; last_ping_at?: string; created_at?: string; updated_at?: string };
        Update: { id?: string; code?: string; name?: string; city?: string; location?: string; latitude?: number | null; longitude?: number | null; status?: MachineStatus; mode?: MachineMode; temp?: number; target_temp?: number; milk_liters?: number; max_milk_liters?: number; cups_count?: number; max_cups?: number; kits_count?: number; signal_dbm?: number; is_locked?: boolean; sd_card_free_mb?: number; firmware_version?: string; firmware_checksum?: string; boot_count?: number; wdt_resets?: number; last_ping_at?: string; created_at?: string; updated_at?: string };
      };
      // 9. machine_telemetry
      machine_telemetry: {
        Row: { id: number; machine_id: string; boiler_temp: number; milk_liters: number; signal_dbm: number; voltage_mv: number | null; recorded_at: string };
        Insert: { id?: number; machine_id: string; boiler_temp: number; milk_liters: number; signal_dbm: number; voltage_mv?: number | null; recorded_at?: string };
        Update: { id?: number; machine_id?: string; boiler_temp?: number; milk_liters?: number; signal_dbm?: number; voltage_mv?: number | null; recorded_at?: string };
      };
      // 10. machine_health_logs
      machine_health_logs: {
        Row: { id: string; machine_id: string; fault_code: string; severity: string; description: string; is_resolved: boolean; resolved_at: string | null; occurred_at: string };
        Insert: { id?: string; machine_id: string; fault_code: string; severity: string; description: string; is_resolved?: boolean; resolved_at?: string | null; occurred_at?: string };
        Update: { id?: string; machine_id?: string; fault_code?: string; severity?: string; description?: string; is_resolved?: boolean; resolved_at?: string | null; occurred_at?: string };
      };
      // 11. machine_firmware_versions
      machine_firmware_versions: {
        Row: { id: string; version_tag: string; binary_url: string; sha256_checksum: string; changelog: string | null; is_stable: boolean; released_at: string };
        Insert: { id?: string; version_tag: string; binary_url: string; sha256_checksum: string; changelog?: string | null; is_stable?: boolean; released_at?: string };
        Update: { id?: string; version_tag?: string; binary_url?: string; sha256_checksum?: string; changelog?: string | null; is_stable?: boolean; released_at?: string };
      };
      // 12. machine_commands
      machine_commands: {
        Row: { id: string; machine_id: string; command_name: string; payload: Json; status: string; result_json: Json | null; requested_by: string | null; sent_at: string; executed_at: string | null };
        Insert: { id?: string; machine_id: string; command_name: string; payload?: Json; status?: string; result_json?: Json | null; requested_by?: string | null; sent_at?: string; executed_at?: string | null };
        Update: { id?: string; machine_id?: string; command_name?: string; payload?: Json; status?: string; result_json?: Json | null; requested_by?: string | null; sent_at?: string; executed_at?: string | null };
      };
      // 13. machine_maintenance_logs
      machine_maintenance_logs: {
        Row: { id: string; machine_id: string; technician_name: string; task_title: string; details: string; duration_mins: number | null; performed_at: string };
        Insert: { id?: string; machine_id: string; technician_name: string; task_title: string; details: string; duration_mins?: number | null; performed_at?: string };
        Update: { id?: string; machine_id?: string; technician_name?: string; task_title?: string; details?: string; duration_mins?: number | null; performed_at?: string };
      };
      // 14. machine_cleaning_cycles
      machine_cleaning_cycles: {
        Row: { id: string; machine_id: string; cycle_type: string; water_volume_ml: number; chemical_used: string | null; performed_at: string };
        Insert: { id?: string; machine_id: string; cycle_type: string; water_volume_ml?: number; chemical_used?: string | null; performed_at?: string };
        Update: { id?: string; machine_id?: string; cycle_type?: string; water_volume_ml?: number; chemical_used?: string | null; performed_at?: string };
      };
      // 15. machine_power_events
      machine_power_events: {
        Row: { id: string; machine_id: string; event_type: string; voltage: number | null; event_time: string };
        Insert: { id?: string; machine_id: string; event_type: string; voltage?: number | null; event_time?: string };
        Update: { id?: string; machine_id?: string; event_type?: string; voltage?: number | null; event_time?: string };
      };
      // 16. machine_sensors
      machine_sensors: {
        Row: { id: string; machine_id: string; sensor_name: string; sensor_type: string; calibration_offset: number; last_calibrated_at: string };
        Insert: { id?: string; machine_id: string; sensor_name: string; sensor_type: string; calibration_offset?: number; last_calibrated_at?: string };
        Update: { id?: string; machine_id?: string; sensor_name?: string; sensor_type?: string; calibration_offset?: number; last_calibrated_at?: string };
      };
      // 17. cameras
      cameras: {
        Row: { id: string; machine_id: string; channel_no: number; stream_url: string | null; is_online: boolean; last_frame_at: string | null };
        Insert: { id?: string; machine_id: string; channel_no: number; stream_url?: string | null; is_online?: boolean; last_frame_at?: string | null };
        Update: { id?: string; machine_id?: string; channel_no?: number; stream_url?: string | null; is_online?: boolean; last_frame_at?: string | null };
      };
      // 18. video_clips
      video_clips: {
        Row: { id: string; machine_id: string; camera_channel: number; order_id: string | null; ticket_id: string | null; clip_url: string; duration_secs: number; start_time: string; end_time: string; expires_at: string; created_at: string };
        Insert: { id?: string; machine_id: string; camera_channel: number; order_id?: string | null; ticket_id?: string | null; clip_url: string; duration_secs?: number; start_time: string; end_time: string; expires_at: string; created_at?: string };
        Update: { id?: string; machine_id?: string; camera_channel?: number; order_id?: string | null; ticket_id?: string | null; clip_url?: string; duration_secs?: number; start_time?: string; end_time?: string; expires_at?: string; created_at?: string };
      };

      // 19. machine_tanks
      machine_tanks: {
        Row: { id: string; machine_id: string; tank_uid: string; liters: number; max_liters: number; filled_at: string; expires_at: string; status: TankStatus; disposal_reason: string | null; created_at: string };
        Insert: { id: string; machine_id: string; tank_uid: string; liters: number; max_liters?: number; filled_at: string; expires_at: string; status?: TankStatus; disposal_reason?: string | null; created_at?: string };
        Update: { id?: string; machine_id?: string; tank_uid?: string; liters?: number; max_liters?: number; filled_at?: string; expires_at?: string; status?: TankStatus; disposal_reason?: string | null; created_at?: string };
      };
      // 20. machine_tank_events
      machine_tank_events: {
        Row: { id: string; tank_id: string; machine_id: string; technician_id: string | null; event_type: string; notes: string | null; event_time: string };
        Insert: { id?: string; tank_id: string; machine_id: string; technician_id?: string | null; event_type: string; notes?: string | null; event_time?: string };
        Update: { id?: string; tank_id?: string; machine_id?: string; technician_id?: string | null; event_type?: string; notes?: string | null; event_time?: string };
      };
      // 21. machine_stock
      machine_stock: {
        Row: { id: string; machine_id: string; variant_name: string; quantity: number; max_capacity: number; reorder_threshold: number; last_refill_at: string | null; last_refill_by: string | null };
        Insert: { id?: string; machine_id: string; variant_name: string; quantity?: number; max_capacity?: number; reorder_threshold?: number; last_refill_at?: string | null; last_refill_by?: string | null };
        Update: { id?: string; machine_id?: string; variant_name?: string; quantity?: number; max_capacity?: number; reorder_threshold?: number; last_refill_at?: string | null; last_refill_by?: string | null };
      };
      // 22. machine_stock_events
      machine_stock_events: {
        Row: { id: string; machine_id: string; variant_name: string; delta_qty: number; reason: string; technician_name: string | null; logged_at: string };
        Insert: { id?: string; machine_id: string; variant_name: string; delta_qty: number; reason: string; technician_name?: string | null; logged_at?: string };
        Update: { id?: string; machine_id?: string; variant_name?: string; delta_qty?: number; reason?: string; technician_name?: string | null; logged_at?: string };
      };
      // 23. raw_materials
      raw_materials: {
        Row: { id: string; name: string; unit: string; reorder_level: number; unit_cost: number };
        Insert: { id: string; name: string; unit: string; reorder_level: number; unit_cost: number };
        Update: { id?: string; name?: string; unit?: string; reorder_level?: number; unit_cost?: number };
      };
      // 24. warehouse_inventory
      warehouse_inventory: {
        Row: { id: string; raw_material_id: string; batch_no: string; quantity: number; expires_at: string | null; received_at: string };
        Insert: { id?: string; raw_material_id: string; batch_no: string; quantity: number; expires_at?: string | null; received_at?: string };
        Update: { id?: string; raw_material_id?: string; batch_no?: string; quantity?: number; expires_at?: string | null; received_at?: string };
      };
      // 25. supplier_orders
      supplier_orders: {
        Row: { id: string; supplier_name: string; status: string; total_amount: number; ordered_at: string };
        Insert: { id: string; supplier_name: string; status?: string; total_amount: number; ordered_at?: string };
        Update: { id?: string; supplier_name?: string; status?: string; total_amount?: number; ordered_at?: string };
      };
      // 26. supplier_order_items
      supplier_order_items: {
        Row: { id: string; supplier_order_id: string; raw_material_id: string; quantity: number; unit_price: number };
        Insert: { id?: string; supplier_order_id: string; raw_material_id: string; quantity: number; unit_price: number };
        Update: { id?: string; supplier_order_id?: string; raw_material_id?: string; quantity?: number; unit_price?: number };
      };
      // 27. stock_waste_logs
      stock_waste_logs: {
        Row: { id: string; machine_id: string | null; item_name: string; quantity: number; waste_reason: string; recorded_by: string; recorded_at: string };
        Insert: { id?: string; machine_id?: string | null; item_name: string; quantity: number; waste_reason: string; recorded_by: string; recorded_at?: string };
        Update: { id?: string; machine_id?: string | null; item_name?: string; quantity?: number; waste_reason?: string; recorded_by?: string; recorded_at?: string };
      };

      // 28. products
      products: {
        Row: { id: string; name: string; short_name: string; price: number; cost_basis: number; is_active: boolean; emoji: string | null };
        Insert: { id: string; name: string; short_name: string; price: number; cost_basis: number; is_active?: boolean; emoji?: string | null };
        Update: { id?: string; name?: string; short_name?: string; price?: number; cost_basis?: number; is_active?: boolean; emoji?: string | null };
      };
      // 29. product_variants
      product_variants: {
        Row: { id: string; product_id: string; variant_label: string; sugar_default: number; milk_ml: number; price_delta: number };
        Insert: { id: string; product_id: string; variant_label: string; sugar_default?: number; milk_ml?: number; price_delta?: number };
        Update: { id?: string; product_id?: string; variant_label?: string; sugar_default?: number; milk_ml?: number; price_delta?: number };
      };
      // 30. kit_templates
      kit_templates: {
        Row: { id: string; product_id: string; name: string; powder_weight_g: number; sugar_sachets: number; stirrer_included: boolean; cup_size: string };
        Insert: { id?: string; product_id: string; name: string; powder_weight_g: number; sugar_sachets?: number; stirrer_included?: boolean; cup_size?: string };
        Update: { id?: string; product_id?: string; name?: string; powder_weight_g?: number; sugar_sachets?: number; stirrer_included?: boolean; cup_size?: string };
      };
      // 31. kit_components
      kit_components: {
        Row: { id: string; kit_template_id: string; component_name: string; quantity: number };
        Insert: { id?: string; kit_template_id: string; component_name: string; quantity?: number };
        Update: { id?: string; kit_template_id?: string; component_name?: string; quantity?: number };
      };

      // 32. users
      users: {
        Row: { id: string; phone: string; full_name: string; avatar_initials: string; city: string; college_or_work: string | null; segment: string; is_blocked: boolean; created_at: string; updated_at: string };
        Insert: { id: string; phone: string; full_name: string; avatar_initials: string; city: string; college_or_work?: string | null; segment?: string; is_blocked?: boolean; created_at?: string; updated_at?: string };
        Update: { id?: string; phone?: string; full_name?: string; avatar_initials?: string; city?: string; college_or_work?: string | null; segment?: string; is_blocked?: boolean; created_at?: string; updated_at?: string };
      };
      // 33. user_profiles
      user_profiles: {
        Row: { user_id: string; age_band: string | null; preferred_drink: string | null; notification_token: string | null; fcm_registered_at: string | null };
        Insert: { user_id: string; age_band?: string | null; preferred_drink?: string | null; notification_token?: string | null; fcm_registered_at?: string | null };
        Update: { user_id?: string; age_band?: string | null; preferred_drink?: string | null; notification_token?: string | null; fcm_registered_at?: string | null };
      };
      // 34. user_stats
      user_stats: {
        Row: { user_id: string; orders_count: number; total_spend: number; current_streak: number; longest_streak: number; favorite_variant: string | null; last_order_at: string | null };
        Insert: { user_id: string; orders_count?: number; total_spend?: number; current_streak?: number; longest_streak?: number; favorite_variant?: string | null; last_order_at?: string | null };
        Update: { user_id?: string; orders_count?: number; total_spend?: number; current_streak?: number; longest_streak?: number; favorite_variant?: string | null; last_order_at?: string | null };
      };
      // 35. user_consents
      user_consents: {
        Row: { id: string; user_id: string; leaderboard_opt_in: boolean; public_handle_opt_in: boolean; consent_version: string; consented_at: string };
        Insert: { id?: string; user_id: string; leaderboard_opt_in?: boolean; public_handle_opt_in?: boolean; consent_version?: string; consented_at?: string };
        Update: { id?: string; user_id?: string; leaderboard_opt_in?: boolean; public_handle_opt_in?: boolean; consent_version?: string; consented_at?: string };
      };
      // 36. customer_notes
      customer_notes: {
        Row: { id: string; customer_id: string; author_name: string; note_content: string; created_at: string };
        Insert: { id?: string; customer_id: string; author_name: string; note_content: string; created_at?: string };
        Update: { id?: string; customer_id?: string; author_name?: string; note_content?: string; created_at?: string };
      };
      // 37. loyalty_tiers
      loyalty_tiers: {
        Row: { id: string; name: string; min_cups: number; discount_pct: number; perks: Json };
        Insert: { id: string; name: string; min_cups: number; discount_pct?: number; perks?: Json };
        Update: { id?: string; name?: string; min_cups?: number; discount_pct?: number; perks?: Json };
      };
      // 38. wallets
      wallets: {
        Row: { id: string; user_id: string; balance: number; coin_balance: number; currency: string; updated_at: string };
        Insert: { id?: string; user_id: string; balance?: number; coin_balance?: number; currency?: string; updated_at?: string };
        Update: { id?: string; user_id?: string; balance?: number; coin_balance?: number; currency?: string; updated_at?: string };
      };
      // 39. wallet_transactions
      wallet_transactions: {
        Row: { id: string; wallet_id: string; user_id: string; type: 'CREDIT' | 'DEBIT'; amount: number; balance_after: number; description: string; reference_id: string | null; created_at: string };
        Insert: { id?: string; wallet_id: string; user_id: string; type: 'CREDIT' | 'DEBIT'; amount: number; balance_after: number; description: string; reference_id?: string | null; created_at?: string };
        Update: { id?: string; wallet_id?: string; user_id?: string; type?: 'CREDIT' | 'DEBIT'; amount?: number; balance_after?: number; description?: string; reference_id?: string | null; created_at?: string };
      };
      // 40. referrals
      referrals: {
        Row: { id: string; referrer_id: string; referred_id: string; reward_amount: number; is_claimed: boolean; created_at: string };
        Insert: { id?: string; referrer_id: string; referred_id: string; reward_amount?: number; is_claimed?: boolean; created_at?: string };
        Update: { id?: string; referrer_id?: string; referred_id?: string; reward_amount?: number; is_claimed?: boolean; created_at?: string };
      };
      // 41. gifts
      gifts: {
        Row: { id: string; sender_id: string; recipient_phone: string; product_id: string | null; status: string; redeemed_at: string | null; created_at: string };
        Insert: { id?: string; sender_id: string; recipient_phone: string; product_id?: string | null; status?: string; redeemed_at?: string | null; created_at?: string };
        Update: { id?: string; sender_id?: string; recipient_phone?: string; product_id?: string | null; status?: string; redeemed_at?: string | null; created_at?: string };
      };

      // 42. orders
      orders: {
        Row: { id: string; order_no: string; machine_id: string; machine_name: string; product_id: string | null; variant: string; amount: number; discount: number; net_amount: number; cost_basis: number; payment_method: PaymentMethod; status: OrderStatus; is_flagged: boolean; utr: string | null; buyer_id: string | null; buyer_name: string; buyer_phone: string; tank_uid: string | null; ordered_at: string };
        Insert: { id: string; order_no: string; machine_id: string; machine_name: string; product_id?: string | null; variant: string; amount: number; discount?: number; net_amount: number; cost_basis: number; payment_method: PaymentMethod; status?: OrderStatus; is_flagged?: boolean; utr?: string | null; buyer_id?: string | null; buyer_name: string; buyer_phone: string; tank_uid?: string | null; ordered_at?: string };
        Update: { id?: string; order_no?: string; machine_id?: string; machine_name?: string; product_id?: string | null; variant?: string; amount?: number; discount?: number; net_amount?: number; cost_basis?: number; payment_method?: PaymentMethod; status?: OrderStatus; is_flagged?: boolean; utr?: string | null; buyer_id?: string | null; buyer_name?: string; buyer_phone?: string; tank_uid?: string | null; ordered_at?: string };
      };
      // 43. order_items
      order_items: {
        Row: { id: string; order_id: string; product_id: string | null; quantity: number; unit_price: number; total_price: number };
        Insert: { id?: string; order_id: string; product_id?: string | null; quantity?: number; unit_price: number; total_price: number };
        Update: { id?: string; order_id?: string; product_id?: string | null; quantity?: number; unit_price?: number; total_price?: number };
      };
      // 44. payment_transactions
      payment_transactions: {
        Row: { id: string; order_id: string; gateway: string; gateway_payment_id: string | null; amount: number; currency: string; status: string; response_payload: Json | null; created_at: string };
        Insert: { id?: string; order_id: string; gateway: string; gateway_payment_id?: string | null; amount: number; currency?: string; status?: string; response_payload?: Json | null; created_at?: string };
        Update: { id?: string; order_id?: string; gateway?: string; gateway_payment_id?: string | null; amount?: number; currency?: string; status?: string; response_payload?: Json | null; created_at?: string };
      };
      // 45. dispense_logs
      dispense_logs: {
        Row: { id: string; order_id: string; valve_open_ms: number; flow_pulses: number; expected_ml: number; dispensed_ml: number; variance_pct: number; cup_detected: boolean; kit_dropped: boolean; malai_pump_ms: number | null; conveyor_steps: number | null; window_opened: boolean; pickup_detected: boolean; logged_at: string };
        Insert: { id?: string; order_id: string; valve_open_ms: number; flow_pulses: number; expected_ml: number; dispensed_ml: number; variance_pct: number; cup_detected?: boolean; kit_dropped?: boolean; malai_pump_ms?: number | null; conveyor_steps?: number | null; window_opened?: boolean; pickup_detected?: boolean; logged_at?: string };
        Update: { id?: string; order_id?: string; valve_open_ms?: number; flow_pulses?: number; expected_ml?: number; dispensed_ml?: number; variance_pct?: number; cup_detected?: boolean; kit_dropped?: boolean; malai_pump_ms?: number | null; conveyor_steps?: number | null; window_opened?: boolean; pickup_detected?: boolean; logged_at?: string };
      };
      // 46. invoice_receipts
      invoice_receipts: {
        Row: { id: string; order_id: string; invoice_no: string; gstin: string | null; tax_amount: number; pdf_url: string | null; issued_at: string };
        Insert: { id?: string; order_id: string; invoice_no: string; gstin?: string | null; tax_amount?: number; pdf_url?: string | null; issued_at?: string };
        Update: { id?: string; order_id?: string; invoice_no?: string; gstin?: string | null; tax_amount?: number; pdf_url?: string | null; issued_at?: string };
      };
      // 47. qr_codes
      qr_codes: {
        Row: { id: string; token_hash: string; order_id: string | null; user_id: string | null; source: string; share_count: number; is_redeemed: boolean; redeemed_at: string | null; expires_at: string; created_at: string };
        Insert: { id?: string; token_hash: string; order_id?: string | null; user_id?: string | null; source?: string; share_count?: number; is_redeemed?: boolean; redeemed_at?: string | null; expires_at: string; created_at?: string };
        Update: { id?: string; token_hash?: string; order_id?: string | null; user_id?: string | null; source?: string; share_count?: number; is_redeemed?: boolean; redeemed_at?: string | null; expires_at?: string; created_at?: string };
      };
      // 48. qr_code_events
      qr_code_events: {
        Row: { id: string; qr_code_id: string; event_type: string; ip_or_device: string | null; event_time: string };
        Insert: { id?: string; qr_code_id: string; event_type: string; ip_or_device?: string | null; event_time?: string };
        Update: { id?: string; qr_code_id?: string; event_type?: string; ip_or_device?: string | null; event_time?: string };
      };

      // 49. support_tickets
      support_tickets: {
        Row: { id: string; ticket_no: string; order_id: string; order_no: string; customer_id: string; customer_name: string; customer_phone: string; machine_id: string; machine_name: string; amount: number; utr: string | null; reason: string; reason_label: string; status: TicketStatus; priority: TicketPriority; sla_remaining_minutes: number; sla_deadline: string; channel: string; customer_message: string; dispense_variance: number; resolution: string | null; resolved_at: string | null; resolved_by: string | null; created_at: string };
        Insert: { id: string; ticket_no: string; order_id: string; order_no: string; customer_id: string; customer_name: string; customer_phone: string; machine_id: string; machine_name: string; amount: number; utr?: string | null; reason: string; reason_label: string; status?: TicketStatus; priority?: TicketPriority; sla_remaining_minutes?: number; sla_deadline: string; channel?: string; customer_message: string; dispense_variance?: number; resolution?: string | null; resolved_at?: string | null; resolved_by?: string | null; created_at?: string };
        Update: { id?: string; ticket_no?: string; order_id?: string; order_no?: string; customer_id?: string; customer_name?: string; customer_phone?: string; machine_id?: string; machine_name?: string; amount?: number; utr?: string | null; reason?: string; reason_label?: string; status?: TicketStatus; priority?: TicketPriority; sla_remaining_minutes?: number; sla_deadline?: string; channel?: string; customer_message?: string; dispense_variance?: number; resolution?: string | null; resolved_at?: string | null; resolved_by?: string | null; created_at?: string };
      };
      // 50. ticket_status_history
      ticket_status_history: {
        Row: { id: string; ticket_id: string; from_status: TicketStatus | null; to_status: TicketStatus; changed_by: string; note: string | null; changed_at: string };
        Insert: { id?: string; ticket_id: string; from_status?: TicketStatus | null; to_status: TicketStatus; changed_by: string; note?: string | null; changed_at?: string };
        Update: { id?: string; ticket_id?: string; from_status?: TicketStatus | null; to_status?: TicketStatus; changed_by?: string; note?: string | null; changed_at?: string };
      };
      // 51. ticket_evidence
      ticket_evidence: {
        Row: { id: string; ticket_id: string; evidence_type: string; url: string | null; metadata: Json | null; created_at: string };
        Insert: { id?: string; ticket_id: string; evidence_type: string; url?: string | null; metadata?: Json | null; created_at?: string };
        Update: { id?: string; ticket_id?: string; evidence_type?: string; url?: string | null; metadata?: Json | null; created_at?: string };
      };
      // 52. refunds
      refunds: {
        Row: { id: string; ticket_id: string | null; order_id: string; amount: number; destination: string; status: string; approved_by: string | null; bank_payout_ref: string | null; created_at: string };
        Insert: { id?: string; ticket_id?: string | null; order_id: string; amount: number; destination?: string; status?: string; approved_by?: string | null; bank_payout_ref?: string | null; created_at?: string };
        Update: { id?: string; ticket_id?: string | null; order_id?: string; amount?: number; destination?: string; status?: string; approved_by?: string | null; bank_payout_ref?: string | null; created_at?: string };
      };
      // 53. dispute_verdicts
      dispute_verdicts: {
        Row: { id: string; ticket_id: string; verdict: string; justification: string; decided_by: string | null; decided_at: string };
        Insert: { id?: string; ticket_id: string; verdict: string; justification: string; decided_by?: string | null; decided_at?: string };
        Update: { id?: string; ticket_id?: string; verdict?: string; justification?: string; decided_by?: string | null; decided_at?: string };
      };
      // 54. feedback_ratings
      feedback_ratings: {
        Row: { id: string; order_id: string | null; machine_id: string | null; user_id: string | null; rating: number; tag: string | null; comments: string | null; created_at: string };
        Insert: { id?: string; order_id?: string | null; machine_id?: string | null; user_id?: string | null; rating: number; tag?: string | null; comments?: string | null; created_at?: string };
        Update: { id?: string; order_id?: string | null; machine_id?: string | null; user_id?: string | null; rating?: number; tag?: string | null; comments?: string | null; created_at?: string };
      };
      // 55. customer_satisfaction_surveys
      customer_satisfaction_surveys: {
        Row: { id: string; customer_id: string | null; csat_score: number; survey_category: string | null; feedback: string | null; submitted_at: string };
        Insert: { id?: string; customer_id?: string | null; csat_score: number; survey_category?: string | null; feedback?: string | null; submitted_at?: string };
        Update: { id?: string; customer_id?: string | null; csat_score?: number; survey_category?: string | null; feedback?: string | null; submitted_at?: string };
      };
      // 56. fraud_blacklist
      fraud_blacklist: {
        Row: { id: string; identifier: string; identifier_type: string; severity: string; reason: string; added_by: string | null; expires_at: string | null; created_at: string };
        Insert: { id?: string; identifier: string; identifier_type: string; severity?: string; reason: string; added_by?: string | null; expires_at?: string | null; created_at?: string };
        Update: { id?: string; identifier?: string; identifier_type?: string; severity?: string; reason?: string; added_by?: string | null; expires_at?: string | null; created_at?: string };
      };
      // 57. support_macros
      support_macros: {
        Row: { id: string; macro_key: string; title: string; response_template: string; category: string };
        Insert: { id?: string; macro_key: string; title: string; response_template: string; category: string };
        Update: { id?: string; macro_key?: string; title?: string; response_template?: string; category?: string };
      };

      // 58. offers
      offers: {
        Row: { id: string; title: string; discount_type: string; value: number; min_order: number | null; budget_cap: number; budget_burned: number; is_active: boolean; starts_at: string; ends_at: string };
        Insert: { id?: string; title: string; discount_type: string; value: number; min_order?: number | null; budget_cap: number; budget_burned?: number; is_active?: boolean; starts_at: string; ends_at: string };
        Update: { id?: string; title?: string; discount_type?: string; value?: number; min_order?: number | null; budget_cap?: number; budget_burned?: number; is_active?: boolean; starts_at?: string; ends_at?: string };
      };
      // 59. coupons
      coupons: {
        Row: { id: string; code: string; title: string; type: string; value: number; min_order: number; usage_count: number; max_usage: number; budget_cap: number; budget_burned: number; status: string; expires_at: string };
        Insert: { id: string; code: string; title: string; type: string; value: number; min_order?: number; usage_count?: number; max_usage?: number; budget_cap: number; budget_burned?: number; status?: string; expires_at: string };
        Update: { id?: string; code?: string; title?: string; type?: string; value?: number; min_order?: number; usage_count?: number; max_usage?: number; budget_cap?: number; budget_burned?: number; status?: string; expires_at?: string };
      };
      // 60. coupon_redemptions
      coupon_redemptions: {
        Row: { id: string; coupon_id: string; user_id: string; order_id: string; discount_applied: number; redeemed_at: string };
        Insert: { id?: string; coupon_id: string; user_id: string; order_id: string; discount_applied: number; redeemed_at?: string };
        Update: { id?: string; coupon_id?: string; user_id?: string; order_id?: string; discount_applied?: number; redeemed_at?: string };
      };
      // 61. banners
      banners: {
        Row: { id: string; title: string; placement: string; impressions: number; clicks: number; priority: number; status: string; image_url: string | null; created_at: string };
        Insert: { id?: string; title: string; placement: string; impressions?: number; clicks?: number; priority?: number; status?: string; image_url?: string | null; created_at?: string };
        Update: { id?: string; title?: string; placement?: string; impressions?: number; clicks?: number; priority?: number; status?: string; image_url?: string | null; created_at?: string };
      };
      // 62. push_notifications
      push_notifications: {
        Row: { id: string; title: string; body: string; target_segment: string; delivered: number; opened: number; open_rate: number; sent_at: string };
        Insert: { id: string; title: string; body: string; target_segment: string; delivered?: number; opened?: number; open_rate?: number; sent_at?: string };
        Update: { id?: string; title?: string; body?: string; target_segment?: string; delivered?: number; opened?: number; open_rate?: number; sent_at?: string };
      };
      // 63. notification_deliveries
      notification_deliveries: {
        Row: { id: string; notification_id: string; user_id: string; status: string; read_at: string | null };
        Insert: { id?: string; notification_id: string; user_id: string; status?: string; read_at?: string | null };
        Update: { id?: string; notification_id?: string; user_id?: string; status?: string; read_at?: string | null };
      };
      // 64. user_badges
      user_badges: {
        Row: { id: string; user_id: string; badge_name: string; badge_icon: string | null; awarded_at: string };
        Insert: { id?: string; user_id: string; badge_name: string; badge_icon?: string | null; awarded_at?: string };
        Update: { id?: string; user_id?: string; badge_name?: string; badge_icon?: string | null; awarded_at?: string };
      };
      // 65. leaderboard_entries
      leaderboard_entries: {
        Row: { id: string; user_id: string; cups_purchased: number; rank: number; period_tag: string };
        Insert: { id?: string; user_id: string; cups_purchased?: number; rank: number; period_tag: string };
        Update: { id?: string; user_id?: string; cups_purchased?: number; rank?: number; period_tag?: string };
      };
      // 66. ad_networks
      ad_networks: {
        Row: { id: string; name: string; ecpm: number; daily_impressions: number; daily_revenue: number; status: string };
        Insert: { id?: string; name: string; ecpm: number; daily_impressions?: number; daily_revenue?: number; status?: string };
        Update: { id?: string; name?: string; ecpm?: number; daily_impressions?: number; daily_revenue?: number; status?: string };
      };
      // 67. ad_spaces
      ad_spaces: {
        Row: { id: string; machine_id: string; slot_name: string; surface_area: string | null; rate_monthly: number; status: string };
        Insert: { id?: string; machine_id: string; slot_name: string; surface_area?: string | null; rate_monthly: number; status?: string };
        Update: { id?: string; machine_id?: string; slot_name?: string; surface_area?: string | null; rate_monthly?: number; status?: string };
      };
      // 68. ad_space_bookings
      ad_space_bookings: {
        Row: { id: string; space_id: string | null; machine_id: string; slot_name: string; advertiser: string; rate_monthly: number; months_booked: number; status: string; renewal_date: string; created_at: string };
        Insert: { id: string; space_id?: string | null; machine_id: string; slot_name: string; advertiser: string; rate_monthly: number; months_booked?: number; status?: string; renewal_date: string; created_at?: string };
        Update: { id?: string; space_id?: string | null; machine_id?: string; slot_name?: string; advertiser?: string; rate_monthly?: number; months_booked?: number; status?: string; renewal_date?: string; created_at?: string };
      };
    };
    Functions: {
      fn_ticket_evidence_bundle: {
        Args: { p_ticket_id: string };
        Returns: Json;
      };
      fn_wallet_credit: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_description: string;
          p_reference_id?: string;
        };
        Returns: Json;
      };
      fn_resolve_dispute: {
        Args: {
          p_ticket_id: string;
          p_verdict: string;
          p_resolution_note: string;
          p_admin_name: string;
        };
        Returns: Json;
      };
    };
  };
}
