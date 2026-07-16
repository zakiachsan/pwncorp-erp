import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const { searchParams } = new URL(req.url);
  const report = searchParams.get("report") || "summary";
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const dateFilter: any = {};
  if (dateFrom) dateFilter.gte = new Date(dateFrom);
  if (dateTo) dateFilter.lte = new Date(dateTo);

  switch (report) {
    case "summary": {
      // Income vs Expense summary
      const [income, expense, invoices, purchaseInvoices] = await Promise.all([
        prisma.payment.aggregate({
          where: { invoice: { storeId: user.storeId }, ...(Object.keys(dateFilter).length ? { paymentDate: dateFilter } : {}) },
          _sum: { amount: true },
        }),
        prisma.pettyCash.aggregate({
          where: { storeId: user.storeId, type: "out", ...(Object.keys(dateFilter).length ? { date: dateFilter } : {}) },
          _sum: { amount: true },
        }),
        prisma.invoice.aggregate({
          where: { storeId: user.storeId, ...(Object.keys(dateFilter).length ? { invoiceDate: dateFilter } : {}) },
          _sum: { total: true, amountPaid: true, amountDue: true },
        }),
        prisma.purchaseInvoice.count({
          where: { po: { storeId: user.storeId }, status: "UNPAID" },
        }),
      ]);

      return NextResponse.json({
        data: {
          totalIncome: income._sum.amount || 0,
          totalExpense: expense._sum.amount || 0,
          netIncome: (income._sum.amount || 0) - (expense._sum.amount || 0),
          totalInvoiced: invoices._sum.total || 0,
          totalCollected: invoices._sum.amountPaid || 0,
          totalOutstanding: invoices._sum.amountDue || 0,
          unpaidSupplierBills: purchaseInvoices,
        },
      });
    }

    case "balance-sheet": {
      // Simplified balance sheet from COA
      const accounts = await prisma.cOA.findMany({
        where: { isActive: true },
        include: {
          journalDetails: {
            where: { je: { storeId: user.storeId, ...(Object.keys(dateFilter).length ? { date: dateFilter } : {}) } },
            select: { debit: true, credit: true },
          },
        },
      });

      const assets = sumCategory(accounts, "Asset");
      const liabilities = sumCategory(accounts, "Liability");
      const equity = sumCategory(accounts, "Equity");
      const revenue = sumCategory(accounts, "Revenue");
      const expense = sumCategory(accounts, "Expense");

      return NextResponse.json({
        data: {
          assets,
          liabilities,
          equity: equity + revenue - expense,
          totalAssets: assets,
          totalLiabilitiesEquity: liabilities + equity + revenue - expense,
        },
      });
    }

    case "ar-aging": {
      const ars = await prisma.accountReceivable.findMany({
        where: { invoice: { storeId: user.storeId }, status: { not: "PAID" } },
        include: {
          customer: { select: { name: true } },
          invoice: { select: { invNo: true } },
        },
        orderBy: { dueDate: "asc" },
      });

      const now = new Date();
      const aging = { current: 0, days30: 0, days60: 0, days90: 0, older: 0 };
      for (const ar of ars) {
        const days = Math.floor((now.getTime() - ar.dueDate.getTime()) / (1000 * 60 * 60 * 24));
        if (days <= 0) aging.current += ar.balance;
        else if (days <= 30) aging.days30 += ar.balance;
        else if (days <= 60) aging.days60 += ar.balance;
        else if (days <= 90) aging.days90 += ar.balance;
        else aging.older += ar.balance;
      }

      return NextResponse.json({ data: { items: ars, aging } });
    }

    default:
      return NextResponse.json({ error: "Unknown report type" }, { status: 400 });
  }
});

function sumCategory(accounts: any[], kategori: string): number {
  return accounts
    .filter(a => a.kategori === kategori)
    .reduce((sum, a) => {
      const debitTotal = a.journalDetails.reduce((s: number, d: any) => s + d.debit, 0);
      const creditTotal = a.journalDetails.reduce((s: number, d: any) => s + d.credit, 0);
      if (a.normalBalance === "Debit") return sum + debitTotal - creditTotal;
      return sum + creditTotal - debitTotal;
    }, 0);
}
