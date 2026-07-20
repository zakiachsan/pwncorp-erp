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

    case "cash-flow": {
      const [payments, expenses] = await Promise.all([
        prisma.payment.findMany({
          where: { invoice: { storeId: user.storeId }, ...(Object.keys(dateFilter).length ? { paymentDate: dateFilter } : {}) },
          include: { invoice: { select: { invNo: true, customer: { select: { name: true } } } } },
          orderBy: { paymentDate: "desc" },
          take: 50,
        }),
        prisma.pettyCash.findMany({
          where: { storeId: user.storeId, type: "out", ...(Object.keys(dateFilter).length ? { date: dateFilter } : {}) },
          orderBy: { date: "desc" },
          take: 50,
        }),
      ]);

      const inflows = payments.map((p) => ({
        date: p.paymentDate,
        description: `Pembayaran ${p.invoice?.invNo || ""} - ${p.invoice?.customer?.name || ""}`,
        category: "Piutang",
        inflow: p.amount,
        outflow: 0,
      }));
      const outflows = expenses.map((e) => ({
        date: e.date,
        description: e.description,
        category: "Operasional",
        inflow: 0,
        outflow: e.amount,
      }));

      const all = [...inflows, ...outflows].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const totalInflow = inflows.reduce((s, i) => s + i.inflow, 0);
      const totalOutflow = outflows.reduce((s, o) => s + o.outflow, 0);

      return NextResponse.json({
        data: {
          items: all,
          summary: { totalInflow, totalOutflow, net: totalInflow - totalOutflow },
        },
      });
    }

    case "ap-aging": {
      const aps = await prisma.accountPayable.findMany({
        where: { purchaseInvoice: { po: { storeId: user.storeId } }, status: { not: "PAID" } },
        include: {
          purchaseInvoice: { select: { docNo: true, supplier: { select: { companyName: true } } } },
        },
        orderBy: { dueDate: "asc" },
      });

      const now = new Date();
      const aging = { current: 0, days30: 0, days60: 0, days90: 0, older: 0 };
      for (const ap of aps) {
        const days = Math.floor((now.getTime() - ap.dueDate.getTime()) / (1000 * 60 * 60 * 24));
        if (days <= 0) aging.current += ap.balance;
        else if (days <= 30) aging.days30 += ap.balance;
        else if (days <= 60) aging.days60 += ap.balance;
        else if (days <= 90) aging.days90 += ap.balance;
        else aging.older += ap.balance;
      }

      return NextResponse.json({ data: { items: aps, aging } });
    }

    case "ap-overdue": {
      const now = new Date();
      const aps = await prisma.accountPayable.findMany({
        where: { purchaseInvoice: { po: { storeId: user.storeId } }, status: { not: "PAID" }, dueDate: { lt: now } },
        include: { purchaseInvoice: { select: { docNo: true, supplier: { select: { companyName: true } } } } },
        orderBy: { dueDate: "asc" },
      });
      const items = aps.map((ap) => ({
        supplier: ap.purchaseInvoice?.supplier?.companyName || "-",
        docNo: ap.purchaseInvoice?.docNo || "-",
        dueDate: ap.dueDate,
        daysOverdue: Math.floor((now.getTime() - ap.dueDate.getTime()) / (1000 * 60 * 60 * 24)),
        balance: ap.balance,
        status: ap.status,
      }));
      return NextResponse.json({ data: { items } });
    }

    case "ar-overdue": {
      const now = new Date();
      const ars = await prisma.accountReceivable.findMany({
        where: { invoice: { storeId: user.storeId }, status: { not: "PAID" }, dueDate: { lt: now } },
        include: { customer: { select: { name: true } }, invoice: { select: { invNo: true } } },
        orderBy: { dueDate: "asc" },
      });
      const items = ars.map((ar) => ({
        customer: ar.customer?.name || "-",
        docNo: ar.invoice?.invNo || "-",
        dueDate: ar.dueDate,
        daysOverdue: Math.floor((now.getTime() - ar.dueDate.getTime()) / (1000 * 60 * 60 * 24)),
        balance: ar.balance,
        status: ar.status,
      }));
      return NextResponse.json({ data: { items } });
    }

    case "ap-subledger": {
      const aps = await prisma.accountPayable.findMany({
        where: { purchaseInvoice: { po: { storeId: user.storeId } } },
        include: { purchaseInvoice: { select: { docNo: true, date: true, total: true, supplier: { select: { companyName: true } } } } },
        orderBy: { createdAt: "asc" },
      });
      const grouped: Record<string, any> = {};
      for (const ap of aps) {
        const name = ap.purchaseInvoice?.supplier?.companyName || "-";
        if (!grouped[name]) grouped[name] = { supplier: name, totalBilled: 0, totalPaid: 0, balance: 0, count: 0 };
        grouped[name].totalBilled += ap.purchaseInvoice?.total || 0;
        grouped[name].totalPaid += (ap.purchaseInvoice?.total || 0) - (ap.balance || 0);
        grouped[name].balance += ap.balance || 0;
        grouped[name].count++;
      }
      return NextResponse.json({ data: { items: Object.values(grouped) } });
    }

    case "ar-subledger": {
      const ars = await prisma.accountReceivable.findMany({
        where: { invoice: { storeId: user.storeId } },
        include: { customer: { select: { name: true } }, invoice: { select: { invNo: true, total: true, invoiceDate: true } } },
        orderBy: { createdAt: "asc" },
      });
      const grouped: Record<string, any> = {};
      for (const ar of ars) {
        const name = ar.customer?.name || "-";
        if (!grouped[name]) grouped[name] = { customer: name, totalBilled: 0, totalPaid: 0, balance: 0, count: 0 };
        grouped[name].totalBilled += ar.invoice?.total || 0;
        grouped[name].totalPaid += (ar.invoice?.total || 0) - (ar.balance || 0);
        grouped[name].balance += ar.balance || 0;
        grouped[name].count++;
      }
      return NextResponse.json({ data: { items: Object.values(grouped) } });
    }

    case "ap-overlimit": {
      const threshold = parseInt(searchParams.get("threshold") || "5000000");
      const aps = await prisma.accountPayable.findMany({
        where: { purchaseInvoice: { po: { storeId: user.storeId } }, status: { not: "PAID" }, balance: { gt: threshold } },
        include: { purchaseInvoice: { select: { docNo: true, supplier: { select: { companyName: true } } } } },
        orderBy: { balance: "desc" },
      });
      const items = aps.map((ap) => ({
        supplier: ap.purchaseInvoice?.supplier?.companyName || "-",
        docNo: ap.purchaseInvoice?.docNo || "-",
        balance: ap.balance,
        status: ap.status,
      }));
      return NextResponse.json({ data: { items, threshold } });
    }

    case "ar-overlimit": {
      const threshold = parseInt(searchParams.get("threshold") || "5000000");
      const ars = await prisma.accountReceivable.findMany({
        where: { invoice: { storeId: user.storeId }, status: { not: "PAID" }, balance: { gt: threshold } },
        include: { customer: { select: { name: true } }, invoice: { select: { invNo: true } } },
        orderBy: { balance: "desc" },
      });
      const items = ars.map((ar) => ({
        customer: ar.customer?.name || "-",
        docNo: ar.invoice?.invNo || "-",
        balance: ar.balance,
        status: ar.status,
      }));
      return NextResponse.json({ data: { items, threshold } });
    }

    case "ap-cheque": {
      const payments = await prisma.payment.findMany({
        where: { invoice: { storeId: user.storeId }, paymentMethod: { contains: "cheque", mode: "insensitive" } },
        include: { invoice: { select: { invNo: true, customer: { select: { name: true } } } } },
        orderBy: { paymentDate: "desc" },
      });
      return NextResponse.json({ data: { items: payments } });
    }

    case "ar-cheque": {
      const payments = await prisma.payment.findMany({
        where: { invoice: { storeId: user.storeId }, paymentMethod: { contains: "cheque", mode: "insensitive" } },
        include: { invoice: { select: { invNo: true, customer: { select: { name: true } } } } },
        orderBy: { paymentDate: "desc" },
      });
      return NextResponse.json({ data: { items: payments } });
    }

    case "ap-credit": {
      const returns = await prisma.purchaseReturn.findMany({
        where: { po: { storeId: user.storeId } },
        include: { po: { select: { poNo: true, supplier: { select: { companyName: true } } } } },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ data: { items: returns } });
    }

    case "ar-credit": {
      const invoices = await prisma.invoice.findMany({
        where: { storeId: user.storeId, amountPaid: { gt: 0 } },
        include: { customer: { select: { name: true } } },
        orderBy: { invoiceDate: "desc" },
        take: 50,
      });
      return NextResponse.json({ data: { items: invoices } });
    }

    case "invoice-payables": {
      const invoices = await prisma.purchaseInvoice.findMany({
        where: { po: { storeId: user.storeId } },
        include: { supplier: { select: { companyName: true } }, po: { select: { poNo: true } } },
        orderBy: { date: "desc" },
        take: 100,
      });
      return NextResponse.json({ data: { items: invoices } });
    }

    case "invoice-receivables": {
      const invoices = await prisma.invoice.findMany({
        where: { storeId: user.storeId },
        include: { customer: { select: { name: true } } },
        orderBy: { invoiceDate: "desc" },
        take: 100,
      });
      return NextResponse.json({ data: { items: invoices } });
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
