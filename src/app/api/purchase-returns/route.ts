import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status");

  const where: any = { po: { storeId: user.storeId } };
  if (search) where.docNo = { contains: search, mode: "insensitive" };
  if (status) where.status = status;

  const [data, total] = await Promise.all([
    prisma.purchaseReturn.findMany({
      where,
      include: {
        po: { select: { id: true, poNo: true } },
        supplier: { select: { id: true, companyName: true } },
        items: { include: { sparepart: { select: { sku: true, name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.purchaseReturn.count({ where }),
  ]);

  return NextResponse.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const POST = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { poId, supplierId, returnType, warehouse, items, reason, date } = body;

  if (!poId) return NextResponse.json({ error: "Purchase Order is required" }, { status: 400 });
  if (!supplierId) return NextResponse.json({ error: "Supplier is required" }, { status: 400 });
  if (!items || !items.length) return NextResponse.json({ error: "Items are required" }, { status: 400 });

  // Validate PO
  const po = await prisma.purchaseOrder.findFirst({
    where: { id: poId, storeId: user.storeId },
    include: { items: true },
  });
  if (!po) return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });

  // Validate qty: return qty <= PO item qty
  for (const item of items) {
    const poItem = po.items.find((pi: any) => pi.sparepartId === item.sparepartId);
    if (poItem && item.qty > poItem.qty) {
      return NextResponse.json({ error: `Return qty exceeds PO qty for item ${item.sparepartId}` }, { status: 400 });
    }
  }

  const docNo = `PR/${new Date().toISOString().slice(2, 10).replace(/-/g, "")}/${String(Date.now()).slice(-4)}`;
  const total = items.reduce((sum: number, i: any) => sum + (i.qty * (i.unitPrice || 0)), 0);

  const ret = await prisma.purchaseReturn.create({
    data: {
      docNo,
      poId,
      supplierId,
      returnType: returnType || "Return",
      warehouse: warehouse || null,
      total,
      status: "Draft",
      reason: reason || null,
      date: date ? new Date(date) : new Date(),
      items: {
        create: items.map((i: any) => ({
          sparepartId: i.sparepartId,
          qty: i.qty || 0,
          unitPrice: i.unitPrice || 0,
          total: (i.qty || 0) * (i.unitPrice || 0),
        })),
      },
    },
    include: {
      po: { select: { id: true, poNo: true } },
      supplier: { select: { id: true, companyName: true } },
      items: { include: { sparepart: { select: { sku: true, name: true } } } },
    },
  });

  return NextResponse.json({ data: ret }, { status: 201 });
});
