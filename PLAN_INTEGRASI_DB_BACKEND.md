# PwnCorp ERP — Rencana Integrasi End-to-End (DB + Backend)

> Status: **Mockup Frontend Selesai** → **Next: DB Schema + API + Auth**
> Tanggal: 16 Juli 2026

---

## 1. STATUS SAAT INI

Frontend sudah jadi semua (~45 halaman) dengan **hardcoded mock data**. Belum ada:
- ❌ Database schema / Prisma / SQL
- ❌ API Routes / Server Actions
- ❌ Authentication (NextAuth.js)
- ❌ ORM setup
- ❌ Validasi form server-side

---

## 2. ARSITEKTUR TEKNIS

```
┌─────────────────────────────────────────────────┐
│  Next.js 14 App Router                          │
│  ┌──────────────┐  ┌──────────────────────────┐ │
│  │  Client Pages │  │  API Routes (src/app/api/)│ │
│  │  ("use client")│  │  Server Actions          │ │
│  └──────┬───────┘  └────────────┬─────────────┘ │
│         │                       │               │
│  ┌──────┴───────────────────────┴─────────────┐ │
│  │  Data Access Layer (src/lib/db.ts)          │ │
│  │  Prisma Client                              │ │
│  └──────────────────────┬─────────────────────┘ │
│                         │                       │
│  ┌──────────────────────┴─────────────────────┐ │
│  │  NextAuth.js (src/app/api/auth/[...nextauth])│ │
│  │  JWT Session + Role-based Middleware        │ │
│  └──────────────────────┬─────────────────────┘ │
└─────────────────────────┼───────────────────────┘
                          │
                    ┌─────┴─────┐
                    │ PostgreSQL │
                    └───────────┘
```

**Stack:**
- Frontend: Next.js 14, Tailwind CSS 3, Lucide Icons
- Backend: Next.js API Routes + Server Actions
- Database: PostgreSQL + Prisma ORM
- Auth: NextAuth.js (Credentials + JWT)
- PDF: @react-pdf/renderer
- Excel: exceljs
- Deploy: Docker + VPS

---

## 3. DATABASE SCHEMA — SEMUA ENTITAS & KORELASI

### 3.1 Master Data Module

```
┌──────────┐       ┌─────────────┐       ┌──────────┐
│  stores  │       │    users    │       │  roles   │
│  (multi-  │       │             │       │          │
│   store)  │       └──────┬──────┘       └──────────┘
└──────────┘              │
                          │ belongs to
              ┌───────────┼───────────┐
              ▼           ▼           ▼
        ┌─────────┐ ┌──────────┐ ┌──────────┐
        │customers│ │suppliers │ │mekaniks  │
        └────┬────┘ └──────────┘ └──────────┘
             │
        ┌────┴────┐
        │vehicles │  (1 customer → N vehicles)
        └─────────┘
```

**Tables:**

| Table | Key Fields | Relationships |
|-------|-----------|---------------|
| `stores` | id, name, address, is_active | 1 store → N users |
| `roles` | id, name (Admin/Owner/SA/Mekanik/Finance) | 1 role → N users |
| `users` | id, name, email, password_hash, role_id, store_id | belongs to role, store |
| `customers` | id, name, type (retail/wholesale), phone, email, address, store_id | has many vehicles |
| `vehicles` | id, customer_id, plate_no, brand, model, year, chassis_no, engine_no | belongs to customer |
| `suppliers` | id, company_name, contact_person, phone, email, address, payment_terms, store_id | supplies spareparts |
| `spareparts` | id, sku, name, code, brand, category, type, buy_price, sell_price, unit, min_stock, location, is_tracking, is_bundle, supplier_id, store_id | belongs to supplier |
| `services` | id, sku, name, category, standard_price, est_duration, store_id | standalone catalog |
| `service_packages` | id, sku, name, description, est_duration, price, is_active, store_id | bundle of services |

### 3.2 Operasional Module (Core Flow)

