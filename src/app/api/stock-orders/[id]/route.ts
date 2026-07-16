import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const so = await prisma.stockOrder.findUnique({
    where: { id: params.id },
    include: {
      wo: {
        select: {
          woNo: true,
          so: { select: { soNo: true, customer: { select: { name: true } } } },
        },
      },
      items: { include: { sparepart: { select: { sku: true, name: true, stockQty: true } } } },
    },
  });
  if (!so) return NextResponse.json({ error: "Stock order not found" }, { status: 404 });
  return NextResponse.json({ data: so });
});

export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { status, warehouse } = body;

  const existing = await prisma.stockOrder.findUnique({
    where: { id: params.id },
    include: { items: { include: { sparepart: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Stock order not found" }, { status: 404 });

  // Validate status transition
  if (status) {
    const validTransitions: Record<string, string[]> = {
      "PENDING": ["CONFIRMED", "CANCELLED"],
      "CONFIRMED": ["RECEIVED", "CANCELLED"],
      "RECEIVED": [],
      "CANCELLED": [],
    };
    if (!validTransitions[existing.status]?.includes(status)) {
      return NextResponse.json({
        error: `Cannot transition from ${existing.status} to ${status}`,
      }, { status: 400 });
    }
  }

  const updateData: any = {};
  if (status !== undefined) updateData.status = status;
  if (warehouse !== undefined) updateData.warehouse = warehouse;

  const so = await prisma.stockOrder.update({
    where: { id: params.id },
    data: updateData,
    include: {
      wo: { select: { woNo: true } },
      items: { include: { sparepart: { select: { sku: true, name: true } } } },
    },
  });

  return NextResponse.json({ data: so });
});
