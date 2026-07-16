import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";
import { generatePRNumber } from "@/lib/numbering";

export const GET = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status");

  const where: any = { storeId: user.storeId };
  if (search) where.prNo = { contains: search, mode: "insensitive" };
  if (status) where.status = status;

  const [data, total] = await Promise.all([
    prisma.purchaseRequest.findMany({
      where,
      include: {
        _count: { select: { items: true } },
      },
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.purchaseRequest.count({ where }),
  ]);

  return NextResponse.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const POST = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { notes, items } = body;

  if (!items || !items.length) {
    return NextResponse.json({ error: "items are required" }, { status: 400 });
  }

  const prNo = await generatePRNumber(user.storeId);

  const pr = await prisma.purchaseRequest.create({
    data: {
      prNo,
      storeId: user.storeId,
      requestedBy: user.id,
      notes,
      items: {
        create: items.map((i: any) => ({
          sparepartId: i.sparepartId,
          qty: i.qty,
          unitPrice: i.unitPrice || 0,
          total: i.qty * (i.unitPrice || 0),
        })),
      },
    },
    include: {
      items: { include: { sparepart: { select: { sku: true, name: true } } } },
    },
  });

  return NextResponse.json({ data: pr }, { status: 201 });
});