```
┌──────────────────┐
│  service_orders  │  ← Estimasi (frontdesk/SA)
│  (SRO/xxx)       │
└────────┬─────────┘
         │ status: Approved
         ▼
┌──────────────────┐     ┌────────────────────┐
│  work_orders     │────▶│ work_order_items   │
│  (SWO/xxx)       │     │  - sparepart pakai │
│  assign mekanik  │     │  - jasa dikerjakan │
└────────┬─────────┘     └────────────────────┘
         │ status: Completed
         ▼
┌──────────────────┐     ┌────────────────────┐
│  invoices        │────▶│  payment_history   │
│  (SRI/xxx)       │     │  (DP + Pelunasan)  │
│  generate dari WO│     └────────────────────┘
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  journal_entries │  ← Auto double-entry
│  (from invoice   │
│   & payment)     │
└──────────────────┘
```

**Tables:**

| Table | Key Fields | Relationships |
|-------|-----------|---------------|
| `service_orders` | id, so_no, customer_id, vehicle_id, sa_id, store_id, complaint, status, total, date | FK: customer, vehicle, SA (user) |
| `so_spareparts` | id, so_id, sparepart_id, qty, unit_price, total | FK: SO, sparepart |
| `so_services` | id, so_id, service_id, qty, unit_price, total | FK: SO, service |
| `work_orders` | id, wo_no, so_id, mekanik_id, store_id, status, start_date, target_date | FK: SO, mekanik |
| `wo_items` | id, wo_id, item_type (sparepart/service), item_id, qty, unit_price, total | FK: WO |
| `invoices` | id, inv_no, wo_id, customer_id, store_id, status (unpaid/partial/paid), total, amount_paid, amount_due, invoice_date, due_date | FK: WO, customer |
| `invoice_items` | id, invoice_id, description, qty, unit_price, total | FK: invoice |
| `payments` | id, invoice_id, amount, payment_date, payment_method, ref_no | FK: invoice |

### 3.3 Inventory & Warehouse Module

```
┌──────────────────┐
│  purchase_request│  ← Permintaan belanja
│  (PR/xxx)        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐     ┌───────────────────────┐
│  purchase_orders │────▶│  po_items             │
│  (PO/HO/xxx)     │     │  sparepart, qty, price│
└────────┬─────────┘     └───────────────────────┘
         │
         ├──▶ purchase_deliveries (Goods Receipt)
         ├──▶ purchase_invoices  (Tagihan supplier)
         └──▶ purchase_returns   (Retur)

┌──────────────────┐
│  stock_orders    │  ← Outbound: SO → WO → pakai sparepart
│  (OPO/xxx)       │
└──────────────────┘

┌──────────────────┐
│  stock_transfer  │  ← Transfer antar gudang/cabang
└──────────────────┘

┌──────────────────┐
│  stock_opname    │  ← Selisih fisik vs sistem
└──────────────────┘
```

**Tables:**

| Table | Key Fields | Relationships |
|-------|-----------|---------------|
| `purchase_requests` | id, pr_no, requested_by, store_id, status, date | FK: user, store |
| `pr_items` | id, pr_id, sparepart_id, qty, unit_price | FK: PR, sparepart |
| `purchase_orders` | id, po_no, ref_no, supplier_id, warehouse, store_id, status, total, date, due_at | FK: supplier, store |
| `po_items` | id, po_id, sparepart_id, qty, unit_price, total | FK: PO, sparepart |
| `purchase_deliveries` | id, delivery_no, po_id, received_at, store_id, status | FK: PO, store |
| `delivery_items` | id, delivery_id, sparepart_id, qty_ordered, qty_received | FK: delivery, sparepart |
| `purchase_invoices` | id, doc_no, po_id, supplier_id, total, status, date | FK: PO, supplier |
| `purchase_returns` | id, doc_no, po_id, supplier_id, total, status, date, reason | FK: PO, supplier |
| `stock_orders` | id, order_no, wo_id, store_id, warehouse, status, date | FK: WO, store |
| `so_items` | id, stock_order_id, sparepart_id, qty | FK: stock_order, sparepart |
| `stock_transfers` | id, transfer_no, from_warehouse, to_store, status, date | |
| `transfer_items` | id, transfer_id, sparepart_id, qty | FK: transfer, sparepart |
| `stock_opnames` | id, ref_code, warehouse, store_id, date, status | |
| `opname_items` | id, opname_id, sparepart_id, system_qty, physical_qty, adjustment, reason | FK: opname, sparepart |
| `stock_histories` | id, sparepart_id, store_id, change_type (in/out/adjust), qty_change, qty_before, qty_after, ref_doc, ref_no, date | FK: sparepart, store |

