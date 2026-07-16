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
  const supplierId = searchParams.get("supplierId");
  const lowStock = searchParams.get("lowStock");

  const where: any = { storeId: user.storeId };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
      { code: { contains: search, mode: "insensitive" } },
    ];
  }
  if (category) where.category = category;
  if (supplierId) where.supplierId = supplierId;
  if (lowStock === "true") where.stockQty = { lte: prisma.sparepart.fields.minStock };

  const [data, total] = await Promise.all([
    prisma.sparepart.findMany({
      where,
      include: { supplier: { select: { id: true, companyName: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.sparepart.count({ where }),
  ]);

  return NextResponse.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const POST = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { sku, name, code, brand, category, type, buyPrice, sellPrice, unit, minStock, location, isTracking, isBundle, supplierId, tax } = body;

  if (!sku || !name) return NextResponse.json({ error: "sku and name are required" }, { status: 400 });

  const existing = await prisma.sparepart.findUnique({ where: { sku } });
  if (existing) return NextResponse.json({ error: "SKU already exists" }, { status: 409 });

  const sparepart = await prisma.sparepart.create({
    data: {
      storeId: user.storeId, sku, name, code, brand, category, type,
      buyPrice: buyPrice || 0, sellPrice: sellPrice || 0,
      unit: unit || "pcs", minStock: minStock || 0,
      location, isTracking: isTracking ?? true, isBundle: isBundle ?? false,
      supplierId, tax,
    },
  });

  return NextResponse.json({ data: sparepart }, { status: 201 });
});
