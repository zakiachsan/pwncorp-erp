import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id: params.id },
    include: {
      supplier: true,
      items: { include: { sparepart: { select: { sku: true, name: true, stockQty: true } } } },
      deliveries: { include: { items: true } },
      invoices: true,
    },
  });
  if (!po) return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });
  return NextResponse.json({ data: po });
});

export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const body = await req.json();
  const { status, dueAt, isClosed } = body;

  const existing = await prisma.purchaseOrder.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });

  const updateData: any = {};
  if (status !== undefined) updateData.status = status;
  if (dueAt !== undefined) updateData.dueAt = dueAt ? new Date(dueAt) : null;
  if (isClosed !== undefined) updateData.isClosed = isClosed;

  const po = await prisma.purchaseOrder.update({
    where: { id: params.id },
    data: updateData,
    include: { supplier: { select: { id: true, companyName: true } }, items: true },
  });

  return NextResponse.json({ data: po });
});
