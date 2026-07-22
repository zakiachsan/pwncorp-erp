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
        items: { include: { sparepart: { select: { sku: true, name: true } } } },
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
  const { poId, items, notes } = body;

  if (!poId || !items || !items.length) {
    return NextResponse.json({ error: "poId and items are required" }, { status: 400 });
  }

  // Validate PO exists and is SENT
  const po = await prisma.purchaseOrder.findFirst({
    where: { id: poId, storeId: user.storeId },
    include: { items: true },
  });
  if (!po) return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });
  if (po.status !== "SENT") {
    return NextResponse.json({ error: `PO must be in SENT status to create delivery. Current: ${po.status}` }, { status: 400 });
  }

  const deliveryNo = await generateDeliveryNumber(user.storeId);

  // Calculate already-received qty from previous deliveries
  const prevDeliveries = await prisma.purchaseDelivery.findMany({
    where: { poId, status: { in: ["Draft", "Received"] } },
    include: { items: true },
  });
  const receivedMap: Record<string, number> = {};
  for (const pd of prevDeliveries) {
    for (const it of pd.items) {
      receivedMap[it.sparepartId] = (receivedMap[it.sparepartId] || 0) + it.qtyReceived;
    }
  }

  // Validate qty: received <= ordered - already received
  for (const item of items) {
    const poItem = po.items.find((pi: any) => pi.sparepartId === item.sparepartId);
    if (!poItem) continue;
    const alreadyReceived = receivedMap[item.sparepartId] || 0;
    const maxQty = poItem.qty - alreadyReceived;
    if (item.qtyReceived > maxQty) {
      return NextResponse.json({
        error: `Qty received for ${item.sparepartId} exceeds remaining (${maxQty}). Already received: ${alreadyReceived}, ordered: ${poItem.qty}`,
      }, { status: 400 });
    }
  }

  const delivery = await prisma.purchaseDelivery.create({
    data: {
      deliveryNo,
      poId,
      storeId: user.storeId,
      status: "Draft",
      notes: notes || null,
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

  return NextResponse.json({ data: delivery }, { status: 201 });
});
