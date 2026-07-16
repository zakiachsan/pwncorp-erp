import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const pr = await prisma.purchaseRequest.findUnique({
    where: { id: params.id },
    include: { items: { include: { sparepart: { select: { sku: true, name: true, stockQty: true } } } } },
  });
  if (!pr) return NextResponse.json({ error: "Purchase request not found" }, { status: 404 });
  return NextResponse.json({ data: pr });
});

export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const body = await req.json();
  const { status, notes } = body;

  const existing = await prisma.purchaseRequest.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Purchase request not found" }, { status: 404 });

  const updateData: any = {};
  if (status !== undefined) updateData.status = status;
  if (notes !== undefined) updateData.notes = notes;

  const pr = await prisma.purchaseRequest.update({
    where: { id: params.id },
    data: updateData,
    include: { items: { include: { sparepart: { select: { sku: true, name: true } } } } },
  });

  return NextResponse.json({ data: pr });
});
