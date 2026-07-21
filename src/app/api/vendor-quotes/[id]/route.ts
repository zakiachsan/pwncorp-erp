import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const user = (await getCurrentUser()) as any;
  const { id } = params;

  const quote = await prisma.vendorQuote.findFirst({ where: { id, storeId: user.storeId } });
  if (!quote) return NextResponse.json({ error: "Quote not found" }, { status: 404 });

  // Unselect all quotes for this PR, then select this one
  await prisma.vendorQuote.updateMany({ where: { prId: quote.prId }, data: { isSelected: false } });
  const updated = await prisma.vendorQuote.update({
    where: { id },
    data: { isSelected: true },
    include: { supplier: { select: { companyName: true } } },
  });

  // Update PR status to Approved
  await prisma.purchaseRequest.update({ where: { id: quote.prId }, data: { status: "Approved" } });

  return NextResponse.json({ data: updated });
});
