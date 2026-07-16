import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const where: any = { storeId: user.storeId, isActive: true };

  const data = await prisma.bankAccount.findMany({
    where,
    include: { coa: { select: { code: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });

  const totalBalance = data.reduce((sum, b) => sum + b.balance, 0);

  return NextResponse.json({ data, summary: { totalBalance, count: data.length } });
});

export const POST = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { bankName, accountNo, accountName, balance, coaId } = body;

  if (!bankName || !accountNo || !accountName) {
    return NextResponse.json({ error: "bankName, accountNo, and accountName are required" }, { status: 400 });
  }

  const bank = await prisma.bankAccount.create({
    data: { storeId: user.storeId, bankName, accountNo, accountName, balance: balance || 0, coaId: coaId || null },
  });

  return NextResponse.json({ data: bank }, { status: 201 });
});
