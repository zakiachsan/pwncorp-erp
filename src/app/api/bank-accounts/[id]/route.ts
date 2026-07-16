import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const bank = await prisma.bankAccount.findUnique({
    where: { id: params.id },
    include: { coa: true, receipts: { orderBy: { date: "desc" }, take: 10 } },
  });
  if (!bank) return NextResponse.json({ error: "Bank account not found" }, { status: 404 });
  return NextResponse.json({ data: bank });
});

export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const body = await req.json();
  const { bankName, accountNo, accountName, balance, coaId, isActive } = body;

  const existing = await prisma.bankAccount.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Bank account not found" }, { status: 404 });

  const updateData: any = {};
  if (bankName !== undefined) updateData.bankName = bankName;
  if (accountNo !== undefined) updateData.accountNo = accountNo;
  if (accountName !== undefined) updateData.accountName = accountName;
  if (balance !== undefined) updateData.balance = balance;
  if (coaId !== undefined) updateData.coaId = coaId;
  if (isActive !== undefined) updateData.isActive = isActive;

  const bank = await prisma.bankAccount.update({ where: { id: params.id }, data: updateData });
  return NextResponse.json({ data: bank });
});
