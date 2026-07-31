import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      store: { select: { name: true } },
      wo: {
        include: {
          so: {
            select: {
              soNo: true, date: true, planServiceTime: true,
              odometer: true, color: true, salesperson: true, bookingSource: true,
              referenceNumber: true, status: true, createdAt: true,
              sa: { select: { id: true, name: true } },
              vehicle: { select: { plateNo: true, brand: true, model: true, year: true } },
            },
          },
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

  // Validate workflow transition
  if (status !== undefined && status !== existing.status) {
    const allowed = VALID_TRANSITIONS[existing.status] || [];
    if (!allowed.includes(status)) {
      return NextResponse.json({
        error: `Cannot change status from ${existing.status} to ${status}. Allowed: ${allowed.join(", ") || "none"}`,
      }, { status: 400 });
    }
  }

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

  if (existing.status !== "DRAFT") {
    return NextResponse.json({ error: "Only DRAFT invoices can be deleted" }, { status: 400 });
  }

  await prisma.invoice.delete({ where: { id: params.id } });
  return NextResponse.json({ data: { success: true } });
});
