import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";
import { generateDeliveryNumber } from "@/lib/numbering";

export const GET = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status");
  const poId = searchParams.get("poId");

  const where: any = { storeId: user.storeId };
  if (search) where.deliveryNo = { contains: search, mode: "insensitive" };
  if (status) where.status = status;
  if (poId) where.poId = poId;

  const [data, total] = await Promise.all([
    prisma.purchaseDelivery.findMany({
      where,
      include: {
        po: { select: { poNo: true, supplier: { select: { companyName: true } } } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.purchaseDelivery.count({ where }),
  ]);

  return NextResponse.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const POST = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { poId, items, receivedAt } = body;

  if (!poId || !items || !items.length) {
    return NextResponse.json({ error: "poId and items are required" }, { status: 400 });
  }

  // Validate PO
  const po = await prisma.purchaseOrder.findFirst({
    where: { id: poId, storeId: user.storeId },
    include: { items: true },
  });
  if (!po) return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });

  const deliveryNo = await generateDeliveryNumber(user.storeId);

  const delivery = await prisma.purchaseDelivery.create({
    data: {
      deliveryNo,
      poId,
      storeId: user.storeId,
      receivedAt: receivedAt ? new Date(receivedAt) : new Date(),
      items: {
        create: items.map((i: any) => ({
          sparepartId: i.sparepartId,
          qtyOrdered: i.qtyOrdered || 0,
          qtyReceived: i.qtyReceived || 0,
        })),
      },
    },
    include: {
      po: { select: { poNo: true } },
      items: { include: { sparepart: { select: { sku: true, name: true } } } },
    },
  });

  // Auto-update stock and PO status
  if (receivedAt || true) {  // Immediately received
    for (const item of items) {
      const received = item.qtyReceived || 0;
      if (received > 0) {
        // Update sparepart stock
        const sparepart = await prisma.sparepart.findUnique({ where: { id: item.sparepartId } });
        if (sparepart) {
          const qtyBefore = sparepart.stockQty;
          await prisma.sparepart.update({
            where: { id: item.sparepartId },
            data: { stockQty: { increment: received } },
          });
          // Stock history
          await prisma.stockHistory.create({
            data: {
              sparepartId: item.sparepartId,
              storeId: user.storeId,
              changeType: "in",
              qtyChange: received,
              qtyBefore,
              qtyAfter: qtyBefore + received,
              refDoc: "DO",
              refNo: deliveryNo,
              date: new Date(),
            },
          });
        }
      }
    }
    // Update delivery + PO status
    await prisma.purchaseDelivery.update({
      where: { id: delivery.id },
      data: { status: "Received" },
    });
    await prisma.purchaseOrder.update({
      where: { id: poId },
      data: { status: "RECEIVED" },
    });
  }

  return NextResponse.json({ data: delivery }, { status: 201 });
});
