import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const status = searchParams.get("status");

  const where: any = {
    invoice: { storeId: user.storeId },
  };
  if (status) where.status = status;

  const [data, total] = await Promise.all([
    prisma.accountReceivable.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, type: true } },
        invoice: { select: { invNo: true, total: true, status: true } },
      },
      orderBy: { dueDate: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.accountReceivable.count({ where }),
  ]);

  // Summary
  const summary = await prisma.accountReceivable.aggregate({
    where,
    _sum: { amount: true, balance: true },
    _count: true,
  });

  return NextResponse.json({
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    summary: {
      totalAR: summary._sum.amount || 0,
      totalOutstanding: summary._sum.balance || 0,
      totalItems: summary._count,
    },
  });
});
