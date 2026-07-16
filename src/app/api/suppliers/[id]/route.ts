import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const supplier = await prisma.supplier.findUnique({
    where: { id: params.id },
    include: { spareparts: true, _count: { select: { purchaseOrders: true } } },
  });
  if (!supplier) return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
  return NextResponse.json({ data: supplier });
});

export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const body = await req.json();
  const { companyName, contactPerson, phone, email, address, paymentTerms, isActive } = body;

  const existing = await prisma.supplier.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Supplier not found" }, { status: 404 });

  const supplier = await prisma.supplier.update({
    where: { id: params.id },
    data: {
      ...(companyName !== undefined && { companyName }),
      ...(contactPerson !== undefined && { contactPerson }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(address !== undefined && { address }),
      ...(paymentTerms !== undefined && { paymentTerms }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return NextResponse.json({ data: supplier });
});

export const DELETE = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const existing = await prisma.supplier.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
  await prisma.supplier.update({ where: { id: params.id }, data: { isActive: false } });
  return NextResponse.json({ data: { success: true } });
});
