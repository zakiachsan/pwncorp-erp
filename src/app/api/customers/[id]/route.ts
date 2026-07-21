import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: { vehicles: true, _count: { select: { serviceOrders: true, invoices: true } } },
  });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  return NextResponse.json({ data: { ...customer, code: customer.id.slice(-6) } });
});

export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { name, type, phone, whatsapp, email, address, isActive } = body;

  const existing = await prisma.customer.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const customer = await prisma.customer.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined && { name }),
      ...(type !== undefined && { type }),
      ...(phone !== undefined && { phone }),
      ...(whatsapp !== undefined && { whatsapp }),
      ...(email !== undefined && { email }),
      ...(address !== undefined && { address }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return NextResponse.json({ data: customer });
});

export const DELETE = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const existing = await prisma.customer.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  // Soft delete
  await prisma.customer.update({ where: { id: params.id }, data: { isActive: false } });
  return NextResponse.json({ data: { success: true } });
});
