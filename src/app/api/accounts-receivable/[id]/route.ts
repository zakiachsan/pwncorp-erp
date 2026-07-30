import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const ar = await prisma.accountReceivable.findUnique({
    where: { id: params.id },
    include: {
      customer: { select: { id: true, name: true, type: true } },
      invoice: {
        select: {
          id: true, invNo: true, total: true, status: true, invoiceDate: true,
          store: { select: { name: true } },
          items: { select: { item: true, description: true, qty: true, unitPrice: true, total: true } },
        },
      },
    },
  });

  if (!ar) {
    return NextResponse.json({ error: "Invoice Receivable not found" }, { status: 404 });
  }

  return NextResponse.json({ data: ar });
});

export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { action } = body;

  const ar = await prisma.accountReceivable.findUnique({ where: { id: params.id } });
  if (!ar) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const now = new Date();
  let updateData: any = {};

  switch (action) {
    case "approve":
      if (ar.status !== "DRAFT") return NextResponse.json({ error: "Can only approve from DRAFT" }, { status: 400 });
      updateData = { status: "APPROVED", approvedAt: now, approvedById: user.id };
      break;
    case "send":
      if (ar.status !== "APPROVED") return NextResponse.json({ error: "Can only send from APPROVED" }, { status: 400 });
      updateData = { status: "SENT", sentAt: now, sentById: user.id };
      break;
    case "pay":
      if (ar.status !== "SENT") return NextResponse.json({ error: "Can only pay from SENT" }, { status: 400 });
      updateData = { status: "PAID", paidAt: now, balance: 0 };
      break;
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const updated = await prisma.accountReceivable.update({
    where: { id: params.id },
    data: updateData,
    include: {
      customer: { select: { id: true, name: true, type: true } },
      invoice: {
        select: {
          id: true, invNo: true, total: true, status: true, invoiceDate: true,
          store: { select: { name: true } },
          items: { select: { item: true, description: true, qty: true, unitPrice: true, total: true } },
        },
      },
    },
  });

  return NextResponse.json({ data: updated });
});
