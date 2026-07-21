import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const pkg = await prisma.servicePackage.findFirst({
    where: { OR: [{ id: params.id }, { sku: params.id }] },
  });
  if (!pkg) return NextResponse.json({ error: "Service package not found" }, { status: 404 });
  return NextResponse.json({ data: pkg });
});

export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const body = await req.json();
  const { sku, name, description, estDuration, price, tax, isActive } = body;

  const existing = await prisma.servicePackage.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Service package not found" }, { status: 404 });

  if (sku && sku !== existing.sku) {
    const dup = await prisma.servicePackage.findUnique({ where: { sku } });
    if (dup) return NextResponse.json({ error: "SKU already exists" }, { status: 409 });
  }

  const pkg = await prisma.servicePackage.update({
    where: { id: params.id },
    data: {
      ...(sku !== undefined && { sku }), ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(estDuration !== undefined && { estDuration }),
      ...(price !== undefined && { price }),
      ...(tax !== undefined && { tax }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return NextResponse.json({ data: pkg });
});

export const DELETE = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const existing = await prisma.servicePackage.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Service package not found" }, { status: 404 });
  await prisma.servicePackage.update({ where: { id: params.id }, data: { isActive: false } });
  return NextResponse.json({ data: { success: true } });
});
