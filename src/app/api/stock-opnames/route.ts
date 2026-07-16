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
  if (search) where.refCode = { contains: search, mode: "insensitive" };
  if (status) where.status = status;

  const [data, total] = await Promise.all([
    prisma.stockOpname.findMany({
      where,
      include: { _count: { select: { items: true } } },
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.stockOpname.count({ where }),
  ]);

  return NextResponse.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const POST = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { warehouse, items } = body;

  if (!items || !items.length) {
    return NextResponse.json({ error: "items are required" }, { status: 400 });
  }

  const refCode = `OPN/${new Date().toISOString().slice(2, 10).replace(/-/g, "")}/${String(Date.now()).slice(-4)}`;

  const opname = await prisma.stockOpname.create({
    data: {
      refCode,
      storeId: user.storeId,
      warehouse: warehouse || null,
      items: {
        create: items.map((i: any) => ({
          sparepartId: i.sparepartId,
          systemQty: i.systemQty || 0,
          physicalQty: i.physicalQty || 0,
          adjustment: (i.physicalQty || 0) - (i.systemQty || 0),
          reason: i.reason,
        })),
      },
    },
    include: {
      items: { include: { sparepart: { select: { sku: true, name: true } } } },
    },
  });

  return NextResponse.json({ data: opname }, { status: 201 });
});
