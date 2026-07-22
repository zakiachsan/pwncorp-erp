import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const delivery = await prisma.purchaseDelivery.findUnique({
    where: { id: params.id },
    include: {
      po: { include: { supplier: true, items: true } },
      items: { include: { sparepart: { select: { sku: true, name: true, stockQty: true, code: true } } } },
    },
  });
  if (!delivery) return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
  return NextResponse.json({ data: delivery });
});

export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { action, notes, items } = body;

  const delivery = await prisma.purchaseDelivery.findUnique({
    where: { id: params.id },
    include: { items: true, po: { include: { items: true } } },
  });
  if (!delivery) return NextResponse.json({ error: "Delivery not found" }, { status: 404 });

  // ── CONFIRM RECEIVE ──
  if (action === "confirm") {
    if (delivery.status !== "Draft") {
      return NextResponse.json({ error: "Only Draft deliveries can be confirmed" }, { status: 400 });
    }

    // Update stock for each item
    for (const item of delivery.items) {
      if (item.qtyReceived > 0) {
        const sparepart = await prisma.sparepart.findUnique({ where: { id: item.sparepartId } });
        if (sparepart) {
          const qtyBefore = sparepart.stockQty;
          await prisma.sparepart.update({
            where: { id: item.sparepartId },
            data: { stockQty: { increment: item.qtyReceived } },
          });
          await prisma.stockHistory.create({
            data: {
              sparepartId: item.sparepartId,
              storeId: delivery.storeId,
              changeType: "in",
              qtyChange: item.qtyReceived,
              qtyBefore,
              qtyAfter: qtyBefore + item.qtyReceived,
              refDoc: "PD",
              refNo: delivery.deliveryNo,
              date: new Date(),
            },
          });
        }
      }
    }

    // Update delivery status
    await prisma.purchaseDelivery.update({
      where: { id: params.id },
      data: { status: "Received", receivedAt: new Date() },
    });

    // Check if PO is fully received → update PO status
    const allDeliveries = await prisma.purchaseDelivery.findMany({
      where: { poId: delivery.poId, status: "Received" },
      include: { items: true },
    });
    const totalReceivedMap: Record<string, number> = {};
    for (const d of allDeliveries) {
      for (const it of d.items) {
        totalReceivedMap[it.sparepartId] = (totalReceivedMap[it.sparepartId] || 0) + it.qtyReceived;
      }
    }
    const poItems = delivery.po.items;
    const allReceived = poItems.every((pi: any) => (totalReceivedMap[pi.sparepartId] || 0) >= pi.qty);
    const anyReceived = poItems.some((pi: any) => (totalReceivedMap[pi.sparepartId] || 0) > 0);

    if (allReceived) {
      await prisma.purchaseOrder.update({ where: { id: delivery.poId }, data: { status: "RECEIVED" } });
    } else if (anyReceived) {
      await prisma.purchaseOrder.update({ where: { id: delivery.poId }, data: { status: "PARTIAL" } });
    }

    const updated = await prisma.purchaseDelivery.findUnique({
      where: { id: params.id },
      include: { po: { select: { poNo: true, status: true } }, items: { include: { sparepart: { select: { sku: true, name: true } } } } },
    });
    return NextResponse.json({ data: updated });
  }

  // ── CANCEL ──
  if (action === "cancel") {
    if (delivery.status !== "Draft") {
      return NextResponse.json({ error: "Only Draft deliveries can be cancelled" }, { status: 400 });
    }
    await prisma.purchaseDelivery.update({
      where: { id: params.id },
      data: { status: "Cancelled" },
    });
    const updated = await prisma.purchaseDelivery.findUnique({
      where: { id: params.id },
      include: { po: { select: { poNo: true } }, items: { include: { sparepart: { select: { sku: true, name: true } } } } },
    });
    return NextResponse.json({ data: updated });
  }

  // ── EDIT (Draft only) ──
  if (delivery.status !== "Draft") {
    return NextResponse.json({ error: "Only Draft deliveries can be edited" }, { status: 400 });
  }

  const updateData: any = {};
  if (notes !== undefined) updateData.notes = notes;

  if (items !== undefined) {
    // Validate qty against PO
    for (const item of items) {
      const poItem = delivery.po.items.find((pi: any) => pi.sparepartId === item.sparepartId);
      if (poItem && item.qtyReceived > poItem.qty) {
        return NextResponse.json({ error: `Qty received cannot exceed ordered qty for ${item.sparepartId}` }, { status: 400 });
      }
    }
    await prisma.deliveryItem.deleteMany({ where: { deliveryId: params.id } });
    for (const item of items) {
      await prisma.deliveryItem.create({
        data: {
          deliveryId: params.id,
          sparepartId: item.sparepartId,
          qtyOrdered: item.qtyOrdered || 0,
          qtyReceived: item.qtyReceived || 0,
        },
      });
    }
  }

  const updated = await prisma.purchaseDelivery.update({
    where: { id: params.id },
    data: updateData,
    include: {
      po: { select: { poNo: true, supplier: { select: { companyName: true } } } },
      items: { include: { sparepart: { select: { sku: true, name: true, stockQty: true } } } },
    },
  });
  return NextResponse.json({ data: updated });
});
