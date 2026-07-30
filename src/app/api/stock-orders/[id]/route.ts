import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const so = await prisma.stockOrder.findUnique({
    where: { id: params.id },
    include: {
      wo: {
        select: {
          woNo: true,
          so: { select: { soNo: true, customer: { select: { name: true } } } },
        },
      },
      items: { include: { sparepart: { select: { sku: true, name: true, stockQty: true } } } },
    },
  });
  if (!so) return NextResponse.json({ error: "Stock order not found" }, { status: 404 });

  // Fetch warehouse-specific stock for each item
  const warehouse = so.warehouse;
  let itemsWithWarehouseStock = so.items;
  
  if (warehouse) {
    const warehouseObj = await prisma.warehouse.findFirst({
      where: { name: warehouse, storeId: so.storeId },
    });
    
    if (warehouseObj) {
      itemsWithWarehouseStock = await Promise.all(
        so.items.map(async (item: any) => {
          const ws = await prisma.warehouseStock.findUnique({
            where: {
              warehouseId_sparepartId: {
                warehouseId: warehouseObj.id,
                sparepartId: item.sparepartId,
              },
            },
          });
          return {
            ...item,
            sparepart: {
              ...item.sparepart,
              stockQty: ws?.qty ?? 0,
            },
          };
        })
      );
    }
  }

  return NextResponse.json({ data: { ...so, items: itemsWithWarehouseStock } });
});

export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { status, warehouse, action, items: bodyItems } = body;

  const existing = await prisma.stockOrder.findUnique({
    where: { id: params.id },
    include: { items: { include: { sparepart: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Stock order not found" }, { status: 404 });

  // Support action-based transitions
  let targetStatus = status;
  if (action === "confirm") targetStatus = "CONFIRMED";
  if (action === "warehouse_sent") targetStatus = "WAREHOUSE SENT";
  if (action === "receive") targetStatus = "RECEIVED";
  if (action === "cancel") targetStatus = "CANCELLED";

  // Validate status transition
  if (targetStatus) {
    const validTransitions: Record<string, string[]> = {
      "PENDING": ["CONFIRMED", "CANCELLED"],
      "Draft": ["CONFIRMED", "CANCELLED"],
      "DRAFT": ["CONFIRMED", "CANCELLED"],
      "CONFIRMED": ["WAREHOUSE SENT", "CANCELLED"],
      "WAREHOUSE SENT": ["RECEIVED", "CANCELLED"],
      "RECEIVED": [],
      "CANCELLED": [],
    };
    if (!validTransitions[existing.status]?.includes(targetStatus)) {
      return NextResponse.json({
        error: `Cannot transition from ${existing.status} to ${targetStatus}`,
      }, { status: 400 });
    }
  }

  // Update sentQty on items if provided (from review page)
  if (bodyItems && Array.isArray(bodyItems)) {
    for (const item of bodyItems) {
      if (item.id && item.sentQty !== undefined) {
        await prisma.stockOrderItem.update({
          where: { id: item.id },
          data: { sentQty: item.sentQty },
        });
      }
    }
  }

  // On WAREHOUSE SENT: deduct stock from source warehouse
  if (targetStatus === "WAREHOUSE SENT") {
    for (const item of existing.items) {
      const sentQty = item.sentQty || item.qty;
      if (sentQty > 0) {
        const sp = await prisma.sparepart.findUnique({ where: { id: item.sparepartId } });
        if (sp) {
          const qtyBefore = sp.stockQty;
          await prisma.sparepart.update({
            where: { id: item.sparepartId },
            data: { stockQty: { decrement: sentQty } },
          });
          await prisma.stockHistory.create({
            data: {
              sparepartId: item.sparepartId,
              storeId: existing.storeId,
              changeType: "out",
              qtyChange: sentQty,
              qtyBefore,
              qtyAfter: qtyBefore - sentQty,
              refDoc: "STO",
              refNo: existing.orderNo,
              date: new Date(),
            },
          });
        }
      }
    }
  }

  const updateData: any = {};
  if (targetStatus !== undefined) updateData.status = targetStatus;
  if (warehouse !== undefined) updateData.warehouse = warehouse;

  const so = await prisma.stockOrder.update({
    where: { id: params.id },
    data: updateData,
    include: {
      wo: { select: { woNo: true } },
      items: { include: { sparepart: { select: { sku: true, name: true, stockQty: true } } } },
    },
  });

  // Auto journal on RECEIVED: Persediaan (D) vs Hutang Usaha (K)
  if (targetStatus === "RECEIVED") {
    try {
      const persediaanCOA = await prisma.cOA.findFirst({ where: { code: "1300" } });
      const hutangCOA = await prisma.cOA.findFirst({ where: { code: "2100" } });
      if (persediaanCOA && hutangCOA) {
        let totalValue = 0;
        const details: any[] = [];
        for (const item of existing.items) {
          const sp = item.sparepart;
          const sentQty = item.sentQty || item.qty;
          const itemTotal = (sp?.buyPrice || 0) * sentQty;
          totalValue += itemTotal;
          if (itemTotal > 0) {
            details.push({
              coaId: persediaanCOA.id,
              description: `Persediaan ${sp?.name || sp?.sku || item.sparepartId} x${sentQty}`,
              debit: itemTotal,
              credit: 0,
            });
          }
        }
        if (totalValue > 0) {
          details.push({
            coaId: hutangCOA.id,
            description: `Hutang Pembelian ${so.orderNo}`,
            debit: 0,
            credit: totalValue,
          });
          // Generate JU number: JU-XXX/MM/YYYY
        const _now = new Date();
        const _mm = String(_now.getMonth() + 1).padStart(2, '0');
        const _yyyy = _now.getFullYear();
        const _dateSuffix = `/${_mm}/${_yyyy}`;
        const _lastJE = await prisma.journalEntry.findFirst({
          where: { jeNo: { startsWith: 'JU-' }, jeNo: { endsWith: _dateSuffix } },
          orderBy: { jeNo: 'desc' },
        });
        const _seq = _lastJE ? parseInt(_lastJE.jeNo.split('-')[1]?.split('/')[0] || '0') + 1 : 1;
        const jeNo = `JU-${String(_seq).padStart(3, '0')}${_dateSuffix}`;
          await prisma.journalEntry.create({
            data: {
              jeNo,
              date: new Date(),
              description: `Stock Order ${so.orderNo} diterima`,
              refType: "stock_order",
              refId: so.id,
              storeId: so.storeId,
              status: "Posted",
              createdById: user.id,
              details: { create: details },
            },
          });
        }
      }
    } catch (err) {
      console.error("Auto-journal (stock order received) failed:", err);
    }
  }

  return NextResponse.json({ data: so });
});
