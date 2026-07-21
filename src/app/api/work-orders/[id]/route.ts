import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const wo = await prisma.workOrder.findUnique({
    where: { id: params.id },
    include: {
      so: {
        include: {
          customer: true,
          vehicle: true,
          sa: { select: { id: true, name: true } },
          spareparts: { include: { sparepart: true } },
          services: { include: { service: true } },
        },
      },
      mekanik: { select: { id: true, name: true } },
      items: true,
      invoices: { include: { payments: true } },
      stockOrders: true,
    },
  });
  if (!wo) return NextResponse.json({ error: "Work order not found" }, { status: 404 });

  // Enrich items with sparepart/service details
  const enrichedItems = await Promise.all(
    (wo.items || []).map(async (item) => {
      if (item.itemType === "sparepart") {
        const sp = await prisma.sparepart.findUnique({
          where: { id: item.itemId },
          select: { sku: true, name: true, code: true, sellPrice: true },
        });
        return { ...item, sku: sp?.sku || null, code: sp?.code || null, sparepartName: sp?.name || null };
      }
      if (item.itemType === "service") {
        const svc = await prisma.service.findUnique({
          where: { id: item.itemId },
          select: { sku: true, name: true },
        });
        return { ...item, sku: svc?.sku || null, code: null, sparepartName: svc?.name || null };
      }
      return item;
    })
  );

  return NextResponse.json({ data: { ...wo, items: enrichedItems } });
});

export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { status, mekanikId, startDate, targetDate, items } = body;

  const existing = await prisma.workOrder.findUnique({
    where: { id: params.id },
    include: { items: true },
  });
  if (!existing) return NextResponse.json({ error: "Work order not found" }, { status: 404 });

  // Validate status transition
  if (status) {
    const validTransitions: Record<string, string[]> = {
      "Draft": ["In Progress", "Waiting Stock", "Cancelled"],
      "Waiting Stock": ["In Progress", "Confirmed", "Cancelled"],
      "Confirmed": ["In Progress", "Cancelled"],
      "In Progress": ["QC", "Cancelled"],
      "QC": ["Completed", "In Progress"],
      "Completed": [],
      "Cancelled": [],
    };
    if (!validTransitions[existing.status]?.includes(status)) {
      return NextResponse.json({
        error: `Cannot transition from ${existing.status} to ${status}`,
      }, { status: 400 });
    }

    // Stock check when confirming
    if (status === "Confirmed") {
      const sparepartItems = existing.items.filter(i => i.itemType === "sparepart");
      for (const item of sparepartItems) {
        const sparepart = await prisma.sparepart.findUnique({ where: { id: item.itemId } });
        if (!sparepart) continue;
        if (sparepart.stockQty < item.qty && sparepart.isTracking) {
          // Auto-transition to Waiting Stock if insufficient
          await prisma.workOrder.update({
            where: { id: params.id },
            data: { status: "Waiting Stock" },
          });
          return NextResponse.json({
            error: `Insufficient stock for ${sparepart.name}: need ${item.qty}, have ${sparepart.stockQty}. Status set to Waiting Stock.`,
          }, { status: 400 });
        }
      }
    }

    // Auto-deduct stock when moving to In Progress (mekanik starts working)
    if (status === "In Progress" && existing.status === "Confirmed") {
      const sparepartItems = existing.items.filter(i => i.itemType === "sparepart");
      for (const item of sparepartItems) {
        await prisma.sparepart.update({
          where: { id: item.itemId },
          data: { stockQty: { decrement: item.qty } },
        });
        // Log stock history
        await prisma.stockHistory.create({
          data: {
            sparepartId: item.itemId,
            storeId: user.storeId,
            changeType: "out",
            qtyChange: item.qty,
            qtyBefore: (await prisma.sparepart.findUnique({ where: { id: item.itemId } }))!.stockQty + item.qty,
            qtyAfter: (await prisma.sparepart.findUnique({ where: { id: item.itemId } }))!.stockQty,
            refDoc: "WO",
            refNo: existing.woNo,
            date: new Date(),
          },
        });
      }
    }
  }

  const updateData: any = {};
  if (status !== undefined) updateData.status = status;
  if (mekanikId !== undefined) updateData.mekanikId = mekanikId;
  if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
  if (targetDate !== undefined) updateData.targetDate = targetDate ? new Date(targetDate) : null;

  // Handle items replacement
  if (items !== undefined) {
    await prisma.wOItem.deleteMany({ where: { woId: params.id } });
    for (const item of items) {
      await prisma.wOItem.create({
        data: {
          woId: params.id,
          itemType: item.itemType,
          itemId: item.itemId || "",
          itemName: item.itemName || "",
          qty: item.qty || 1,
          unitPrice: item.unitPrice || 0,
          total: (item.qty || 1) * (item.unitPrice || 0),
        },
      });
    }
  }

  const wo = await prisma.workOrder.update({
    where: { id: params.id },
    data: updateData,
    include: {
      so: { select: { soNo: true, customer: { select: { name: true } }, vehicle: { select: { plateNo: true } } } },
      mekanik: { select: { id: true, name: true } },
      items: true,
    },
  });

  return NextResponse.json({ data: wo });
});
