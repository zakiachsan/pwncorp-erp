# Sistem Manajemen Bengkel — Summary & Development Plan

> PRD: JBW-014/V/2026 v1.1 (30 Mei 2026)
> Client: Pak Yusro (Bengkel Mobil)
> PIC: Muhammad Zaki Achsan

---

## 1. SUMMARY PRD

### Gambaran Besar
Sistem manajemen bengkel mobil berbasis web yang mengintegrasikan 6 modul utama:
Estimasi → Work Order → Invoice/Pembayaran → Inventory → Keuangan → Dashboard.

### Alur Proses Bisnis (Inti)
```
Pelanggan datang
  → Frontdesk input data kendaraan & keluhan
  → Buat Estimasi Biaya (dari katalog sparepart + jasa)
  → Pelanggan review & approve/revisi
  → Generate Work Order (WO) → assign mekanik
  → Mekanik kerja, catat pemakaian sparepart (auto-deduct stok)
  → WO selesai → Quality Check
  → Generate Invoice → Pembayaran (lunas/DP)
  → Serah terima kendaraan
```

### 6 Modul Utama

| # | Modul | Fitur Kunci |
|---|-------|-------------|
| 1 | Estimasi, WO, Invoice & Dokumen | Estimasi biaya, Work Order, Invoice + partial payment, template cetak (PDF), Customer Portal |
| 2 | Inventory & Stock | Katalog sparepart, PO supplier, Goods Receipt, auto-deduct stok dari WO, Stock Opname |
| 3 | Finance & Accounting | AR/AP, Jurnal double-entry otomatis, Neraca, Laba Rugi, Arus Kas, Rekonsiliasi Bank, Integrasi Coretax |
| 4 | Master Data | Customer & Kendaraan, Supplier, Sparepart & Jasa |
| 5 | User & Access Control | Role-based (Admin, Frontdesk, Mekanik, Finance, Owner), max 10 user, Activity Log |
| 6 | Dashboard & Reports | Dashboard operasional + keuangan real-time, laporan akuntansi & operasional, export PDF/Excel |

---

## 2. SUMMARY HASIL DISKUSI CLIENT

### Referensi: Turboly System
Pak Yusro menggunakan/referensi sistem Turboly. Berikut adaptasi yang diminta:

### a. Service Orders (mirip Turboly)
- Tampilan & flow UX Service Orders = seperti Turboly, termasuk kolom table
- Detail Service Orders:
  - Document number, nama Service Advisor (SA)
  - Section Sparepart (bisa search by keyword/ProductCode)
  - Section Jasa (dipisah dari sparepart)
- Setelah SA di-ACC → muncul Service Work Orders
- Export/Print: quotation, sparepart, jasa

### b. Inventory Outbound (Stock Order → WO)
- Flow: Stock Order → Inventory → Work Order
- WO list = permintaan dari SA
- Warehouse approve ketersediaan barang:
  - Stok ada → Draft → Confirm → In Progress
  - Stok habis → stuck di Draft (no restock)
- SA/Mekanik konfirmasi barang diterima → lanjut progress
- Admin bisa update status In Progress → QC → Approved

### c. Customer Types
- Retail Customers
- Wholesale Customers

### d. Discount Handling di Invoice
- Invoice keluar normal ke pelanggan
- Diskon dicatat internal (Finance akui diskon, pengeluaran ke instansi)
- User currently "ngakalin" manual

### e. Anggaran vs Realisasi (mirip GAC-ERP)
- Nilai kontrak vs realisasi per project
- User bisa lihat expense (realisasi) yang ada di project
- Referensi: GAC-ERP (cloudflare link)

---

## 3. TEKNOLOGI YANG DISARANKAN

| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 14+ (App Router), Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes / Server Actions |
| Database | PostgreSQL (relational, cocok untuk akuntansi) |
| ORM | Prisma |
| Auth | NextAuth.js (role-based) |
| PDF Generation | @react-pdf/renderer atau Puppeteer |
| Export Excel | exceljs |
| Deployment | Docker + VPS (Cloud-Ready sesuai PRD) |
| Charts | Recharts / Chart.js (dashboard) |

---

## 4. DEVELOPMENT PLAN

### Phase 0: Setup & Foundation (Hari 1-3)

