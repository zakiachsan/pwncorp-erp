import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const storeId = user.storeId;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  // Parallel all queries
  const [
    woToday, woInProgress, woCompleted,
    woStatusBreakdown,
    revenueToday, revenueMonth,
    recentSO,
    lowStock,
    totalCustomers, totalVehicles, totalSpareparts,
    unpaidInvoices, overdueAR,
  ] = await Promise.all([
    // WO Today
    prisma.workOrder.count({ where: { storeId, createdAt: { gte: today, lt: tomorrow } } }),
    // WO In Progress
    prisma.workOrder.count({ where: { storeId, status: "In Progress" } }),
    // WO Completed (this month)
    prisma.workOrder.count({ where: { storeId, status: "Completed", createdAt: { gte: monthStart } } }),

    // WO Status Breakdown
    prisma.workOrder.groupBy({
      by: ["status"],
      where: { storeId },
      _count: true,
    }),

    // Revenue Today (from payments)
    prisma.payment.aggregate({
      where: {
        invoice: { storeId },
        paymentDate: { gte: today, lt: tomorrow },
      },
      _sum: { amount: true },
    }),

    // Revenue Month
    prisma.payment.aggregate({
      where: {
        invoice: { storeId },
        paymentDate: { gte: monthStart },
      },
      _sum: { amount: true },
    }),

    // Recent SO
    prisma.serviceOrder.findMany({
      where: { storeId },
      include: {
        customer: { select: { name: true } },
        vehicle: { select: { plateNo: true } },
      },
      orderBy: { date: "desc" },
      take: 5,
    }),

    // Low Stock
    prisma.sparepart.findMany({
      where: {
        storeId,
        isTracking: true,
        stockQty: { lte: prisma.sparepart.fields.minStock },
      },
      orderBy: { stockQty: "asc" },
      take: 5,
    }),

    // Master counts
    prisma.customer.count({ where: { storeId, isActive: true } }),
    prisma.vehicle.count({ where: { storeId } }),
    prisma.sparepart.count({ where: { storeId } }),

    // Unpaid invoices
    prisma.invoice.aggregate({
      where: { storeId, status: { not: "PAID" } },
      _sum: { amountDue: true },
      _count: true,
    }),

    // Overdue AR
    prisma.accountReceivable.aggregate({
      where: {
        invoice: { storeId },
        status: "OPEN",
        dueDate: { lt: new Date() },
      },
      _sum: { balance: true },
      _count: true,
    }),
  ]);

  // Monthly revenue chart (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyPayments = await prisma.payment.findMany({
    where: {
      invoice: { storeId },
      paymentDate: { gte: sixMonthsAgo },
    },
    select: { amount: true, paymentDate: true },
  });

  const monthlyRevenue: number[] = [];
  for (let i = 5; i >= 0; i--) {
    const m = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const mEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);
    const total = monthlyPayments
      .filter(p => p.paymentDate >= m && p.paymentDate < mEnd)
      .reduce((s, p) => s + p.amount, 0);
    monthlyRevenue.push(total);
  }

  return NextResponse.json({
    data: {
      stats: {
        woToday,
        woInProgress,
        woCompleted,
        revenueToday: revenueToday._sum.amount || 0,
        revenueMonth: revenueMonth._sum.amount || 0,
      },
      woStatusBreakdown: woStatusBreakdown.map(s => ({ status: s.status, count: s._count })),
      recentSO: recentSO.map(so => ({
        soNo: so.soNo,
        customer: so.customer.name,
        vehicle: so.vehicle.plateNo,
        status: so.status,
        total: so.total,
        date: so.date,
      })),
      lowStock: lowStock.map(s => ({
        sku: s.sku,
        name: s.name,
        stockQty: s.stockQty,
        minStock: s.minStock,
      })),
      masterCounts: {
        customers: totalCustomers,
        vehicles: totalVehicles,
        spareparts: totalSpareparts,
      },
      financialSummary: {
        unpaidInvoices: unpaidInvoices._count || 0,
        unpaidAmount: unpaidInvoices._sum.amountDue || 0,
        overdueAR: overdueAR._count || 0,
        overdueAmount: overdueAR._sum.balance || 0,
      },
      monthlyRevenue,
    },
  });
});
