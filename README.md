# ☕ Manhattan Coffee Vending Network — Enterprise Admin Platform

> **Production-grade Fleet Telemetry, FSSAI Cold-Chain Audit, and Automated Dispute Desk for Smart Coffee Vending Operations.**

---

## 📌 Executive Summary

Manhattan Coffee Vending Network is an automated IoT-driven platform designed to monitor, command, and operate high-throughput coffee vending machines in real time. It pairs granular hardware sensor logs (boiler thermistors, flow meters, valve timings, dual CCTV bay cameras) with a rapid 5-minute customer dispute SLA and an FSSAI-compliant 18-hour milk cold-chain enforcement system.

Built with **Next.js 15+ App Router**, **TypeScript**, **Tailwind CSS**, and backed by a comprehensive **68-table PostgreSQL / Supabase architecture** with Row-Level Security (RLS) and atomic Stored Procedures.

---

## 🚀 Core Platform Features

### 1. Real-time IoT Fleet Telemetry & Remote Control
- **Boiler & Refrigeration Interlocks:** Live monitoring of heating boiler temperatures (65°C target) and cold frappe chilling coils (6°C target) with automatic lockouts on temperature breach.
- **FSSAI 18-Hour Food Safety Compliance:** Automated countdown timers and batch barcode tracking for milk tanks; units automatically seal or lock out if batch exceeds 18 hours.
- **Remote Diagnostics & Commands:** MQTT-driven command dispatches (`REBOOT`, `TEST_DISPENSE`, `FLUSH_CYCLE`, `LOCK_MACHINE`).
- **Surveillance Integration:** Dual-camera CCTV feeds (Internal Cup Chute & Customer Pickup Bay) synchronized with order dispense windows.

### 2. Sensor-Level Ground Truth & Dispense Logs
- **Pulse-Accurate Dispense Logs:** Milliliter flow pulse tracking, valve open duration (ms), cup drop sensors, and customer pickup optical triggers.
- **Variance Warning System:** Dispenses with $>15\%$ variance between expected and measured flow are automatically flagged for dispute audit.

### 3. Rapid Dispute Desk (5-Minute SLA Guarantee)
- **Atomic Hydration (`fn_ticket_evidence_bundle`):** Sub-25ms single-payload RPC fetching the ticket, order, flow pulses, synchronized 30-second camera clips, batch tank ID, and $\pm 10\text{m}$ machine health events.
- **One-Click Resolution:** Instant UPI source refund or wallet credit authorization with strict Separation of Duties.

### 4. Customer 360 & Float Wallet Ledger
- **Customer Lifecycle:** Order frequency, consumption heatmaps, repeat streaks, and favorite flavor profiles.
- **Float Ledger:** Atomic double-entry wallet credits, coin rewards, and transaction audit trails.

### 5. Multi-Role RBAC (Role-Based Access Control)
- Six isolated operational roles:
  - `owner`: Full root access, secret rotations, and financial payouts.
  - `ops`: Fleet telemetry, cleaning cycles, tank refills, and hardware commands.
  - `support`: Dispute desk, SLA boards, and ticket triage.
  - `finance`: Margin analytics, refund authorizations, and supplier orders.
  - `marketing`: Campaigns, coupon burn rates, push notifications, and machine ad spaces.
  - `viewer`: Read-only operational oversight.

---

## 📂 Project Architecture