```
[0.1] Project Setup
  - Next.js 14 + TypeScript + Tailwind + shadcn/ui
  - Prisma + PostgreSQL
  - NextAuth.js setup (role-based auth)
  - Base layout (sidebar, header, main content)

[0.2] Database Schema — Master Data
  - users (id, name, username, password, role, is_active)
  - roles (id, name, permissions JSON)
  - customers (id, name, type [retail/wholesale], contact, address, whatsapp, email)
  - vehicles (id, customer_id, plate_number, brand, type, year, chassis_no, engine_no)
  - suppliers (id, company_name, contact, address, payment_terms)
  - spareparts (id, code, name, category, brand, unit, buy_price, sell_price, min_stock, location)
  - services (id, name, category, standard_price, est_duration)

[0.3] Activity Log Model
  - activity_logs (id, user_id, action, entity, entity_id, timestamp, details)
```

### Phase 1: Master Data CRUD (Hari 4-7)

```
[1.1] User Management
  - List, create, edit, deactivate user
  - Role assignment (Admin, Frontdesk, Mekanik, Finance, Owner)
  - Password hashing (bcrypt)

[1.2] Customer & Vehicle Management
  - CRUD customer (type: retail/wholesale)
  - CRUD vehicle per customer (1 customer → N vehicles)
  - Service history per vehicle

[1.3] Supplier Management
  - CRUD supplier
  - Link sparepart → supplier

[1.4] Sparepart & Service Catalog
  - CRUD sparepart (code, name, category, buy/sell price, min stock, location)
  - CRUD jasa (name, category, price, duration)
  - Bulk price update
```

### Phase 2: Estimasi & Work Order (Hari 8-15) ⭐ Core

```
[2.1] Service Orders (Estimasi)
  - Form input: pilih customer, kendaraan, keluhan
  - Section Sparepart: search by keyword/code, add to estimasi
  - Section Jasa: pilih dari katalog, add to estimasi
  - Auto-calculate total (harga × qty + jasa)
  - Status: Draft → Pending Approval → Approved / Rejected
  - Export/Print: Surat Estimasi (PDF)

[2.2] Work Orders
  - Auto-generate dari approved Service Order
  - Assign mekanik
  - Fields: no kendaraan, keluhan, daftar pekerjaan, sparepart needed
  - Status flow: Draft → Waiting Stock (warehouse) → Confirmed → In Progress → QC → Completed
  - Real-time status tracking
  - Mekanik catat pemakaian sparepart → auto-deduct stok

[2.3] Document Templates
  - Surat Estimasi
  - Work Order
  - Surat Jalan
  - Tanda Terima
  - Semua bisa print / export PDF
```

### Phase 3: Inventory Management (Hari 16-21)

```
[3.1] Stock Management
  - Stock level per sparepart (real-time)
  - Min stock alert
  - Location tracking (rak)

[3.2] Purchase Orders
  - Create PO ke supplier
  - Status: Draft → Sent → Partial Received → Received
  - Auto-update stok saat Goods Receipt

[3.3] Goods Receipt & Delivery
  - Receive barang dari PO
  - Cross-check qty fisik vs PO
  - Auto-update stok
  - Delivery order (jika perlu)

[3.4] Stock Opname
  - Periodic physical stock check
  - Selisih stok sistem vs fisik → adjustment dengan alasan
  - Histori adjustment

[3.5] Warehouse Approval Flow (dari diskusi)
  - WO requiring stock → warehouse check
  - Stok ada → Confirm → In Progress
  - Stok tidak ada → stuck di Draft
```

### Phase 4: Invoice & Pembayaran (Hari 22-26)

```
[4.1] Invoice Generation
  - Auto-generate dari WO yang selesai
  - Items: biaya jasa + sparepart terpakai + diskon
  - Partial payment support (DP + pelunasan)
  - Histori pembayaran per invoice

[4.2] Discount Handling (dari diskusi)
  - Diskon internal (tidak tampil di invoice pelanggan)
  - Finance akui diskon sebagai expense
  - Pengeluaran ke instansi tercatat

[4.3] Payment Verification
  - Finance verifikasi pembayaran
  - Auto-jurnal: Kas vs Pendapatan
  - Update piutang jika pembayaran kredit
```

### Phase 5: Finance & Accounting (Hari 27-35)