### 3.4 Finance & Accounting Module

```
┌────────────────┐
│   coa          │  ← Chart of Accounts (Asset/Liability/Equity/Revenue/Expense)
│   accounts     │
└───────┬────────┘
        │
        ▼
┌────────────────┐     ┌───────────────────┐
│ journal_entries│────▶│ journal_details   │
│  (double-entry)│     │  account, debit,   │
└───────┬────────┘     │  credit, desc      │
        │              └───────────────────┘
        │ auto dari:
        ├── Invoice terbayar → Kas/Debit, Piutang/Kredit
        ├── PO supplier → Hutang/Kredit, Persediaan/Debit
        ├── Gaji → Beban/Debit, Kas/Kredit
        └── Adjustment stok → HPP/Debit, Persediaan/Kredit
```

**Tables:**

| Table | Key Fields | Relationships |
|-------|-----------|---------------|
| `coa` | id, code, name, kategori (Asset/Liability/Equity/Revenue/Expense), normal_balance, parent_id, level | self-referencing tree |
| `journal_entries` | id, je_no, date, description, ref_type, ref_id, store_id, status, created_by, approved_by | FK: store, users |
| `journal_details` | id, je_id, coa_id, description, debit, credit | FK: JE, COA |
| `accounts_receivable` | id, invoice_id, customer_id, amount, balance, due_date, status | FK: invoice, customer |
| `accounts_payable` | id, purchase_invoice_id, supplier_id, amount, balance, due_date, status | FK: invoice, supplier |
| `bank_accounts` | id, bank_name, account_no, account_name, balance, store_id | FK: store |
| `bank_reconciliations` | id, bank_account_id, statement_date, closing_balance, status | FK: bank_account |
| `reconciliation_items` | id, reconciliation_id, journal_id, matched | FK: reconciliation, journal |
| `petty_cash` | id, date, description, type (in/out), amount, balance, store_id | FK: store |
| `payment_requests` | id, pr_no, requested_by, amount, purpose, status (pending/approved/rejected/paid), vendor, due_date | FK: user |
| `tax_invoices` | id, invoice_id, tax_type (PPN), tax_amount, faktur_no, status | FK: invoice |

### 3.5 Project & Anggaran Module

```
┌────────────────┐     ┌──────────────────────┐
│   projects     │────▶│  project_expenses    │
│  (kontrak)     │     │  link ke journal     │
└────────────────┘     └──────────────────────┘
```

**Tables:**

| Table | Key Fields | Relationships |
|-------|-----------|---------------|
| `projects` | id, name, customer_id, contract_value, start_date, end_date, status, store_id | FK: customer, store |
| `project_expenses` | id, project_id, journal_id, description, amount, date | FK: project, journal |

### 3.6 Activity Log & Misc

| Table | Purpose |
|-------|---------|
| `activity_logs` | Audit trail: user, action, entity, entity_id, timestamp, details |
| `document_templates` | Template cetak: estimasi, WO, invoice (HTML/PDF) |
| `settings` | Config global: store info, tax rate, numbering format |

---

## 4. KORELASI ANTAR MENU & DATA

### Diagram Aliran Data Utama

```
           ┌─────────────┐
           │  MASTER DATA │ ◀─── Backbone semua modul
           │  (customers,  │
           │  vehicles,    │
           │  spareparts,  │
           │  services,    │
           │  suppliers,   │
           │  users)       │
           └──────┬───────┘
                  │
     ┌────────────┼────────────┐
     ▼            ▼            ▼
┌─────────┐ ┌──────────┐ ┌──────────┐
│SERVICE  │ │WAREHOUSE │ │ FINANCE  │
│ORDERS   │ │PURCHASE  │ │DASHBOARD │
└────┬────┘ └────┬─────┘ └────┬─────┘
     │           │            │
     ▼           ▼            │
┌─────────┐ ┌──────────┐     │
│  WORK   │ │ STOCK    │     │
│ ORDERS  │ │ WORKFLOW │     │
└────┬────┘ └──────────┘     │
     │                       │
     ▼                       │
┌─────────┐                  │
│INVOICES │──────────────────┘
└────┬────┘        (AR/AP, jurnal otomatis)
     │
     ▼
┌─────────┐
│PAYMENTS │───────────────▶ JOURNAL ENTRIES
└─────────┘                      │
                                 ▼
                          ┌──────────────┐
                          │ FINANCIAL    │
                          │ REPORTS      │
                          │ (BS, P&L, CF)│
                          └──────────────┘
```

