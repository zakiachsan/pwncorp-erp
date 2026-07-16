import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const sparepart = await prisma.sparepart.findUnique({
    where: { id: params.id },
    include: { supplier: true, stockHistories: { orderBy: { date: "desc" }, take: 20 } },
  });
  if (!sparepart) return NextResponse.json({ error: "Sparepart not found" }, { status: 404 });
  return NextResponse.json({ data: sparepart });
});

export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const body = await req.json();
  const { sku, name, code, brand, category, type, buyPrice, sellPrice, unit, minStock, stockQty, location, isTracking, isBundle, supplierId, tax } = body;

  const existing = await prisma.sparepart.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Sparepart not found" }, { status: 404 });

  if (sku && sku !== existing.sku) {
    const dup = await prisma.sparepart.findUnique({ where: { sku } });
    if (dup) return NextResponse.json({ error: "SKU already exists" }, { status: 409 });
  }

  const sparepart = await prisma.sparepart.update({
    where: { id: params.id },
    data: {
      ...(sku !== undefined && { sku }), ...(name !== undefined && { name }),
      ...(code !== undefined && { code }), ...(brand !== undefined && { brand }),
      ...(category !== undefined && { category }), ...(type !== undefined && { type }),
      ...(buyPrice !== undefined && { buyPrice }), ...(sellPrice !== undefined && { sellPrice }),
      ...(unit !== undefined && { unit }), ...(minStock !== undefined && { minStock }),
      ...(stockQty !== undefined && { stockQty }),
      ...(location !== undefined && { location }),
      ...(isTracking !== undefined && { isTracking }),
      ...(isBundle !== undefined && { isBundle }),
      ...(supplierId !== undefined && { supplierId }),
      ...(tax !== undefined && { tax }),
    },
  });

  return NextResponse.json({ data: sparepart });
});

export const DELETE = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const existing = await prisma.sparepart.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Sparepart not found" }, { status: 404 });
  await prisma.sparepart.delete({ where: { id: params.id } });
  return NextResponse.json({ data: { success: true } });
});
