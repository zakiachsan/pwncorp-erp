import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const service = await prisma.service.findUnique({ where: { id: params.id } });
  if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });
  return NextResponse.json({ data: service });
});

export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const body = await req.json();
  const { sku, name, category, standardPrice, estDuration, isActive } = body;

  const existing = await prisma.service.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Service not found" }, { status: 404 });

  if (sku && sku !== existing.sku) {
    const dup = await prisma.service.findUnique({ where: { sku } });
    if (dup) return NextResponse.json({ error: "SKU already exists" }, { status: 409 });
  }

  const service = await prisma.service.update({
    where: { id: params.id },
    data: {
      ...(sku !== undefined && { sku }), ...(name !== undefined && { name }),
      ...(category !== undefined && { category }),
      ...(standardPrice !== undefined && { standardPrice }),
      ...(estDuration !== undefined && { estDuration }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return NextResponse.json({ data: service });
});

export const DELETE = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const existing = await prisma.service.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Service not found" }, { status: 404 });
  await prisma.service.update({ where: { id: params.id }, data: { isActive: false } });
  return NextResponse.json({ data: { success: true } });
});
