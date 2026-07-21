import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";
import { generateDocNumber } from "@/lib/numbering";

export const GET = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status");

  const where: any = { storeId: user.storeId };
  if (search) where.returnNo = { contains: search, mode: "insensitive" };
  if (status) where.status = status;

  const [data, total] = await Promise.all([
    prisma.stockReturn.findMany({
      where,
      include: {
        wo: { select: { woNo: true } },
        _count: { select: { items: true } },
      },
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.stockReturn.count({ where }),
  ]);

  return NextResponse.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const POST = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { woId, warehouse, reason, items } = body;

  if (!items || !items.length) {
    return NextResponse.json({ error: "items are required" }, { status: 400 });
  }

  if (woId) {
    const wo = await prisma.workOrder.findFirst({ where: { id: woId, storeId: user.storeId } });
    if (!wo) return NextResponse.json({ error: "Work order not found" }, { status: 404 });
  }

  const returnNo = await generateDocNumber("SRT", user.storeId, "stockReturn", "returnNo");

  const ret = await prisma.stockReturn.create({
    data: {
      returnNo,
      storeId: user.storeId,
      woId: woId || null,
      warehouse: warehouse || null,
      reason: reason || null,
      items: {
        create: items.map((i: any) => ({
          sparepartId: i.sparepartId,
          qty: i.qty,
        })),
      },
    },
    include: {
      wo: { select: { woNo: true } },
      items: { include: { sparepart: { select: { sku: true, name: true } } } },
    },
  });

  return NextResponse.json({ data: ret }, { status: 201 });
});
