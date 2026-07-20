import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const receipt = await prisma.receipt.findUnique({
    where: { id: params.id },
    include: {
      bankAccount: { select: { id: true, bankName: true, accountNo: true, accountName: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });
  if (!receipt) return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
  return NextResponse.json({ data: receipt });
});
