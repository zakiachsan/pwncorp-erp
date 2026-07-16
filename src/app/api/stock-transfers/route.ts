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
  if (search) where.transferNo = { contains: search, mode: "insensitive" };
  if (status) where.status = status;

  const [data, total] = await Promise.all([
    prisma.stockTransfer.findMany({
      where,
      include: { _count: { select: { items: true } } },
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.stockTransfer.count({ where }),
  ]);

  return NextResponse.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const POST = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { fromWarehouse, toStore, items } = body;

  if (!fromWarehouse || !toStore || !items || !items.length) {
    return NextResponse.json({ error: "fromWarehouse, toStore, and items are required" }, { status: 400 });
  }

  const transferNo = `TRF/${fromWarehouse.slice(0, 3).toUpperCase()}/${String(Date.now()).slice(-6)}`;

  const transfer = await prisma.stockTransfer.create({
    data: {
      transferNo,
      storeId: user.storeId,
      fromWarehouse,
      toStore,
      items: {
        create: items.map((i: any) => ({
          sparepartId: i.sparepartId,
          qty: i.qty,
        })),
      },
    },
    include: {
      items: { include: { sparepart: { select: { sku: true, name: true } } } },
    },
  });

  return NextResponse.json({ data: transfer }, { status: 201 });
});
