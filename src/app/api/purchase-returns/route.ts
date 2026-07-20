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
  const { docNo, poId, supplierId, total, status, reason, date } = body;

  if (!docNo) return NextResponse.json({ error: "Document number is required" }, { status: 400 });
  if (!poId) return NextResponse.json({ error: "Purchase Order is required" }, { status: 400 });
  if (!supplierId) return NextResponse.json({ error: "Supplier is required" }, { status: 400 });

  const ret = await prisma.purchaseReturn.create({
    data: {
      docNo,
      poId,
      supplierId,
      total: total || 0,
      status: status || "Draft",
      reason,
      date: date ? new Date(date) : undefined,
    },
    include: {
      po: { select: { id: true, poNo: true } },
      supplier: { select: { id: true, companyName: true } },
    },
  });

  return NextResponse.json({ data: ret }, { status: 201 });
});