### Korelasi Spesifik Per Menu

| Menu | Tergantung Data Dari | Mempengaruhi Data |
|------|---------------------|-------------------|
| **Dashboard** | service_orders, work_orders, invoices, stock | — (readonly) |
| **Project** | customers, vehicles, invoices | project_expenses |
| **Anggaran** | projects, journal_entries | — (readonly) |
| **Service Orders** | customers, vehicles, spareparts, services | work_orders, stock |
| **Work Orders** | service_orders, spareparts, mekanik | stock (auto-deduct), invoices |
| **Stock Workflow** | work_orders, spareparts, stock | stock (outbound) |
| **Purchase Request** | spareparts, suppliers | purchase_orders |
| **Pembanding** | suppliers, spareparts | purchase_orders |
| **Purchase Orders** | suppliers, purchase_requests | stock, AP, purchase_deliveries |
| **Purchase Deliveries** | purchase_orders, spareparts | stock (inbound) |
| **Purchase Invoices** | purchase_orders, suppliers | AP, journal |
| **Purchase Returns** | purchase_orders, spareparts | stock, AP |
| **Stock Transfer** | spareparts, stores | stock (antar gudang) |
| **Stock Opname** | spareparts, stock | stock (adjustment) |
| **Stock Histories** | spareparts | — (readonly log) |
| **Master Data** | — (standalone) | digunakan semua modul |
| **Reports** | service_orders, work_orders, invoices, payments | — (readonly) |
| **Finance Dashboard** | bank_accounts, AR, AP, journal | — (readonly) |
| **Request Payment** | — | payment_requests, petty_cash |
| **Buku Kasir** | petty_cash | journal |
| **Payment Processing** | payment_requests | payments, journal |
| **Invoices (Finance)** | work_orders, purchases | AR, AP |
| **Rencana Tagihan** | invoices (AR) | — |
| **Payments** | invoices | journal, AR |
| **SOA** | invoices, payments, AR | — (readonly) |
| **COA** | — (standalone) | journal |
| **Jurnal Umum** | COA, auto-trigger events | financial reports |
| **Receipts/Transfers** | bank_accounts, COA | journal |
| **Rekonsiliasi Bank** | bank_accounts, journal | journal (adjustment) |
| **Finance Reports** | journal_entries, COA, AR, AP | — (readonly) |

---

## 5. RENCANA IMPLEMENTASI (PHASE-BASED)

### Phase 0: Setup Foundation — ~3 hari

```
[0.1] Install & configure Prisma + PostgreSQL
  - npm install prisma @prisma/client
  - npx prisma init
  - Setup DATABASE_URL di .env
  - Docker image: postgres:15-alpine

[0.2] Prisma Schema — semua 40+ tabel
  - Tulis schema.prisma lengkap
  - Relasi, index, default values
  - npx prisma db push / migrate dev

[0.3] NextAuth.js Setup
  - npm install next-auth
  - Credentials provider + bcrypt
  - JWT session strategy
  - Role-based middleware (src/middleware.ts)
  - Tambah role check di layout

[0.4] Data Access Layer
  - src/lib/db.ts (Prisma singleton)
  - src/lib/auth-helpers.ts (getCurrentUser, requireRole)
  - src/lib/api-helpers.ts (pagination, filtering, error handler)
```

### Phase 1: Seed Data + Master Data API — ~2 hari

```
[1.1] Database Seed
  - prisma/seed.ts
  - Semua mock data yang ada dipindah ke DB
  - User: admin, SA, mekanik, finance (default password)
  - Store: 3 store (Putra Wijaya, Putro Joyo, Nia Jaya)
  - Sparepart, Service, Customer, Vehicle, Supplier

[1.2] API: Master Data CRUD
  - GET/POST /api/customers
  - GET/PUT/DELETE /api/customers/[id]
  - Sama untuk: vehicles, suppliers, spareparts, services, service-packages, users

  Pola API:
  - Semua pakai Server Actions / API Routes
  - Response shape seragam: { data, error, pagination }
  - Filter by store_id dari session user
```

