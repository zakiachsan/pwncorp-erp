import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";
import { generateInvNumber } from "@/lib/numbering";
import { logActivity } from "@/lib/activity-log";

export const GET = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status");
  const customerId = searchParams.get("customerId");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const where: any = { storeId: user.storeId };
  if (search) where.invNo = { contains: search, mode: "insensitive" };
  if (status) where.status = status;
  if (customerId) where.customerId = customerId;
  if (dateFrom || dateTo) {
    where.invoiceDate = {};
    if (dateFrom) where.invoiceDate.gte = new Date(dateFrom);
    if (dateTo) where.invoiceDate.lte = new Date(dateTo);
  }

  const [data, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, type: true } },
        wo: { select: { woNo: true } },
        ar: { select: { amount: true, balance: true, status: true } },
        _count: { select: { items: true, payments: true } },
      },
      orderBy: { invoiceDate: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.invoice.count({ where }),
  ]);

  return NextResponse.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const POST = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { woId, dueDate } = body;

  if (!woId) return NextResponse.json({ error: "woId is required" }, { status: 400 });

  // Validate WO exists and is Completed
  const wo = await prisma.workOrder.findFirst({
    where: { id: woId, storeId: user.storeId },
    include: {
      items: true,
      so: { include: { customer: true } },
      invoices: true,
    },
  });
  if (!wo) return NextResponse.json({ error: "Work order not found" }, { status: 404 });

  // Check for existing invoice
  if (wo.invoices.length > 0) {
    return NextResponse.json({ error: "Invoice already exists for this work order" }, { status: 409 });
  }

  // Calculate total from WO items
  const total = wo.items.reduce((sum, item) => sum + item.total, 0);
  const invNo = await generateInvNumber(user.storeId);

  // Create invoice with items
  const invoice = await prisma.invoice.create({
    data: {
      invNo,
      woId,
      customerId: wo.so.customerId,
      storeId: user.storeId,
      total,
      amountDue: total,
      invoiceDate: new Date(),
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // default 30 days
      items: {
        create: wo.items.map(item => ({
          item: item.itemName,
          description: item.itemType === "sparepart" ? "Sparepart" : "Jasa",
          qty: item.qty,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
      },
    },
    include: {
      customer: { select: { id: true, name: true, type: true } },
      wo: { select: { woNo: true } },
      items: true,
    },
  });

  // Auto-create AR for all invoices
  await prisma.accountReceivable.create({
    data: {
      invoiceId: invoice.id,
      customerId: wo.so.customerId,
      amount: total,
      balance: total,
      dueDate: invoice.dueDate!,
    },
  });

  await logActivity({ userId: user.id, action: "INVOICE_CREATED", entity: "Invoice", entityId: invoice.id, details: { invNo: invoice.invNo, woNo: wo.woNo, soId: wo.soId, total } });

  // Auto journal: Piutang Usaha (D) vs Pendapatan (K)
  try {
    const piutangCOA = await prisma.cOA.findFirst({ where: { code: "1200" } });
    // Split revenue: sparepart items → 4200, service items → 4100
    const sparepartTotal = wo.items.filter(i => i.itemType === "sparepart").reduce((s, i) => s + i.total, 0);
    const serviceTotal = wo.items.filter(i => i.itemType !== "sparepart").reduce((s, i) => s + i.total, 0);
    const jasaCOA = await prisma.cOA.findFirst({ where: { code: "4100" } });
    const sparepartCOA = await prisma.cOA.findFirst({ where: { code: "4200" } });

    if (piutangCOA) {
      const details: any[] = [
        { coaId: piutangCOA.id, description: `Piutang ${invoice.invNo} - ${wo.so.customer.name}`, debit: total, credit: 0 },
      ];
      if (serviceTotal > 0 && jasaCOA) {
        details.push({ coaId: jasaCOA.id, description: `Pendapatan Jasa ${invoice.invNo}`, debit: 0, credit: serviceTotal });
      }
      if (sparepartTotal > 0 && sparepartCOA) {
        details.push({ coaId: sparepartCOA.id, description: `Pendapatan Sparepart ${invoice.invNo}`, debit: 0, credit: sparepartTotal });
      }
      // Fallback: all to pendapatan jasa if sparepart COA missing
      if (details.length === 1 && jasaCOA) {
        details.push({ coaId: jasaCOA.id, description: `Pendapatan ${invoice.invNo}`, debit: 0, credit: total });
      }

      // Generate JU number: JU-XXX/MM/YYYY
        const _now = new Date();
        const _mm = String(_now.getMonth() + 1).padStart(2, '0');
        const _yyyy = _now.getFullYear();
        const _dateSuffix = `/${_mm}/${_yyyy}`;
        const _lastJE = await prisma.journalEntry.findFirst({
          where: { jeNo: { startsWith: 'JU-' }, jeNo: { endsWith: _dateSuffix } },
          orderBy: { jeNo: 'desc' },
        });
        const _seq = _lastJE ? parseInt(_lastJE.jeNo.split('-')[1]?.split('/')[0] || '0') + 1 : 1;
        const jeNo = `JU-${String(_seq).padStart(3, '0')}${_dateSuffix}`;
      await prisma.journalEntry.create({
        data: {
          jeNo,
          date: new Date(),
          description: `Invoice ${invoice.invNo} - ${wo.so.customer.name}`,
          refType: "invoice",
          refId: invoice.id,
          storeId: user.storeId,
          status: "Posted",
          createdById: user.id,
          details: { create: details },
        },
      });
    }
  } catch (err) {
    console.error("Auto-journal (invoice) failed:", err);
  }

  return NextResponse.json({ data: invoice }, { status: 201 });
});
