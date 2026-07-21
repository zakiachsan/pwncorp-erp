import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category");

  const where: any = { storeId: user.storeId, isActive: true };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ];
  }
  if (category) where.category = category;

  const [data, total] = await Promise.all([
    prisma.service.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.service.count({ where }),
  ]);

  return NextResponse.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const POST = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { sku, name, category, standardPrice, estDuration } = body;

  if (!sku || !name) return NextResponse.json({ error: "sku and name are required" }, { status: 400 });

  const existing = await prisma.service.findUnique({ where: { sku } });
  if (existing) return NextResponse.json({ error: "SKU already exists" }, { status: 409 });

  const service = await prisma.service.create({
    data: { storeId: user.storeId, sku, name, category, standardPrice: standardPrice || 0, estDuration },
  });

  return NextResponse.json({ data: service }, { status: 201 });
});