### Phase 2: Service Orders + Work Orders — ~4 hari ⭐ CRITICAL PATH

```
[2.1] API: Service Orders
  - POST /api/service-orders (create dengan sparepart + service items)
  - GET /api/service-orders (list + filter by status, store, date)
  - GET /api/service-orders/[no] (detail)
  - PUT /api/service-orders/[no] (update status)
  - Auto-generate SO number: SRO/{store_code}/{date}{seq}
  - Validasi: customer, vehicle, stock availability

[2.2] API: Work Orders
  - Auto-generate dari approved SO
  - Assign mekanik
  - Status flow: Draft → Waiting Stock → Confirmed → In Progress → QC → Completed
  - Stock check: saat confirm → cek stok sparepart
  - Auto-deduct stok saat mekanik pakai sparepart

[2.3] Stock Workflow (Outbound)
  - WO → Stock Order → Warehouse approve → Confirm → Outbound
  - API: /api/stock-orders

[2.4] Document Templates
  - PDF generation pakai @react-pdf/renderer
  - Print: Estimasi, Work Order, Tanda Terima
```

### Phase 3: Invoice + Pembayaran — ~3 hari

```
[3.1] API: Invoices
  - Auto-generate dari completed WO
  - Hitung total: sparepart terpakai + jasa
  - Partial payment support (DP + pelunasan)
  - API: POST/GET /api/invoices

[3.2] API: Payments
  - Record pembayaran (full/partial)
  - Update invoice status & AR
  - Auto jurnal: Kas (D) vs Pendapatan (K)
  - API: POST/GET /api/payments

[3.3] Accounts Receivable
  - Auto-create dari invoice (customer wholescale/corporate)
  - Aging report
```

### Phase 4: Warehouse & Inventory — ~4 hari

```
[4.1] Purchase Request → PO
  - Flow: PR → Pembanding → PO
  - API: /api/purchase-requests, /api/purchase-orders

[4.2] Goods Receipt
  - Receive dari PO → auto-update stok
  - Cross-check qty fisik vs PO
  - API: /api/purchase-deliveries

[4.3] Purchase Invoice & AP
  - Supplier invoice → AP
  - Payment → update AP balance
  - API: /api/purchase-invoices

[4.4] Stock Management
  - Stock level real-time
  - Min stock alert
  - Stock Transfer antar gudang
  - Stock Opname + adjustment
```

### Phase 5: Finance & Accounting — ~5 hari

```
[5.1] Chart of Accounts (COA)
  - Tree structure (parent-child)
  - Inline edit di halaman COA
  - API: /api/coa

[5.2] Journal Entries (Double-Entry)
  - Auto-trigger dari transaksi
  - Manual entry (adjustment)
  - Approval workflow
  - API: /api/journal

[5.3] Auto-Journal Triggers:
  Invoice terbayar  →  Kas (D), Piutang (K)
  PO supplier       →  Persediaan (D), Hutang (K)
  Pembayaran gaji   →  Beban (D), Kas (K)
  Adjustment stok   →  HPP (D), Persediaan (K)
  Retur pembelian   →  Hutang (D), Persediaan (K)

[5.4] Bank & Kas
  - Penerimaan, Transfer, Rekonsiliasi
  - Buku Kasir (Petty Cash)

[5.5] Financial Reports
  - Balance Sheet, Profit & Loss, Cash Flow
  - Aging AP/AR
  - Export Excel
```

### Phase 6: Dashboard & Reports — ~3 hari

```
[6.1] Dashboard Operasional (migrasi dari mock)
  - Total WO, status breakdown
  - Pendapatan harian
  - Stok kritis

[6.2] Dashboard Finance
  - Kas & Bank real-time
  - Piutang/Hutang jatuh tempo
  - Omzet vs Laba

[6.3] Reports Module
  - 9 service reports + 17 finance reports
  - Semua diganti dari hardcoded → query DB
```

---

## 6. AUTO-JOURNAL MAPPING (EVENT → JURNAL)