```
[5.1] Double-Entry Jurnal
  - Setiap transaksi otomatis generate jurnal
  - Accounts: Kas, Piutang, Hutang, Pendapatan, Beban, Ekuitas

[5.2] Accounts Receivable (AR)
  - Piutang dari pelanggan korporat/wholesale
  - Aging report
  - Jatuh tempo tracking

[5.3] Accounts Payable (AP)
  - Hutang ke supplier dari PO
  - Jatuh tempo supplier
  - Histori pelunasan

[5.4] Laporan Keuangan
  - Neraca (Aset, Liabilitas, Ekuitas)
  - Laba Rugi (Pendapatan, Beban, Laba Bersih)
  - Arus Kas (harian/mingguan/bulanan + proyeksi)
  - Export ke PDF / Excel

[5.5] Rekonsiliasi Bank
  - Import CSV/Excel mutasi bank
  - Auto-match dengan jurnal internal
  - Manual reconciliation untuk unmatched

[5.6] Integrasi Coretax
  - Mapping invoice → faktur pajak keluaran
  - Export CSV/Excel siap upload ke Coretax DJP

[5.7] Anggaran vs Realisasi (dari diskusi)
  - Nilai kontrak per project/customer
  - Tracking realisasi expense per project
  - Dashboard anggaran vs realisasi (mirip GAC-ERP)
```

### Phase 6: Dashboard & Reports (Hari 36-40)

```
[6.1] Dashboard Operasional
  - Total WO hari ini, dalam proses, selesai
  - Estimasi vs aktual biaya
  - Pendapatan harian
  - Stok kritis

[6.2] Dashboard Keuangan
  - Pendapatan bulanan
  - Piutang/hutang jatuh tempo
  - Arus kas
  - Laba bersih + comparison periode

[6.3] Laporan Operasional
  - Performa mekanik (WO selesai, jam kerja)
  - Servis terpopuler
  - Sparepart terpakai
  - Pendapatan per kategori jasa

[6.4] Export & Filter
  - Filter per periode
  - Export PDF / Excel
```

### Phase 7: Customer Portal & Extras (Hari 41-44)

```
[7.1] Customer Portal
  - Public link (via WhatsApp/email)
  - Cek status servis real-time
  - Histori servis per kendaraan
  - Download invoice

[7.2] WhatsApp Integration (opsional)
  - Notifikasi status WO ke pelanggan
  - Link ke customer portal
```

### Phase 8: UAT, Training & Deployment (Hari 45-48)

```
[8.1] User Acceptance Testing
[8.2] Training tim bengkel
[8.3] Deployment ke production
[8.4] Backup otomatis setup
```

---

## 5. RINGKASAN TIMELINE

| Fase | Durasi | Deliverable |
|------|--------|-------------|
| Phase 0: Setup | 3 hari | Project foundation, DB schema, auth |
| Phase 1: Master Data | 4 hari | User, Customer, Supplier, Sparepart CRUD |
| Phase 2: Estimasi & WO | 8 hari | ⭐ Core flow: Estimasi → WO → Dokumen |
| Phase 3: Inventory | 6 hari | Stock, PO, Goods Receipt, Stock Opname |
| Phase 4: Invoice | 5 hari | Invoice, Pembayaran, Discount handling |
| Phase 5: Finance | 9 hari | Jurnal, AR/AP, Laporan, Rekonsiliasi, Coretax |
| Phase 6: Dashboard | 5 hari | Dashboard + Reports + Export |
| Phase 7: Customer Portal | 4 hari | Public portal, optional WhatsApp |
| Phase 8: UAT & Deploy | 4 hari | Testing, training, go-live |
| **TOTAL** | **~48 hari** | **~10 minggu** |

---

## 6. CATATAN DARI DISKUSI YANG PERLU DIPERHATIKAN

1. **Turboly Reference**: UX Service Orders harus mirip Turboly — perlu lihat Turboly langsung untuk detail layout
2. **Warehouse Approval Flow**: WO stuck di Draft kalau stok habis — ini flow khusus yang beda dari PRD asli
3. **Discount Internal**: Diskon tidak tampil di invoice pelanggan, tapi Finance harus akui — perlu field terpisah
4. **Anggaran vs Realisasi**: Fitur tambahan di luar PRD asli, referensi GAC-ERP
5. **Customer Types**: Retail vs Wholesale — impact ke termin pembayaran dan AR
6. **Service Advisor (SA)**: Role tambahan di luar PRD (Frontdesk = SA?)

---

*Document generated: 24 Juni 2026*
*Status: Draft — menunggu review & approval*
