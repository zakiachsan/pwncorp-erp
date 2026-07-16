import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";
import { generatePONumber } from "@/lib/numbering";

export const GET = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status");
  const supplierId = searchParams.get("supplierId");

  const where: any = { storeId: user.storeId };
  if (search) where.poNo = { contains: search, mode: "insensitive" };
  if (status) where.status = status;
  if (supplierId) where.supplierId = supplierId;

  const [data, total] = await Promise.all([
    prisma.purchaseOrder.findMany({
      where,
      include: {
        supplier: { select: { id: true, companyName: true } },
        _count: { select: { items: true, deliveries: true } },
      },
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.purchaseOrder.count({ where }),
  ]);

  return NextResponse.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const POST = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { supplierId, warehouse, dueAt, items, prId } = body;

  if (!supplierId || !items || !items.length) {
    return NextResponse.json({ error: "supplierId and items are required" }, { status: 400 });
  }

  // Validate supplier
  const supplier = await prisma.supplier.findFirst({ where: { id: supplierId, storeId: user.storeId } });
  if (!supplier) return NextResponse.json({ error: "Supplier not found" }, { status: 404 });

  const poNo = await generatePONumber(user.storeId);

  // Calculate total
  const poItems = items.map((i: any) => ({
    sparepartId: i.sparepartId,
    qty: i.qty,
    unitPrice: i.unitPrice || 0,
    total: i.qty * (i.unitPrice || 0),
  }));
  const total = poItems.reduce((sum: number, i: any) => sum + i.total, 0);

  const po = await prisma.purchaseOrder.create({
    data: {
      poNo,
      supplierId,
      storeId: user.storeId,
      warehouse: warehouse || null,
      dueAt: dueAt ? new Date(dueAt) : null,
      total,
      items: { create: poItems },
    },
    include: {
      supplier: { select: { id: true, companyName: true } },
      items: { include: { sparepart: { select: { sku: true, name: true } } } },
    },
  });

  // If PO created from PR, mark PR as approved
  if (prId) {
    await prisma.purchaseRequest.update({
      where: { id: prId },
      data: { status: "Approved" },
    });
  }

  return NextResponse.json({ data: po }, { status: 201 });
});