| Trigger Event | Debit | Kredit |
|--------------|-------|--------|
| Invoice terbayar | Kas/Bank | Piutang Usaha |
| PO Supplier diterima | Persediaan | Hutang Usaha |
| Bayar Hutang Supplier | Hutang Usaha | Kas/Bank |
| WO pakai sparepart | HPP | Persediaan |
| WO pakai jasa (internal) | — | — (non-journal, cost tracking) |
| Gaji karyawan | Beban Gaji | Kas/Bank |
| Pembelian tunai sparepart | Persediaan | Kas/Bank |
| Adjustment stok (+) | Persediaan | Selisih Persediaan |
| Adjustment stok (-) | Selisih Persediaan | Persediaan |
| Retur penjualan | Piutang (K), Pendapatan (D) | — |
| Diskon internal | Beban Diskon | Kas (offset) |

---

## 7. MIDDLEWARE & PERMISSIONS

| Role | Akses |
|------|-------|
| **Owner** | Semua modul (read/write) |
| **Admin** | Semua modul kecuali delete data transaksi |
| **SA (Service Advisor)** | Service Orders, Customer, Vehicle, Estimasi |
| **Mekanik** | Work Orders (read/update status), Stock Orders |
| **Finance** | Finance Dashboard, Invoices, Payments, Journal, Reports |
| **Gudang** | Warehouse, Purchase, Stock, Inventory |

Middleware:
```typescript
// src/middleware.ts
- Cek session JWT
- Redirect ke /login jika tidak authenticated
- Cek role untuk route tertentu:
  /finance/* → only Owner, Admin, Finance
  /service-orders/* → Owner, Admin, SA
```

---

## 8. TIMELINE TOTAL

| Phase | Durasi | Deliverable |
|-------|--------|-------------|
| Phase 0: Setup | 3 hari | Prisma schema, NextAuth, DB layer |
| Phase 1: Master Data API | 2 hari | Seed data, CRUD API semua master |
| Phase 2: Service + Work Orders | 4 hari | Core flow: SO → WO → Stock |
| Phase 3: Invoice + Payment | 3 hari | Invoice, Payment, AR |
| Phase 4: Warehouse | 4 hari | PO, Goods Receipt, Stock |
| Phase 5: Finance & Accounting | 5 hari | COA, Journal, Laporan |
| Phase 6: Dashboard & Reports | 3 hari | Real data di dashboard & reports |
| **TOTAL** | **~24 hari** | **~5 minggu** |

---

## 9. FILE STRUCTURE (AFTER)

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   ├── customers/
│   │   ├── vehicles/
│   │   ├── suppliers/
│   │   ├── spareparts/
│   │   ├── services/
│   │   ├── service-orders/
│   │   ├── work-orders/
│   │   ├── invoices/
│   │   ├── payments/
│   │   ├── purchase-orders/
│   │   ├── stock/
│   │   ├── journal/
│   │   ├── coa/
│   │   └── reports/
│   ├── (dashboard)/       # semua halaman existing
│   ├── (finance)/
│   └── ...
├── lib/
│   ├── db.ts              # Prisma singleton
│   ├── auth.ts            # NextAuth config
│   ├── auth-helpers.ts    # getCurrentUser, requireRole
│   ├── journal.ts         # Auto-journal engine
│   ├── stock.ts           # Stock management helpers
│   └── utils.ts           # formatCurrency, slugify, etc
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── middleware.ts
└── ...
```

---

## 10. CATATAN PENTING

1. **Multi-store**: Semua query wajib filter `store_id` dari session. User 1 store = filter 1 store.
2. **No. Dokumen format**: `{PREFIX}/{STORE_CODE}/{YEAR}{MONTH}{SEQ}` (contoh: `SRO/WM/2607001`)
3. **Stock auto-deduct**: Setiap WO item confirmed → trigger update stok via Prisma transaction
4. **Double-entry auto**: Setiap transaksi keuangan → trigger journal engine
5. **Soft delete**: Gunakan `is_deleted` atau `status: 'cancelled'`, jangan hard delete
6. **Optimistic UI**: Loading state pakai skeleton atau disabled button, jangan blocking
7. **Cache invalidation**: Gunakan `revalidatePath()` di Server Actions untuk refresh data

---

*Generated: 16 Juli 2026 | Next step: konfirmasi struktur, lalu mulai Phase 0*
