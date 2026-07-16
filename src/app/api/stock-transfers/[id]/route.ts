import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const transfer = await prisma.stockTransfer.findUnique({
    where: { id: params.id },
    include: {
      items: { include: { sparepart: { select: { sku: true, name: true, stockQty: true } } } },
    },
  });
  if (!transfer) return NextResponse.json({ error: "Transfer not found" }, { status: 404 });
  return NextResponse.json({ data: transfer });
});

export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { status } = body;

  const existing = await prisma.stockTransfer.findUnique({
    where: { id: params.id },
    include: { items: { include: { sparepart: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Transfer not found" }, { status: 404 });

  const updateData: any = {};
  if (status !== undefined) updateData.status = status;

  // On Received: deduct from source warehouse
  if (status === "Received" && existing.status !== "Received") {
    for (const item of existing.items) {
      const sp = await prisma.sparepart.findUnique({ where: { id: item.sparepartId } });
      if (sp && sp.stockQty >= item.qty) {
        const qtyBefore = sp.stockQty;
        await prisma.sparepart.update({
          where: { id: item.sparepartId },
          data: { stockQty: { decrement: item.qty } },
        });
        await prisma.stockHistory.create({
          data: {
            sparepartId: item.sparepartId,
            storeId: user.storeId,
            changeType: "out",
            qtyChange: item.qty,
            qtyBefore,
            qtyAfter: qtyBefore - item.qty,
            refDoc: "TRF",
            refNo: existing.transferNo,
            date: new Date(),
          },
        });
      }
    }
  }

  const transfer = await prisma.stockTransfer.update({
    where: { id: params.id },
    data: updateData,
    include: { items: { include: { sparepart: { select: { sku: true, name: true } } } } },
  });

  return NextResponse.json({ data: transfer });
});
