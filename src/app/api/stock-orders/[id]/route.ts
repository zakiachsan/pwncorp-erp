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
  return NextResponse.json({ data: so });
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

  return NextResponse.json({ data: so });
});
