import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const outgoing = await prisma.stockOutgoing.findFirst({
    where: { OR: [{ id: params.id }, { docNo: params.id }] },
    include: {
      items: { include: { sparepart: { select: { sku: true, name: true, stockQty: true } } } },
    },
  });
  if (!outgoing) return NextResponse.json({ error: "Stock Outgoing not found" }, { status: 404 });
  return NextResponse.json({ data: outgoing });
});

export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { action } = body;

  const existing = await prisma.stockOutgoing.findUnique({
    where: { id: params.id },
    include: { items: true },
  });
  if (!existing) return NextResponse.json({ error: "Stock Outgoing not found" }, { status: 404 });

  const validTransitions: Record<string, string[]> = {
    Draft: ["Confirmed", "Cancelled"],
    Confirmed: ["Approved", "Cancelled"],
    Approved: [],
    Cancelled: [],
  };

  if (!action) return NextResponse.json({ error: "action is required" }, { status: 400 });
  const targetStatus = action === "confirm" ? "Confirmed" : action === "approve" ? "Approved" : action === "cancel" ? "Cancelled" : null;
  if (!targetStatus) return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  if (!validTransitions[existing.status]?.includes(targetStatus)) {
    return NextResponse.json({ error: `Cannot transition from ${existing.status} to ${targetStatus}` }, { status: 400 });
  }

  // On Approved: deduct stock
  if (targetStatus === "Approved") {
    for (const item of existing.items) {
      const sp = await prisma.sparepart.findUnique({ where: { id: item.sparepartId } });
      if (sp) {
        const qtyBefore = sp.stockQty;
        await prisma.sparepart.update({
          where: { id: item.sparepartId },
          data: { stockQty: { decrement: item.qty } },
        });
        await prisma.stockHistory.create({
          data: {
            sparepartId: item.sparepartId,
            storeId: existing.storeId,
            changeType: "out",
            qtyChange: item.qty,
            qtyBefore,
            qtyAfter: qtyBefore - item.qty,
            refDoc: "SO",
            refNo: existing.docNo,
            date: new Date(),
          },
        });
      }
    }
  }

  const outgoing = await prisma.stockOutgoing.update({
    where: { id: params.id },
    data: { status: targetStatus },
    include: { items: { include: { sparepart: { select: { sku: true, name: true } } } } },
  });

  return NextResponse.json({ data: outgoing });
});
