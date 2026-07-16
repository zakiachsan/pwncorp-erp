import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      wo: {
        include: {
          so: { select: { soNo: true, vehicle: { select: { plateNo: true, brand: true, model: true } } } },
        },
      },
      items: true,
      payments: { orderBy: { paymentDate: "desc" } },
      ar: true,
    },
  });
  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  return NextResponse.json({ data: invoice });
});

export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const body = await req.json();
  const { status, dueDate } = body;

  const existing = await prisma.invoice.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  const updateData: any = {};
  if (status !== undefined) updateData.status = status;
  if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);

  const invoice = await prisma.invoice.update({
    where: { id: params.id },
    data: updateData,
    include: { customer: { select: { id: true, name: true } }, items: true, payments: true },
  });

  return NextResponse.json({ data: invoice });
});

export const DELETE = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const existing = await prisma.invoice.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  if (existing.status !== "UNPAID") {
    return NextResponse.json({ error: "Only UNPAID invoices can be cancelled" }, { status: 400 });
  }

  await prisma.invoice.update({ where: { id: params.id }, data: { status: "UNPAID" } });
  return NextResponse.json({ data: { success: true } });
});
