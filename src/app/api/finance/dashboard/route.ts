import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const storeId = user.storeId;

  // Get all posted journal details with COA kategori
  const details = await prisma.journalDetail.findMany({
    where: { je: { storeId, status: "Posted" } },
    include: { coa: { select: { code: true, name: true, kategori: true, normalBalance: true } } },
  });

  // Aggregate by kategori
  const summary: Record<string, number> = { Asset: 0, Liability: 0, Equity: 0, Revenue: 0, Expense: 0 };
  for (const d of details) {
    const kat = d.coa.kategori;
    if (!summary.hasOwnProperty(kat)) continue;
    // Normal balance: Debit accounts (Asset, Expense) increase with debit
    // Credit accounts (Liability, Equity, Revenue) increase with credit
    if (d.coa.normalBalance === "Debit") {
      summary[kat] += d.debit - d.credit;
    } else {
      summary[kat] += d.credit - d.debit;
    }
  }

  const totalAsset = summary.Asset;
  const totalLiability = summary.Liability;
  const totalEquity = summary.Equity;
  const totalRevenue = summary.Revenue;
  const totalExpense = summary.Expense;
  const labaRugi = totalRevenue - totalExpense;

  // Recent journals
  const recentJournals = await prisma.journalEntry.findMany({
    where: { storeId, status: "Posted" },
    orderBy: { date: "desc" },
    take: 10,
    select: { id: true, jeNo: true, date: true, description: true, refType: true },
  });

  // Outstanding AR & AP from invoices
  const [arOutstanding, apOutstanding] = await Promise.all([
    prisma.invoice.aggregate({
      where: { storeId, status: { notIn: ["Paid", "Cancelled"] } },
      _sum: { total: true },
    }),
    prisma.purchaseInvoice.aggregate({
      where: { po: { storeId }, status: { notIn: ["Paid", "Cancelled"] } },
      _sum: { total: true },
    }),
  ]);

  return NextResponse.json({
    neraca: { totalAsset, totalLiability, totalEquity, balance: totalAsset - totalLiability - totalEquity },
    labaRugi: { revenue: totalRevenue, expense: totalExpense, net: labaRugi },
    arOutstanding: arOutstanding._sum.total || 0,
    apOutstanding: apOutstanding._sum.total || 0,
    recentJournals,
  });
});
