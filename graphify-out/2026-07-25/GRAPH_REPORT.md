# Graph Report - pwncorp  (2026-07-25)

## Corpus Check
- 279 files · ~224,426 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1457 nodes · 1759 edges · 218 communities (155 shown, 63 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.52)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `01a76d4c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- generate_reports.py
- numbering.ts
- devDependencies
- AppShell.tsx
- dependencies
- PwnCorp ERP — Rencana Integrasi End-to-End (DB + Backend)
- 4. DEVELOPMENT PLAN
- compilerOptions
- prisma.ts
- getCurrentUser
- withAuth
- expand_data.py
- auth-helpers.ts
- Phase 1: Detail Pages — Wire Existing APIs (13 pages, ~30 min)
- coa/page.tsx
- Component Patterns
- app/dashboard/page.tsx
- reports/ar/page.tsx
- service-orders/new/page.tsx
- DateRangePicker.tsx
- request-payment/page.tsx
- soa/[...refCode]/page.tsx
- work-orders/[...no]/page.tsx
- reports/ap/page.tsx
- navigation.js
- service/page.tsx
- customers/new/page.tsx
- accounting-reports/page.tsx
- vehicles/new/page.tsx
- daily-service-payments/page.tsx
- PwnCorp ERP — QA Report
- rencana-tagihan/page.tsx
- inventory/[code]/page.tsx
- purchase-returns/[...docNumber]/page.tsx
- tree/page.tsx
- payments/[no]/page.tsx
- products/[...sku]/page.tsx
- project/[...id]/page.tsx
- project/page.tsx
- detailed-service-orders/page.tsx
- service-orders/[...no]/page.tsx
- service-packages/[...sku]/page.tsx
- anggaran/page.tsx
- invoices/[...no]/page.tsx
- service/[...no]/page.tsx
- petty-cash/page.tsx
- reports/page.tsx
- po/page.tsx
- inventory/stock-opname/new/page.tsx
- customers/[id]/page.tsx
- sparepart/[code]/page.tsx
- detailed-service-invoices/page.tsx
- detailed-service-work-orders/page.tsx
- service-payment-received/page.tsx
- service-payment-type-info/page.tsx
- summary-service-invoices/page.tsx
- summary-service-orders/page.tsx
- summary-service-work-orders/page.tsx
- stock-orders/[...no]/page.tsx
- purchase-orders/[...refCode]/page.tsx
- stock-histories/[...id]/page.tsx
- stock-outgoing/[...refCode]/page.tsx
- stock-transfer/[...refCode]/page.tsx
- purchase/page.tsx
- finance/page.tsx
- ap-aging/page.tsx
- ap-cheque/page.tsx
- ap-credit/page.tsx
- ap-overdue/page.tsx
- ap-overlimit/page.tsx
- ap-payments/page.tsx
- ap-subledger/page.tsx
- ar-aging/page.tsx
- ar-cheque/page.tsx
- ar-credit/page.tsx
- ar-overdue/page.tsx
- ar-overlimit/page.tsx
- ar-payments/page.tsx
- ar-subledger/page.tsx
- summary-ar-ap/page.tsx
- tax-invoices/page.tsx
- po/[no]/page.tsx
- users/page.tsx
- [plate]/edit/page.tsx
- purchase-deliveries/[...refCode]/page.tsx
- purchase-request/[...refCode]/page.tsx
- stock-histories/page.tsx
- stock-opname/[...refCode]/page.tsx
- work-orders/page.tsx
- seed.ts
- users/[id]/route.ts
- finance/ap/page.tsx
- finance/ar/page.tsx
- payables/page.tsx
- receivables/page.tsx
- approval/page.tsx
- receipts/page.tsx
- aging-ap/page.tsx
- cash-flow/page.tsx
- soa/page.tsx
- transfers/page.tsx
- inventory/[code]/edit/page.tsx
- inventory/new/page.tsx
- inventory/page.tsx
- po/new/page.tsx
- inventory/stock-opname/page.tsx
- app/layout.tsx
- suppliers/[id]/page.tsx
- [plate]/page.tsx
- summary-purchase-orders/page.tsx
- summary-purchase-returns/page.tsx
- stock-workflow/stock-orders/page.tsx
- purchase-invoices/[...docNumber]/page.tsx
- warehouse/stock-opname/new/page.tsx
- customers/[id]/route.ts
- invoices/[id]/route.ts
- service-orders/[id]/route.ts
- service-packages/[id]/route.ts
- services/[id]/route.ts
- spareparts/[id]/route.ts
- users/route.ts
- vehicles/[id]/route.ts
- coa/[code]/page.tsx
- invoices/create/page.tsx
- invoices/page.tsx
- journal/create/page.tsx
- journal/page.tsx
- history/page.tsx
- payments/page.tsx
- aging-ar/page.tsx
- customers/page.tsx
- master-data/page.tsx
- services/[code]/page.tsx
- services/page.tsx
- sparepart/page.tsx
- suppliers/page.tsx
- users/[id]/page.tsx
- vehicles/page.tsx
- products/page.tsx
- summary-purchase-deliveries/page.tsx
- service-packages/page.tsx
- purchase-orders/new/page.tsx
- purchase-orders/page.tsx
- purchase-request/new/page.tsx
- stock-transfer/new/page.tsx
- customers/route.ts
- journal/[id]/route.ts
- journal/route.ts
- payment-requests/[id]/route.ts
- payment-requests/route.ts
- petty-cash/route.ts
- purchase-returns/[id]/route.ts
- purchase-returns/route.ts
- receipts/route.ts
- finance/route.ts
- service-packages/route.ts
- services/route.ts
- stock-opnames/route.ts
- stock-orders/[id]/route.ts
- vehicles/route.ts
- work-orders/[id]/route.ts
- finance/dashboard/page.tsx
- journal/[no]/page.tsx
- products/new/page.tsx
- project/new/page.tsx
- stock-movement/page.tsx
- stock-position/page.tsx
- stock-orders/new/page.tsx
- stock-returns/page.tsx
- pembanding/page.tsx
- purchase-deliveries/new/page.tsx
- purchase-invoices/page.tsx
- purchase-request/page.tsx
- purchase-returns/new/page.tsx
- purchase-returns/page.tsx
- stock-outgoing/new/page.tsx
- work-orders/new/page.tsx
- next.config.js
- next-env.d.ts
- middleware.ts

## God Nodes (most connected - your core abstractions)
1. `withAuth()` - 66 edges
2. `getCurrentUser()` - 61 edges
3. `fmt()` - 20 edges
4. `fmt_rp()` - 19 edges
5. `make_date()` - 17 edges
6. `compilerOptions` - 15 edges
7. `AppShell()` - 13 edges
8. `PwnCorp ERP — Rencana Integrasi End-to-End (DB + Backend)` - 11 edges
9. `generateDocNumber()` - 10 edges
10. `4. DEVELOPMENT PLAN` - 10 edges

## Surprising Connections (you probably didn't know these)
- `DashboardPage()` --indirect_call--> `ClipboardList()`  [INFERRED]
  src/app/dashboard/page.tsx → src/app/service-orders/page.tsx

## Import Cycles
- None detected.

## Communities (218 total, 63 thin omitted)

### Community 0 - "generate_reports.py"
Cohesion: 0.11
Nodes (39): cheque_date(), cheque_no(), cn_doc_ar(), disbursement_date(), doc_num_ap(), doc_num_inv_ap(), doc_num_inv_ir(), doc_num_ir() (+31 more)

### Community 1 - "numbering.ts"
Cohesion: 0.08
Nodes (27): GET, POST, GET, POST, GET, POST, GET, POST (+19 more)

### Community 2 - "devDependencies"
Cohesion: 0.06
Nodes (35): autoprefixer, eslint, eslint-config-next, @opennextjs/cloudflare, devDependencies, autoprefixer, eslint, eslint-config-next (+27 more)

### Community 3 - "AppShell.tsx"
Cohesion: 0.08
Nodes (6): AppShell(), financeGroups, NavItem, operasionalGroups, S, SidebarProps

### Community 4 - "dependencies"
Cohesion: 0.06
Nodes (31): bcryptjs, class-variance-authority, clsx, lucide-react, next, next-auth, dependencies, bcryptjs (+23 more)

### Community 5 - "PwnCorp ERP — Rencana Integrasi End-to-End (DB + Backend)"
Cohesion: 0.07
Nodes (26): 10. CATATAN PENTING, 1. STATUS SAAT INI, 2. ARSITEKTUR TEKNIS, 3.1 Master Data Module, 3.2 Operasional Module (Core Flow), 3.3 Inventory & Warehouse Module, 3.4 Finance & Accounting Module, 3.5 Project & Anggaran Module (+18 more)

### Community 6 - "4. DEVELOPMENT PLAN"
Cohesion: 0.08
Nodes (25): 1. SUMMARY PRD, 2. SUMMARY HASIL DISKUSI CLIENT, 3. TEKNOLOGI YANG DISARANKAN, 4. DEVELOPMENT PLAN, 5. RINGKASAN TIMELINE, 6. CATATAN DARI DISKUSI YANG PERLU DIPERHATIKAN, 6 Modul Utama, a. Service Orders (mirip Turboly) (+17 more)

### Community 7 - "compilerOptions"
Cohesion: 0.08
Nodes (25): dom, dom.iterable, esnext, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx (+17 more)

### Community 8 - "prisma.ts"
Cohesion: 0.08
Nodes (17): GET, PUT, GET, PUT, GET, PUT, GET, POST (+9 more)

### Community 9 - "getCurrentUser"
Cohesion: 0.08
Nodes (17): GET, POST, GET, GET, POST, GET, GET, GET (+9 more)

### Community 10 - "withAuth"
Cohesion: 0.08
Nodes (16): GET, PUT, GET, GET, PUT, GET, POST, GET (+8 more)

### Community 11 - "expand_data.py"
Cohesion: 0.21
Nodes (23): find_data_range(), fmt_rp(), gen_ap_account_payables(), gen_ap_aging(), gen_ap_cheque(), gen_ap_credit(), gen_ap_invoice_payables(), gen_ap_overdue() (+15 more)

### Community 12 - "auth-helpers.ts"
Cohesion: 0.10
Nodes (14): GET, handler, GET, POST, GET, PUT, GET, PUT (+6 more)

### Community 13 - "Phase 1: Detail Pages — Wire Existing APIs (13 pages, ~30 min)"
Cohesion: 0.11
Nodes (18): Phase 1: Detail Pages — Wire Existing APIs (13 pages, ~30 min), Phase 2: New API Routes + Pages (20 pages, ~2-3 hours), Phase 3: Verification, Priority Order, Static Pages → API Integration Plan, Task 1.1: work-orders/[...no]/page.tsx, Task 1.2: products/[...sku]/page.tsx, Task 1.3: inventory/po/[no]/page.tsx (+10 more)

### Community 14 - "coa/page.tsx"
Cohesion: 0.11
Nodes (16): actionBtn, COAEntry, Divisi, divisiOptions, initialCOA, initialDivisi, initialKatPengeluaran, inlineInput (+8 more)

### Community 15 - "Component Patterns"
Cohesion: 0.12
Nodes (15): 3-Column Info Cards (Detail Pages), Brand, Compact Field (F2), Component Patterns, CSS Utility Classes (globals.css), Form, Layout, Modals (+7 more)

### Community 16 - "app/dashboard/page.tsx"
Cohesion: 0.20
Nodes (12): DashboardData, DashboardPage(), fmt(), fmtDate(), fmtFull(), statusPill(), ClipboardList(), fmt() (+4 more)

### Community 17 - "reports/ar/page.tsx"
Cohesion: 0.18
Nodes (12): ARReportsPage(), ColDef, CUSTOMERS, ENTITIES, FilterField, fmtDate(), fmtNum(), num() (+4 more)

### Community 18 - "service-orders/new/page.tsx"
Cohesion: 0.13
Nodes (9): brandModels, Customer, emptyForm, S, Service, Sparepart, User, Vehicle (+1 more)

### Community 19 - "DateRangePicker.tsx"
Cohesion: 0.16
Nodes (8): DateRangePicker(), DateRangePickerProps, DAYS, fmtDate(), isSameDay(), MONTHS, MONTHS_LONG, PRESETS

### Community 20 - "request-payment/page.tsx"
Cohesion: 0.16
Nodes (9): divisiList, emptyForm, fmt(), FormData, kategoriList, PaymentRequest, RequestPaymentPage(), statusStyle() (+1 more)

### Community 21 - "soa/[...refCode]/page.tsx"
Cohesion: 0.18
Nodes (10): fmtRp(), hardcodedSoaData, invoiceStatusColor(), PrintView(), PS, PT, TODO: No dedicated API for SOA detail yet. Attempting to build from /api/account, S (+2 more)

### Community 22 - "work-orders/[...no]/page.tsx"
Cohesion: 0.22
Nodes (10): fmt(), fmtDate(), getWorkflowStepIndex(), S, statusColor(), toDateInput(), workflowSteps, WorkOrderDetailPage() (+2 more)

### Community 23 - "reports/ap/page.tsx"
Cohesion: 0.22
Nodes (10): APReportsPage(), ColDef, FilterField, fmtDate(), fmtNum(), num(), pick(), pickName() (+2 more)

### Community 24 - "navigation.js"
Cohesion: 0.38
Nodes (11): closeMobileSidebar(), init(), isMobile(), loadState(), openMobileSidebar(), saveState(), setCollapsed(), switchView() (+3 more)

### Community 25 - "service/page.tsx"
Cohesion: 0.21
Nodes (10): ApiInvoice, fmt(), fmtRp(), Invoice, PrintView(), PS, PT, S (+2 more)

### Community 26 - "customers/new/page.tsx"
Cohesion: 0.18
Nodes (4): brandModels, currentYear, vehicleBrands, years

### Community 27 - "accounting-reports/page.tsx"
Cohesion: 0.20
Nodes (5): ColDef, ENTITIES, FilterField, TabConfig, TABS

### Community 28 - "vehicles/new/page.tsx"
Cohesion: 0.20
Nodes (4): brandModels, currentYear, vehicleBrands, years

### Community 29 - "daily-service-payments/page.tsx"
Cohesion: 0.22
Nodes (8): DailyServicePaymentsPage(), fmt(), L, paymentColumns, TD, TD_RIGHT, TH, TH_RIGHT

### Community 30 - "PwnCorp ERP — QA Report"
Cohesion: 0.22
Nodes (8): Bugs Found & Fixed During QA, Executive Summary, Phase 1: API Endpoint Testing (36 endpoints), Phase 2: Frontend Page Testing (Browser), Phase 3: Data Integrity Audit, PwnCorp ERP — QA Report, Summary, Testing Notes

### Community 31 - "rencana-tagihan/page.tsx"
Cohesion: 0.25
Nodes (6): bulanLabels, CustomerBilling, data, fmt(), RencanaTagihanPage(), terminOptions

### Community 32 - "inventory/[code]/page.tsx"
Cohesion: 0.28
Nodes (6): changeTypeColor, changeTypeLabel, fmt(), fmtDate(), InventoryDetailPage(), S

### Community 33 - "purchase-returns/[...docNumber]/page.tsx"
Cohesion: 0.28
Nodes (5): fmtDate(), formatIDR(), PurchaseReturnDetailPage(), S, workflowSteps

### Community 34 - "tree/page.tsx"
Cohesion: 0.32
Nodes (5): AccountNode, AccountTreePage(), collectAllParentCodes(), getLevel1ParentCodes(), TreeNodeProps

### Community 35 - "payments/[no]/page.tsx"
Cohesion: 0.36
Nodes (5): fmt(), fmtDate(), PaymentDetailPage(), S, statusColor()

### Community 36 - "products/[...sku]/page.tsx"
Cohesion: 0.29
Nodes (6): fmt(), ProductDetailPage(), S, TabKey, tabLabels, tabList

### Community 37 - "project/[...id]/page.tsx"
Cohesion: 0.32
Nodes (6): fmtDate(), fmtRp(), ProjectDetailPage(), S, TabKey, tabList

### Community 38 - "project/page.tsx"
Cohesion: 0.39
Nodes (6): fmt(), fmtDate(), fmtShort(), ProjectListPage(), statusMap, statusPill()

### Community 39 - "detailed-service-orders/page.tsx"
Cohesion: 0.32
Nodes (6): DetailedServiceOrdersPage(), fmt(), L, statusPill(), TD, TH

### Community 40 - "service-orders/[...no]/page.tsx"
Cohesion: 0.32
Nodes (4): fmt(), S, ServicesTableEdit(), SparepartTableEdit()

### Community 41 - "service-packages/[...sku]/page.tsx"
Cohesion: 0.32
Nodes (6): fmt(), fmtDate(), PackageServiceDetailPage(), SS, tdStyle, thStyle

### Community 42 - "anggaran/page.tsx"
Cohesion: 0.32
Nodes (7): AnggaranPage(), AnggaranSWO, fmt(), fmtShort(), initialData, projects, TODO: Replace hardcoded data with API call when /api/anggaran endpoint is availa

### Community 43 - "invoices/[...no]/page.tsx"
Cohesion: 0.38
Nodes (4): fmt(), fmtDate(), InvoiceDetailPage(), S

### Community 44 - "service/[...no]/page.tsx"
Cohesion: 0.38
Nodes (4): fmt(), fmtDate(), S, ServiceInvoiceDetailPage()

### Community 45 - "petty-cash/page.tsx"
Cohesion: 0.33
Nodes (5): CashEntry, COA_CATEGORIES, EntryType, fmt(), PettyCashPage()

### Community 46 - "reports/page.tsx"
Cohesion: 0.29
Nodes (5): categories, categoryCardColors, CategoryId, ReportItem, reportsByCategory

### Community 47 - "po/page.tsx"
Cohesion: 0.38
Nodes (5): ApiPO, formatIDR(), PurchaseOrder, PurchaseOrdersPage(), statusPill()

### Community 48 - "inventory/stock-opname/new/page.tsx"
Cohesion: 0.33
Nodes (5): emptyRow(), NewStockOpnamePage(), OpnameRow, S, Sparepart

### Community 49 - "customers/[id]/page.tsx"
Cohesion: 0.29
Nodes (4): CustomerDetail, TD, TH, VehicleData

### Community 50 - "sparepart/[code]/page.tsx"
Cohesion: 0.38
Nodes (5): fmt(), fmtDate(), SparepartDetailPage(), typeColor, typeLabel

### Community 51 - "detailed-service-invoices/page.tsx"
Cohesion: 0.33
Nodes (5): DetailedServiceInvoicesPage(), fmt(), L, TD, TH

### Community 52 - "detailed-service-work-orders/page.tsx"
Cohesion: 0.33
Nodes (5): DetailedServiceWorkOrdersPage(), L, statusPill(), TD, TH

### Community 53 - "service-payment-received/page.tsx"
Cohesion: 0.33
Nodes (5): fmt(), L, ServicePaymentReceivedPage(), TD, TH

### Community 54 - "service-payment-type-info/page.tsx"
Cohesion: 0.33
Nodes (5): fmt(), L, ServicePaymentTypeInfoPage(), TD, TH

### Community 55 - "summary-service-invoices/page.tsx"
Cohesion: 0.33
Nodes (5): fmt(), L, SummaryServiceInvoicesPage(), TD, TH

### Community 56 - "summary-service-orders/page.tsx"
Cohesion: 0.33
Nodes (5): fmt(), linkStyle, SummaryServiceOrdersPage(), TD, TH

### Community 57 - "summary-service-work-orders/page.tsx"
Cohesion: 0.33
Nodes (5): L, statusPill(), SummaryServiceWorkOrdersPage(), TD, TH

### Community 58 - "stock-orders/[...no]/page.tsx"
Cohesion: 0.33
Nodes (4): fmtDate(), S, StockOrderDetailPage(), workflowSteps

### Community 59 - "purchase-orders/[...refCode]/page.tsx"
Cohesion: 0.48
Nodes (6): fmtDate(), formatIDR(), getStepIndex(), PurchaseOrderDetailPage(), statusColor(), workflowSteps

### Community 60 - "stock-histories/[...id]/page.tsx"
Cohesion: 0.38
Nodes (5): fmt(), fmtDate(), S, StockHistoryDetailPage(), workflowSteps

### Community 61 - "stock-outgoing/[...refCode]/page.tsx"
Cohesion: 0.38
Nodes (5): fmtDate(), formatIDR(), S, StockOutgoingDetailPage(), workflowSteps

### Community 62 - "stock-transfer/[...refCode]/page.tsx"
Cohesion: 0.33
Nodes (4): fmtDate(), S, StockTransferDetailPage(), workflowSteps

### Community 63 - "purchase/page.tsx"
Cohesion: 0.47
Nodes (4): fmt(), PurchaseInvoicesPage(), S, statusColor()

### Community 65 - "ap-aging/page.tsx"
Cohesion: 0.33
Nodes (4): btnStyle, cardStyle, h1Style, pStyle

### Community 66 - "ap-cheque/page.tsx"
Cohesion: 0.33
Nodes (4): btnStyle, cardStyle, h1Style, pStyle

### Community 67 - "ap-credit/page.tsx"
Cohesion: 0.33
Nodes (4): btnStyle, cardStyle, h1Style, pStyle

### Community 68 - "ap-overdue/page.tsx"
Cohesion: 0.33
Nodes (4): btnStyle, cardStyle, h1Style, pStyle

### Community 69 - "ap-overlimit/page.tsx"
Cohesion: 0.33
Nodes (4): btnStyle, cardStyle, h1Style, pStyle

### Community 70 - "ap-payments/page.tsx"
Cohesion: 0.33
Nodes (4): btnStyle, cardStyle, h1Style, pStyle

### Community 71 - "ap-subledger/page.tsx"
Cohesion: 0.33
Nodes (4): btnStyle, cardStyle, h1Style, pStyle

### Community 72 - "ar-aging/page.tsx"
Cohesion: 0.33
Nodes (4): btnStyle, cardStyle, h1Style, pStyle

### Community 73 - "ar-cheque/page.tsx"
Cohesion: 0.33
Nodes (4): btnStyle, cardStyle, h1Style, pStyle

### Community 74 - "ar-credit/page.tsx"
Cohesion: 0.33
Nodes (4): btnStyle, cardStyle, h1Style, pStyle

### Community 75 - "ar-overdue/page.tsx"
Cohesion: 0.33
Nodes (4): btnStyle, cardStyle, h1Style, pStyle

### Community 76 - "ar-overlimit/page.tsx"
Cohesion: 0.33
Nodes (4): btnStyle, cardStyle, h1Style, pStyle

### Community 77 - "ar-payments/page.tsx"
Cohesion: 0.33
Nodes (4): btnStyle, cardStyle, h1Style, pStyle

### Community 78 - "ar-subledger/page.tsx"
Cohesion: 0.33
Nodes (4): btnStyle, cardStyle, h1Style, pStyle

### Community 79 - "summary-ar-ap/page.tsx"
Cohesion: 0.33
Nodes (4): btnStyle, cardStyle, h1Style, pStyle

### Community 80 - "tax-invoices/page.tsx"
Cohesion: 0.33
Nodes (4): btnStyle, cardStyle, h1Style, pStyle

### Community 81 - "po/[no]/page.tsx"
Cohesion: 0.40
Nodes (4): ApiPODetail, formatIDR(), POData, PODetailPage()

### Community 82 - "users/page.tsx"
Cohesion: 0.33
Nodes (3): allMenus, tabOptions, UserEntry

### Community 83 - "[plate]/edit/page.tsx"
Cohesion: 0.33
Nodes (4): brandModels, currentYear, vehicleBrands, years

### Community 85 - "purchase-request/[...refCode]/page.tsx"
Cohesion: 0.40
Nodes (4): fmt(), PurchaseRequestDetailPage(), S, workflowSteps

### Community 86 - "stock-histories/page.tsx"
Cohesion: 0.47
Nodes (5): fmtDate(), handleTypeClick(), StockHistoriesPage(), typeOptions, warehouseOptions

### Community 88 - "work-orders/page.tsx"
Cohesion: 0.47
Nodes (4): fmtDate(), statusPill(), WorkOrder, WorkOrdersPage()

### Community 89 - "seed.ts"
Cohesion: 0.40
Nodes (3): adapter, pool, prisma

### Community 90 - "users/[id]/route.ts"
Cohesion: 0.40
Nodes (4): DELETE, GET, PUT, userSelect

### Community 91 - "finance/ap/page.tsx"
Cohesion: 0.60
Nodes (3): APPage(), fmt(), statusPill()

### Community 92 - "finance/ar/page.tsx"
Cohesion: 0.60
Nodes (3): ARPage(), fmt(), statusPill()

### Community 93 - "payables/page.tsx"
Cohesion: 0.60
Nodes (4): fmt(), InvoicePayablesPage(), S, statusColor()

### Community 94 - "receivables/page.tsx"
Cohesion: 0.60
Nodes (4): fmt(), InvoiceReceivablesPage(), S, statusColor()

### Community 95 - "approval/page.tsx"
Cohesion: 0.50
Nodes (3): ApprovalDeskPage(), fmt(), PaymentReq

### Community 97 - "aging-ap/page.tsx"
Cohesion: 0.50
Nodes (3): AgingAPPage(), AgingRow, fmt()

### Community 98 - "cash-flow/page.tsx"
Cohesion: 0.60
Nodes (3): CashFlowPage(), fmt(), fmtDate()

### Community 99 - "soa/page.tsx"
Cohesion: 0.50
Nodes (4): TODO: No dedicated API for SOA yet. Attempting to build from /api/accounts-recei, S, SOAPage(), statusColor()

### Community 100 - "transfers/page.tsx"
Cohesion: 0.60
Nodes (4): formatIDR(), statusPill(), Transfer, TransfersPage()

### Community 103 - "inventory/page.tsx"
Cohesion: 0.50
Nodes (3): formatRupiah(), InventoryPage(), Sparepart

### Community 104 - "po/new/page.tsx"
Cohesion: 0.50
Nodes (4): formatIDR(), ItemRow, NewPOPage(), VendorQuote

### Community 109 - "summary-purchase-orders/page.tsx"
Cohesion: 0.70
Nodes (4): fmt(), fmtDate(), pillClass(), SummaryPurchaseOrdersPage()

### Community 110 - "summary-purchase-returns/page.tsx"
Cohesion: 0.70
Nodes (4): fmt(), fmtDate(), pillClass(), SummaryPurchaseReturnsPage()

### Community 112 - "purchase-invoices/[...docNumber]/page.tsx"
Cohesion: 0.60
Nodes (4): formatIDR(), getStepIndex(), PurchaseInvoiceDetailPage(), workflowSteps

### Community 113 - "warehouse/stock-opname/new/page.tsx"
Cohesion: 0.50
Nodes (4): emptyRow(), NewStockOpnamePage(), OpnameRow, Sparepart

### Community 115 - "customers/[id]/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, GET, PUT

### Community 116 - "invoices/[id]/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, GET, PUT

### Community 117 - "service-orders/[id]/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, GET, PUT

### Community 118 - "service-packages/[id]/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, GET, PUT

### Community 119 - "services/[id]/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, GET, PUT

### Community 120 - "spareparts/[id]/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, GET, PUT

### Community 121 - "users/route.ts"
Cohesion: 0.50
Nodes (3): GET, POST, userSelect

### Community 122 - "vehicles/[id]/route.ts"
Cohesion: 0.50
Nodes (3): DELETE, GET, PUT

### Community 143 - "products/page.tsx"
Cohesion: 0.67
Nodes (3): formatRupiah(), Product, ProductsPage()

### Community 144 - "summary-purchase-deliveries/page.tsx"
Cohesion: 0.83
Nodes (3): fmtDate(), pillClass(), SummaryPurchaseDeliveriesPage()

### Community 145 - "service-packages/page.tsx"
Cohesion: 0.67
Nodes (3): formatRupiah(), ServicePackage, ServicePackagesPage()

### Community 146 - "purchase-orders/new/page.tsx"
Cohesion: 0.67
Nodes (3): formatIDR(), ItemRow, NewPurchaseOrderPage()

### Community 147 - "purchase-orders/page.tsx"
Cohesion: 0.83
Nodes (3): formatIDR(), PurchaseOrdersPage(), statusPill()

### Community 148 - "purchase-request/new/page.tsx"
Cohesion: 0.67
Nodes (3): formatIDR(), ItemRow, NewPurchaseRequestPage()

## Knowledge Gaps
- **563 isolated node(s):** `nextConfig`, `name`, `version`, `private`, `dev` (+558 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **63 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `withAuth()` connect `withAuth` to `numbering.ts`, `prisma.ts`, `getCurrentUser`, `auth-helpers.ts`, `customers/route.ts`, `journal/[id]/route.ts`, `journal/route.ts`, `payment-requests/[id]/route.ts`, `payment-requests/route.ts`, `petty-cash/route.ts`, `purchase-returns/[id]/route.ts`, `purchase-returns/route.ts`, `receipts/route.ts`, `finance/route.ts`, `service-packages/route.ts`, `services/route.ts`, `stock-opnames/route.ts`, `stock-orders/[id]/route.ts`, `vehicles/route.ts`, `work-orders/[id]/route.ts`, `users/[id]/route.ts`, `customers/[id]/route.ts`, `invoices/[id]/route.ts`, `service-orders/[id]/route.ts`, `service-packages/[id]/route.ts`, `services/[id]/route.ts`, `spareparts/[id]/route.ts`, `users/route.ts`, `vehicles/[id]/route.ts`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Why does `getCurrentUser()` connect `getCurrentUser` to `numbering.ts`, `prisma.ts`, `withAuth`, `auth-helpers.ts`, `customers/route.ts`, `journal/[id]/route.ts`, `journal/route.ts`, `payment-requests/[id]/route.ts`, `payment-requests/route.ts`, `petty-cash/route.ts`, `purchase-returns/[id]/route.ts`, `purchase-returns/route.ts`, `receipts/route.ts`, `finance/route.ts`, `service-packages/route.ts`, `services/route.ts`, `stock-opnames/route.ts`, `stock-orders/[id]/route.ts`, `vehicles/route.ts`, `work-orders/[id]/route.ts`, `users/[id]/route.ts`, `customers/[id]/route.ts`, `invoices/[id]/route.ts`, `service-orders/[id]/route.ts`, `service-packages/[id]/route.ts`, `services/[id]/route.ts`, `spareparts/[id]/route.ts`, `users/route.ts`, `vehicles/[id]/route.ts`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `nextConfig`, `name`, `version` to the rest of the system?**
  _563 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `generate_reports.py` be split into smaller, more focused modules?**
  _Cohesion score 0.11282051282051282 - nodes in this community are weakly interconnected._
- **Should `numbering.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07957957957957958 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._
- **Should `AppShell.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0773109243697479 - nodes in this community are weakly interconnected._