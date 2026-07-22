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

  const where: any = { storeId: user.storeId };
  if (search) where.docNo = { contains: search, mode: "insensitive" };
  if (status) where.status = status;

  const [data, total] = await Promise.all([
    prisma.stockOutgoing.findMany({
      where,
      include: {
        items: { include: { sparepart: { select: { sku: true, name: true } } } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.stockOutgoing.count({ where }),
  ]);

  return NextResponse.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const POST = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { warehouse, notes, items } = body;

  if (!items || !items.length) {
    return NextResponse.json({ error: "items are required" }, { status: 400 });
  }

  const docNo = `SO/${new Date().toISOString().slice(2, 10).replace(/-/g, "")}/${String(Date.now()).slice(-4)}`;
  const total = items.reduce((sum: number, i: any) => sum + (i.qty || 0) * (i.unitPrice || 0), 0);

  const outgoing = await prisma.stockOutgoing.create({
    data: {
      docNo,
      storeId: user.storeId,
      warehouse: warehouse || null,
      notes: notes || null,
      total,
      items: {
        create: items.map((i: any) => ({
          sparepartId: i.sparepartId,
          qty: i.qty || 0,
          unitPrice: i.unitPrice || 0,
        })),
      },
    },
    include: {
      items: { include: { sparepart: { select: { sku: true, name: true } } } },
    },
  });

  return NextResponse.json({ data: outgoing }, { status: 201 });
});
