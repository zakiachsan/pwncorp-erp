# Static Pages → API Integration Plan

> **Goal:** Convert all remaining static pages to real API data. Build new API routes where missing, wire up existing APIs to detail pages.

**Status:** 33 static pages remaining (20 need new APIs, 13 need existing API wiring)

---

## Phase 1: Detail Pages — Wire Existing APIs (13 pages, ~30 min)

Semua halaman ini udah punya `/api/xxx/[id]` route, tinggal ganti hardcoded data → `useParams()` + `fetch()`.

### Task 1.1: work-orders/[...no]/page.tsx
- **API:** `GET /api/work-orders/[id]` — returns WO with items, so, mekanik, invoices
- **File:** `src/app/work-orders/[...no]/page.tsx`
- Replace hardcoded WO data with `useParams().no` → `fetch(\`/api/work-orders/search?woNo=\${no}\`)` or fetch by id

### Task 1.2: products/[...sku]/page.tsx
- **API:** `GET /api/spareparts?search={sku}` → single item
- **File:** `src/app/products/[...sku]/page.tsx`
- Fetch sparepart by SKU, map to product detail UI

### Task 1.3: inventory/po/[no]/page.tsx
- **API:** `GET /api/purchase-orders?search={no}` or `GET /api/purchase-orders/[id]`
- **File:** `src/app/inventory/po/[no]/page.tsx`
- Map PO fields: poNo, supplier, date, items, status, total

### Task 1.4: inventory/stock-opname/new/page.tsx
- **File:** `src/app/inventory/stock-opname/new/page.tsx`
- Most likely a form — keep form structure, fetch sparepart list for dropdown

### Task 1.5: master-data/services/[code]/page.tsx
- **API:** `GET /api/services/[id]` (by SKU → search)
- **File:** `src/app/master-data/services/[code]/page.tsx`

### Task 1.6: master-data/users/page.tsx
- **API:** `GET /api/users` (already has list endpoint)
- **File:** `src/app/master-data/users/page.tsx`
- Was converted by subagent but may have issues — verify

### Task 1.7-1.13: Warehouse detail pages
Each maps to its existing API `[id]` route:
- `warehouse/purchase-deliveries/[...refCode]` → `/api/purchase-deliveries/[id]`
- `warehouse/purchase-invoices/[...docNumber]` → `/api/purchase-invoices/[id]`
- `warehouse/purchase-orders/[...refCode]` → `/api/purchase-orders/[id]`
- `warehouse/purchase-request/[...refCode]` → `/api/purchase-requests/[id]`
- `warehouse/stock-opname/[...refCode]` → `/api/stock-opnames/[id]`
- `warehouse/stock-transfer/[...refCode]` → `/api/stock-transfers/[id]`
- `stock-workflow/stock-orders/[...no]` → `/api/stock-orders/[id]`

---

## Phase 2: New API Routes + Pages (20 pages, ~2-3 hours)

### Task 2.1: `/api/projects` — CRUD
- **Schema check:** Verify `Project` model exists in Prisma schema
- **Routes needed:**
  - `GET /api/projects` — list with pagination, search, status filter
  - `GET /api/projects/[id]` — detail with SRO/SWO count
  - `POST /api/projects` — create
  - `PUT /api/projects/[id]` — update status
- **Pages to wire:**
  - `src/app/project/page.tsx` — project list
  - `src/app/project/[...id]/page.tsx` — project detail

### Task 2.2: `/api/purchase-returns` — CRUD
- **Schema check:** Verify `PurchaseReturn` model
- **Routes:** GET list, GET [id], POST, PUT status
- **Pages:**
  - `src/app/warehouse/purchase-returns/page.tsx`
  - `src/app/warehouse/purchase-returns/[...docNumber]/page.tsx`

### Task 2.3: `/api/stock-histories` — read-only
- **Schema check:** Verify `StockHistory` model (exists in seed)
- **Route:** `GET /api/stock-histories?sparepartId=&page=&limit=`
- **Pages:**
  - `src/app/warehouse/stock-histories/page.tsx`
  - `src/app/warehouse/stock-histories/[...id]/page.tsx`

### Task 2.4: Finance specialized APIs
- **`/api/reports/finance`** — already exists, check what it returns
- **`/api/reports/service`** — already exists
- **`/api/accounts-receivable`** — already exists → wire rencana-tagihan
- **SOA:** `/api/accounts-receivable?customerId=` could work
- **Receipts:** check if `/api/payments` can serve, or add `/api/receipts`
- **Accounting Reports:** may need custom aggregation

### Task 2.5: Reports pages (9 pages)
- Check existing `/api/reports/finance` and `/api/reports/service` response shapes
- Wire each report page to appropriate API
- If APIs don't return needed data, add query params

### Task 2.6: Anggaran & Pembanding
- These are likely comparison/planning views — may need custom aggregation from PO/SO data
- Check existing implementations, may reuse `/api/purchase-orders` with aggregation

---

## Phase 3: Verification
- `npm run build` — must pass clean
- Quick smoke test: click through each converted page, verify data loads
- Check no remaining `const fallback` or hardcoded data arrays
- Check browser console for fetch errors

---

## Priority Order
1. **Phase 1** (13 detail pages) — quick wins, APIs already exist
2. **Phase 2.1** (Project) — high visibility, simple CRUD
3. **Phase 2.2-2.3** (Returns + Histories) — simple CRUD
4. **Phase 2.4-2.5** (Finance specialized + Reports) — most complex
5. **Phase 2.6** (Anggaran + Pembanding) — lowest priority
