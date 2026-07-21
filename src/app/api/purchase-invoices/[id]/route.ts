import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const invoice = await prisma.purchaseInvoice.findFirst({
    where: { OR: [{ id: params.id }, { docNo: params.id }] },
    include: {
      supplier: true,
      po: { select: { poNo: true, total: true } },
      ap: true,
    },
  });
  if (!invoice) return NextResponse.json({ error: "Purchase invoice not found" }, { status: 404 });
  return NextResponse.json({ data: invoice });
});

export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const body = await req.json();
  const { status } = body;

  const existing = await prisma.purchaseInvoice.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Purchase invoice not found" }, { status: 404 });

  const updateData: any = {};
  if (status !== undefined) updateData.status = status;

  // If marked as PAID, update AP
  if (status === "PAID") {
    const ap = await prisma.accountPayable.findFirst({ where: { purchaseInvoiceId: params.id } });
    if (ap) {
      await prisma.accountPayable.update({
        where: { id: ap.id },
        data: { balance: 0, status: "PAID" },
      });
    }
  }

  const invoice = await prisma.purchaseInvoice.update({
    where: { id: params.id },
    data: updateData,
    include: { supplier: { select: { id: true, companyName: true } }, ap: true },
  });

  return NextResponse.json({ data: invoice });
});
