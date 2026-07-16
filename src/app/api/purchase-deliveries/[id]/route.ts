import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const delivery = await prisma.purchaseDelivery.findUnique({
    where: { id: params.id },
    include: {
      po: { include: { supplier: true } },
      items: { include: { sparepart: { select: { sku: true, name: true, stockQty: true } } } },
    },
  });
  if (!delivery) return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
  return NextResponse.json({ data: delivery });
});
