import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";
import { generateStockOrderNumber } from "@/lib/numbering";

export const GET = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status");
  const warehouse = searchParams.get("warehouse");

  const where: any = { storeId: user.storeId };
  if (search) where.orderNo = { contains: search, mode: "insensitive" };
  if (status) where.status = status;
  if (warehouse) where.warehouse = warehouse;

  const [data, total] = await Promise.all([
    prisma.stockOrder.findMany({
      where,
      include: {
        wo: { select: { woNo: true } },
        _count: { select: { items: true } },
      },
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.stockOrder.count({ where }),
  ]);

  return NextResponse.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const POST = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { woId, warehouse, items } = body;

  if (!woId || !items || !items.length) {
    return NextResponse.json({ error: "woId and items are required" }, { status: 400 });
  }

  // Validate WO exists
  const wo = await prisma.workOrder.findFirst({
    where: { id: woId, storeId: user.storeId },
  });
  if (!wo) return NextResponse.json({ error: "Work order not found" }, { status: 404 });

  // Check WO status allows stock order
  if (!["Draft", "Confirmed", "In Progress"].includes(wo.status)) {
    return NextResponse.json({
      error: `WO status must be Draft, Confirmed, or In Progress, currently: ${wo.status}`,
    }, { status: 400 });
  }

  const orderNo = await generateStockOrderNumber(user.storeId);

  const so = await prisma.stockOrder.create({
    data: {
      orderNo,
      woId,
      storeId: user.storeId,
      warehouse: warehouse || null,
      status: "DRAFT",
      items: {
        create: items.filter((item: any) => item.sparepartId).map((item: any) => ({
          sparepartId: item.sparepartId,
          qty: item.qty,
        })),
      },
    },
    include: {
      wo: { select: { woNo: true } },
      items: { include: { sparepart: { select: { sku: true, name: true } } } },
    },
  });

  // Auto-update WO status to IN PROGRESS
  if (wo.status === "Draft") {
    await prisma.workOrder.update({ where: { id: woId }, data: { status: "IN PROGRESS" } });
  }

  return NextResponse.json({ data: so }, { status: 201 });
});
