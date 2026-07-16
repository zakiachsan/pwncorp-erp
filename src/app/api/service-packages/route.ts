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
  if (search) where.name = { contains: search, mode: "insensitive" };

  const [data, total] = await Promise.all([
    prisma.servicePackage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.servicePackage.count({ where }),
  ]);

  return NextResponse.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const POST = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { sku, name, description, estDuration, price, tax } = body;

  if (!sku || !name) return NextResponse.json({ error: "sku and name are required" }, { status: 400 });

  const existing = await prisma.servicePackage.findUnique({ where: { sku } });
  if (existing) return NextResponse.json({ error: "SKU already exists" }, { status: 409 });

  const pkg = await prisma.servicePackage.create({
    data: { storeId: user.storeId, sku, name, description, estDuration, price: price || 0, tax },
  });

  return NextResponse.json({ data: pkg }, { status: 201 });
});
