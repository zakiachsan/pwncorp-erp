import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const storeId = user.storeId;
  const { searchParams } = new URL(req.url);
  const report = searchParams.get("report") || "summary-so";
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const dateFilter: any = {};
  if (dateFrom) dateFilter.gte = new Date(dateFrom);
  if (dateTo) dateFilter.lte = new Date(dateTo);

  switch (report) {
    case "summary-so": {
      const data = await prisma.serviceOrder.findMany({
        where: { storeId, ...(Object.keys(dateFilter).length ? { date: dateFilter } : {}) },
        include: {
          customer: { select: { name: true } },
          vehicle: { select: { plateNo: true } },
          sa: { select: { name: true } },
        },
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      });
      const total = await prisma.serviceOrder.count({
        where: { storeId, ...(Object.keys(dateFilter).length ? { date: dateFilter } : {}) },
      });
      // Aggregate
      const agg = await prisma.serviceOrder.aggregate({
        where: { storeId, ...(Object.keys(dateFilter).length ? { date: dateFilter } : {}) },
        _sum: { total: true },
        _count: true,
      });
      return NextResponse.json({
        data,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        summary: { totalOrders: agg._count, totalAmount: agg._sum.total || 0 },
      });
    }

    case "summary-wo": {
      const data = await prisma.workOrder.findMany({
        where: { storeId },
        include: {
          so: { select: { soNo: true, customer: { select: { name: true } }, vehicle: { select: { plateNo: true } } } },
          mekanik: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      });
      const total = await prisma.workOrder.count({ where: { storeId } });
      const agg = await prisma.workOrder.groupBy({
        by: ["status"],
        where: { storeId },
        _count: true,
      });
      return NextResponse.json({
        data,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        summary: { statusBreakdown: agg },
      });
    }

    case "summary-invoices": {
      const data = await prisma.invoice.findMany({
        where: { storeId, ...(Object.keys(dateFilter).length ? { invoiceDate: dateFilter } : {}) },
        include: {
          customer: { select: { name: true } },
          _count: { select: { payments: true } },
        },
        orderBy: { invoiceDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      });
      const total = await prisma.invoice.count({
        where: { storeId, ...(Object.keys(dateFilter).length ? { invoiceDate: dateFilter } : {}) },
      });
      const agg = await prisma.invoice.aggregate({
        where: { storeId, ...(Object.keys(dateFilter).length ? { invoiceDate: dateFilter } : {}) },
        _sum: { total: true, amountPaid: true, amountDue: true },
      });
      return NextResponse.json({
        data,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        summary: {
          totalInvoiced: agg._sum.total || 0,
          totalPaid: agg._sum.amountPaid || 0,
          totalDue: agg._sum.amountDue || 0,
        },
      });
    }

    case "daily-payments": {
      const data = await prisma.payment.findMany({
        where: {
          invoice: { storeId },
          ...(Object.keys(dateFilter).length ? { paymentDate: dateFilter } : {}),
        },
        include: {
          invoice: { select: { invNo: true, customer: { select: { name: true } } } },
        },
        orderBy: { paymentDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      });
      const total = await prisma.payment.count({
        where: { invoice: { storeId }, ...(Object.keys(dateFilter).length ? { paymentDate: dateFilter } : {}) },
      });
      const agg = await prisma.payment.aggregate({
        where: { invoice: { storeId }, ...(Object.keys(dateFilter).length ? { paymentDate: dateFilter } : {}) },
        _sum: { amount: true },
      });
      return NextResponse.json({
        data,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        summary: { totalPayments: agg._sum.amount || 0 },
      });
    }

    default:
      return NextResponse.json({ error: "Unknown report type" }, { status: 400 });
  }
});
