# Service Order Changes Tab — Activity Log

## Goal
Tab "Changes" di halaman Service Order detail (`/service-orders/[...no]`) menampilkan riwayat semua perubahan yang terkait SO tersebut — termasuk perubahan pada SO itu sendiri, Work Orders, Invoices, Payments, dan Stock Orders.

## Current State
- Model `ActivityLog` sudah ada di schema (id, userId, action, entity, entityId, details, timestamp)
- Table `activity_logs` sudah ada di DB
- Belum ada kode yang memakai ActivityLog — tab Changes hanya placeholder "Riwayat perubahan belum tersedia."

## Data Flow (what triggers a log)
```
SO created          → log SO_CREATED
SO status change    → log SO_STATUS_CHANGED (Draft→Diagnosis→Approved)
SO field edit       → log SO_UPDATED (customer, vehicle, complaint, etc.)
SO inspection edit  → log SO_INSPECTION_UPDATED
SO services edit    → log SO_SERVICES_UPDATED
SO spareparts edit  → log SO_SPAREPARTS_UPDATED
WO created          → log WO_CREATED (linked via soId)
WO status change    → log WO_STATUS_CHANGED
Invoice created     → log INVOICE_CREATED (linked via WO→SO)
Payment received    → log PAYMENT_RECEIVED (linked via Invoice→WO→SO)
```

## Implementation Plan

### Step 1: Activity Log Helper
**File**: `src/lib/activity-log.ts` (new)

```ts
export async function logActivity(opts: {
  userId?: string;
  action: string;       // e.g. "SO_CREATED", "SO_STATUS_CHANGED"
  entity: string;       // e.g. "ServiceOrder", "WorkOrder"
  entityId: string;     // the entity's ID
  details?: string;     // JSON string with before/after or description
}) { ... }
```

Uses `prisma.activityLog.create()`. Simple, no magic.

### Step 2: Log SO mutations in `src/app/api/service-orders/[id]/route.ts`
- **PUT**: Compare `existing` vs updated values, log each type of change:
  - Status change → `SO_STATUS_CHANGED` with `{from, to}`
  - Field edits → `SO_UPDATED` with changed fields
  - Inspection items → `SO_INSPECTION_UPDATED`
  - Services → `SO_SERVICES_UPDATED` with before/after counts
  - Spareparts → `SO_SPAREPARTS_UPDATED` with before/after counts
- **DELETE**: Log `SO_CANCELLED`

### Step 3: Log SO creation in `src/app/api/service-orders/route.ts`
- **POST**: Log `SO_CREATED` with `{soNo, customerName, vehiclePlate}`

### Step 4: Log WO creation in `src/app/api/work-orders/route.ts`
- **POST**: Log `WO_CREATED` with `{woNo, mekanikName, itemCount}` — entity=WorkOrder, but also store `soId` in details for linking

### Step 5: Log Invoice creation in `src/app/api/invoices/route.ts`
- **POST**: Log `INVOICE_CREATED` with `{invNo, total}` — details include soId (via WO)

### Step 6: Log Payment in `src/app/api/payments/route.ts`
- **POST**: Log `PAYMENT_RECEIVED` with `{amount, method}` — details include invoice/so linkage

### Step 7: New API endpoint for fetching changes
**File**: `src/app/api/service-orders/[id]/changes/route.ts` (new)

```ts
GET /api/service-orders/[id]/changes
```

Query strategy:
1. Get the SO ID
2. Get all WO IDs for this SO
3. Get all Invoice IDs for those WOs
4. Fetch ActivityLog where:
   - `entity = "ServiceOrder" AND entityId = soId`, OR
   - `entity = "WorkOrder" AND entityId IN woIds`, OR
   - `details` contains the soId/woId/invNo (for invoices/payments)
5. Order by timestamp DESC

### Step 8: Update frontend Changes tab
**File**: `src/app/service-orders/[...no]/page.tsx`

Replace the placeholder with:
- Fetch `/api/service-orders/${id}/changes` on tab click
- Display as a timeline/list with:
  - Timestamp (relative + absolute)
  - User name (who made the change)
  - Action badge (color-coded: green=create, blue=update, red=cancel)
  - Description (human-readable from `details` JSON)

### UI Design (matches existing style — inline styles, no Tailwind)
```
┌─────────────────────────────────────────────────┐
│ ● SO Created                     22 Jul 2026 10:00│
│   Angga Novianto — SRO/WM/2607002 dibuat         │
│                                                   │
│ ● Status: Draft → Diagnosis      22 Jul 2026 10:05│
│   Angga Novianto                                    │
│                                                   │
│ ● Work Order Created             22 Jul 2026 10:10│
│   Angga Novianto — WO/WM/2607001, 3 items         │
│                                                   │
│ ● Services Updated               22 Jul 2026 11:00│
│   Angga Novianto — 2 → 3 services                  │
└─────────────────────────────────────────────────┘
```

## Files to Create/Modify
| File | Action |
|------|--------|
| `src/lib/activity-log.ts` | CREATE — helper |
| `src/app/api/service-orders/route.ts` | MODIFY — add log on POST |
| `src/app/api/service-orders/[id]/route.ts` | MODIFY — add log on PUT/DELETE |
| `src/app/api/work-orders/route.ts` | MODIFY — add log on POST |
| `src/app/api/invoices/route.ts` | MODIFY — add log on POST |
| `src/app/api/payments/route.ts` | MODIFY — add log on POST |
| `src/app/api/service-orders/[id]/changes/route.ts` | CREATE — fetch endpoint |
| `src/app/service-orders/[...no]/page.tsx` | MODIFY — wire up Changes tab |

## No Schema Changes Needed
ActivityLog model already has everything we need. No migration required.

## Verification
1. Create a new SO → check Changes tab shows "SO Created"
2. Edit SO fields → check Changes tab shows field changes
3. Change SO status → check status change logged
4. Create WO from SO → check WO creation appears
5. Create Invoice → check Invoice creation appears
6. All entries show correct timestamp, user name, and description