```
├── app/                              # Next.js 15+ App Router
│   ├── page.tsx                      # Operations Executive Dashboard (/)
│   ├── layout.tsx                    # Root Layout + Global Context Providers
│   ├── loading.tsx                   # Hydration & Suspense Skeleton
│   ├── not-found.tsx                 # 404 Route Handler
│   ├── login/page.tsx                # Operator OTP Authentication
│   ├── mfa/page.tsx                  # 2FA TOTP Verification
│   ├── forgot-password/page.tsx      # Operator Account Recovery
│   ├── machines/page.tsx             # Fleet Grid View
│   ├── machines/[id]/page.tsx        # Machine Detail (Telemetry, Tanks, Commands)
│   ├── orders/page.tsx               # Real-time Orders Queue
│   ├── orders/[id]/page.tsx          # Order Sensor Evidence & Flow Logs
│   ├── orders/[id]/label/page.tsx    # Printable A5 Packaging Receipt
│   ├── customers/page.tsx            # Customer Directory
│   ├── customers/[id]/page.tsx       # Customer 360° Profile & Heatmaps
│   ├── inventory/page.tsx            # Supplies, Tanks & Raw Materials
│   ├── analytics/page.tsx            # Performance & Unit Economics
│   ├── marketing/page.tsx            # Campaigns, Coupons & Ad Spaces
│   ├── support/page.tsx              # 5-Minute SLA Guarantee Board
│   ├── support/tickets/[id]/page.tsx # Dispute Desk (Synced Video + Telemetry)
│   ├── settings/page.tsx             # Fleet Defaults & Secret Rotation
│   └── architecture/page.tsx         # 56-Route Architecture Blueprint
│
├── components/                       # Reusable UI & Domain Modules
│   ├── admin-shell.tsx               # Master Navigation, Command Palette & Top Bar
│   ├── dispute-desk.tsx              # Multi-channel Evidence Hydration Modal
│   ├── live-telemetry-widget.tsx     # Animated Sensor Gauges
│   └── ...                           # Domain UI Modules
│
├── models/                           # Domain Entities & Business Logic Classes
│   ├── machine.model.ts              # MachineEntity & TankEntity logic
│   ├── order.model.ts                # OrderEntity & DispenseLogEntity calculations
│   ├── customer.model.ts             # CustomerEntity & WalletEntity float checks
│   ├── support.model.ts              # TicketEntity SLA & EvidenceBundleEntity
│   ├── inventory.model.ts            # Low-stock reorder thresholds
│   ├── marketing.model.ts            # Coupon budget burn & CTR metrics
│   ├── admin.model.ts                # RBAC permission & audit helpers
│   └── index.ts                      # Central barrel export
│
├── types/                            # TypeScript Type Definitions
│   ├── database.ts                   # Supabase Database schema (all 68 tables)
│   ├── models.ts                     # Core domain interfaces
│   └── index.ts                      # Central types export
│
├── lib/                              # Core Utilities & Services
│   ├── admin-context.tsx             # Global State & Role Management
│   ├── mock-data.ts                  # High-fidelity realistic fleet fixtures
│   └── db/                           # Database Client & Repositories
│       ├── client.ts                 # Typed database client abstraction
│       └── repositories/             # Machine, Order & Support repositories
│
└── schema/                           # PostgreSQL / Supabase Migrations
    ├── 001_full_schema.sql           # Exactly 68 Tables DDL, Enums & Indices
    ├── 002_functions.sql             # Stored Procedures (Evidence Bundle, Wallet RPC)
    ├── 004_rls_policies.sql          # Row-Level Security Matrix (6 Roles)
    ├── 005_seed.sql                  # Baseline Fleet & Active Dispute Seed Data
    └── README.md                     # Schema Migration Execution Guide
```

---

## 🗄️ Database Architecture (68 Tables)

The database schema is organized into 8 functional modules:

1. **System & Security (7 Tables):** `admin_roles`, `admin_users`, `admin_sessions`, `audit_logs`, `app_config`, `secret_rotations`, `api_keys`.
2. **Fleet Hardware & Telemetry (11 Tables):** `machines`, `machine_telemetry`, `machine_health_logs`, `machine_firmware_versions`, `machine_commands`, `machine_maintenance_logs`, `machine_cleaning_cycles`, `machine_power_events`, `machine_sensors`, `cameras`, `video_clips`.
3. **FSSAI Cold Chain & Supplies (9 Tables):** `machine_tanks`, `machine_tank_events`, `machine_stock`, `machine_stock_events`, `raw_materials`, `warehouse_inventory`, `supplier_orders`, `supplier_order_items`, `stock_waste_logs`.
4. **Products & Recipes (4 Tables):** `products`, `product_variants`, `kit_templates`, `kit_components`.
5. **Customers, Wallets & Social (10 Tables):** `users`, `user_profiles`, `user_stats`, `user_consents`, `customer_notes`, `loyalty_tiers`, `wallets`, `wallet_transactions`, `referrals`, `gifts`.
6. **Orders & Sensor Dispenses (7 Tables):** `orders`, `order_items`, `payment_transactions`, `dispense_logs`, `invoice_receipts`, `qr_codes`, `qr_code_events`.
7. **Support & Dispute Desk (9 Tables):** `support_tickets`, `ticket_status_history`, `ticket_evidence`, `refunds`, `dispute_verdicts`, `feedback_ratings`, `customer_satisfaction_surveys`, `fraud_blacklist`, `support_macros`.
8. **Marketing & Ad Revenue (11 Tables):** `offers`, `coupons`, `coupon_redemptions`, `banners`, `push_notifications`, `notification_deliveries`, `user_badges`, `leaderboard_entries`, `ad_networks`, `ad_spaces`, `ad_space_bookings`.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ or Bun
- PostgreSQL 15+ or Supabase project

### 1. Installation
```bash
npm install
```

### 2. Environment Setup
Create a `.env.local` file based on `.env.example`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Database Migration
Run the SQL migration scripts in order against your PostgreSQL/Supabase instance:
```bash
psql -h <host> -U postgres -d postgres -f schema/001_full_schema.sql
psql -h <host> -U postgres -d postgres -f schema/002_functions.sql
psql -h <host> -U postgres -d postgres -f schema/004_rls_policies.sql
psql -h <host> -U postgres -d postgres -f schema/005_seed.sql
```

### 4. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the operations dashboard.

### 5. Production Build & Linting
```bash
npm run lint    # ESLint validation (0 errors)
npm run build   # Production compilation
npm run start   # Run production server
```

---

## 🔐 Security & Governance

- **Zero-Mock Production Safety:** All sensitive actions (machine resets, secret rotation, dispute payouts) generate immutable audit records in `audit_logs`.
- **Row-Level Security (RLS):** Strictly enforced at the database layer; unauthorized roles receive database-level permission denials.
- **Separation of Duties:** Support agents can review sensor evidence and triage tickets, but financial payouts require Ops or Finance authorization.

---

## 📄 License
Proprietary & Confidential — Manhattan Coffee Automated Vending Systems.
