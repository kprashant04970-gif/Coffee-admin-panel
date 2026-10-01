# Manhattan Coffee Vending Network — Database Architecture & Schema Specification

This directory contains the production-grade PostgreSQL / Supabase migration files for the Manhattan Coffee Automated Vending Network.

## Schema File Index

1. **`001_full_schema.sql`**:
   - Master DDL containing the **68 database entities** defined in `admin-routing-workflow.html`.
   - Includes custom PostgreSQL enum types (`machine_status`, `machine_mode`, `tank_status`, `order_status`, `payment_method`, `ticket_status`, `user_role`).
   - Hardware telemetry partitions, sensor ground-truth logs, FSSAI 18-hour cold chain tanks, customer profiles, audit trails, and financial ledgers.

2. **`002_functions.sql`**:
   - `fn_ticket_evidence_bundle(p_ticket_id)`: Single atomic RPC executing in under 25ms that compiles the complete evidence bundle for the Dispute Desk (ticket, order, sensor pulses, synchronized camera clips, tank state, and ±10m fault health window).
   - `fn_wallet_credit(...)`: Atomic wallet balance adjustments with row-level locks and running balance transactions.
   - `fn_resolve_dispute(...)`: Official dispute verdict execution with audit status transitions.

3. **`004_rls_policies.sql`**:
   - Enforces the 6-Role RBAC reach matrix (`owner`, `ops`, `support`, `finance`, `marketing`, `viewer`).
   - Strictly enforces Separation of Duties: Support agents can resolve tickets, but financial payouts require Ops or Finance authorization.

4. **`005_seed.sql`**:
   - Populates initial baseline fleet units (`MCH-001 Campus Hub`, `MCH-002 Mall Lane`, `MCH-003 Tech Park Central`), certified FSSAI batches, active coupons, and dispute ticket `TKT-8902` with 18.3% variance.

## How to Apply Migrations

To apply to PostgreSQL or Supabase:

```bash
psql -h <host> -U postgres -d postgres -f schema/001_full_schema.sql
psql -h <host> -U postgres -d postgres -f schema/002_functions.sql
psql -h <host> -U postgres -d postgres -f schema/004_rls_policies.sql
psql -h <host> -U postgres -d postgres -f schema/005_seed.sql
```
