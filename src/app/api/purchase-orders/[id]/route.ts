import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id: params.id },
    include: {
      supplier: true,
      items: { include: { sparepart: { select: { sku: true, name: true, stockQty: true, code: true } } } },
      deliveries: { include: { items: true } },
      invoices: true,
    },
  });
  if (!po) return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });
  return NextResponse.json({ data: po });
});

export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { status, supplierId, warehouse, dueAt, isClosed, items } = body;

  const existing = await prisma.purchaseOrder.findUnique({
    where: { id: params.id },
    include: { items: true },
  });
  if (!existing) return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });

  // Validate status transitions
  const validTransitions: Record<string, string[]> = {
    DRAFT: ["SENT", "CANCELLED"],
    SENT: ["PARTIAL", "RECEIVED", "CANCELLED"],
    PARTIAL: ["RECEIVED"],
    RECEIVED: [],
    CANCELLED: [],
  };
  if (status && !validTransitions[existing.status]?.includes(status)) {
    return NextResponse.json({ error: `Cannot transition from ${existing.status} to ${status}` }, { status: 400 });
  }

  // Only allow editing fields when DRAFT
  const isDraft = existing.status === "DRAFT";
  const updateData: any = {};

  if (status !== undefined) updateData.status = status;
  if (isClosed !== undefined) updateData.isClosed = isClosed;

  if (isDraft) {
    if (supplierId !== undefined) updateData.supplierId = supplierId;
    if (warehouse !== undefined) updateData.warehouse = warehouse;
    if (dueAt !== undefined) updateData.dueAt = dueAt ? new Date(dueAt) : null;

    // Replace items if provided
    if (items !== undefined) {
      await prisma.pOItem.deleteMany({ where: { poId: params.id } });
      let total = 0;
      for (const item of items) {
        const lineTotal = (item.qty || 0) * (item.unitPrice || 0);
        total += lineTotal;
        await prisma.pOItem.create({
          data: {
            poId: params.id,
            sparepartId: item.sparepartId,
            qty: item.qty || 0,
            unitPrice: item.unitPrice || 0,
            total: lineTotal,
          },
        });
      }
      updateData.total = total;
    }
  }

  const po = await prisma.purchaseOrder.update({
    where: { id: params.id },
    data: updateData,
    include: {
      supplier: { select: { id: true, companyName: true } },
      items: { include: { sparepart: { select: { sku: true, name: true, stockQty: true, code: true } } } },
    },
  });

  return NextResponse.json({ data: po });
});
