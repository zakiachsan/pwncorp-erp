import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";

  const where: any = { storeId: user.storeId, isActive: true };
  if (search) where.companyName = { contains: search, mode: "insensitive" };

  const [data, total] = await Promise.all([
    prisma.supplier.findMany({
      where,
      include: { _count: { select: { spareparts: true, purchaseOrders: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.supplier.count({ where }),
  ]);

  return NextResponse.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const POST = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { companyName, contactPerson, phone, email, address, paymentTerms } = body;

  if (!companyName) return NextResponse.json({ error: "companyName is required" }, { status: 400 });

  const supplier = await prisma.supplier.create({
    data: { storeId: user.storeId, companyName, contactPerson, phone, email, address, paymentTerms },
  });

  return NextResponse.json({ data: supplier }, { status: 201 });
});
