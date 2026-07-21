import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const { searchParams } = new URL(req.url);
  const prId = searchParams.get("prId");

  const where: any = { storeId: user.storeId };
  if (prId) where.prId = prId;

  const data = await prisma.vendorQuote.findMany({
    where,
    include: {
      supplier: { select: { id: true, companyName: true } },
      pr: { select: { prNo: true } },
      items: { include: { sparepart: { select: { sku: true, name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data });
});

export const POST = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { prId, supplierId, leadTime, notes, items } = body;

  if (!prId || !supplierId || !items?.length) {
    return NextResponse.json({ error: "prId, supplierId, and items are required" }, { status: 400 });
  }

  const pr = await prisma.purchaseRequest.findFirst({ where: { id: prId, storeId: user.storeId } });
  if (!pr) return NextResponse.json({ error: "Purchase request not found" }, { status: 404 });

  const totalPrice = items.reduce((s: number, i: any) => s + (i.unitPrice || 0), 0);

  const quote = await prisma.vendorQuote.create({
    data: {
      prId, supplierId, storeId: user.storeId,
      totalPrice, leadTime: leadTime || 0, notes: notes || null,
      items: { create: items.map((i: any) => ({ sparepartId: i.sparepartId, unitPrice: i.unitPrice || 0 })) },
    },
    include: { supplier: { select: { companyName: true } }, items: true },
  });

  return NextResponse.json({ data: quote }, { status: 201 });
});
