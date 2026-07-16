import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const opname = await prisma.stockOpname.findUnique({
    where: { id: params.id },
    include: {
      items: { include: { sparepart: { select: { sku: true, name: true, stockQty: true } } } },
    },
  });
  if (!opname) return NextResponse.json({ error: "Stock opname not found" }, { status: 404 });
  return NextResponse.json({ data: opname });
});

export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { status } = body;

  const existing = await prisma.stockOpname.findUnique({
    where: { id: params.id },
    include: { items: { include: { sparepart: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Stock opname not found" }, { status: 404 });

  const updateData: any = {};
  if (status !== undefined) updateData.status = status;

  // On Completed: apply adjustments to stock
  if (status === "Completed" && existing.status !== "Completed") {
    for (const item of existing.items) {
      const adj = item.adjustment;
      if (adj !== 0) {
        const sp = await prisma.sparepart.findUnique({ where: { id: item.sparepartId } });
        if (!sp) continue;
        
        const qtyBefore = sp.stockQty;
        const qtyAfter = sp.stockQty + adj;
        
        await prisma.sparepart.update({
          where: { id: item.sparepartId },
          data: { stockQty: qtyAfter },
        });
        
        await prisma.stockHistory.create({
          data: {
            sparepartId: item.sparepartId,
            storeId: user.storeId,
            changeType: "adjust",
            qtyChange: adj,
            qtyBefore,
            qtyAfter,
            refDoc: "OPNAME",
            refNo: existing.refCode,
            date: new Date(),
          },
        });
      }
    }
  }

  const opname = await prisma.stockOpname.update({
    where: { id: params.id },
    data: updateData,
    include: { items: { include: { sparepart: { select: { sku: true, name: true } } } } },
  });

  return NextResponse.json({ data: opname });
});
