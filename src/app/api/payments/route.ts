import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";
import { logActivity } from "@/lib/activity-log";

export const GET = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const invoiceId = searchParams.get("invoiceId");
  const paymentMethod = searchParams.get("paymentMethod");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const where: any = {
    invoice: { storeId: user.storeId },
  };
  const search = searchParams.get("search") || "";
  if (search) {
    where.OR = [
      { refNo: { contains: search, mode: "insensitive" } },
      { id: search },
    ];
  }
  if (invoiceId) where.invoiceId = invoiceId;
  if (paymentMethod) where.paymentMethod = paymentMethod;
  if (dateFrom || dateTo) {
    where.paymentDate = {};
    if (dateFrom) where.paymentDate.gte = new Date(dateFrom);
    if (dateTo) where.paymentDate.lte = new Date(dateTo);
  }

  const [data, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        invoice: { select: { invNo: true, status: true, customer: { select: { name: true } } } },
      },
      orderBy: { paymentDate: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.payment.count({ where }),
  ]);

  return NextResponse.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const POST = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { invoiceId, amount, paymentMethod, refNo, notes } = body;

  if (!invoiceId || !amount || amount <= 0) {
    return NextResponse.json({ error: "invoiceId and valid amount are required" }, { status: 400 });
  }

  // Validate invoice
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, storeId: user.storeId },
    include: { customer: true, ar: true, wo: { select: { id: true, soId: true, woNo: true } } },
  });
  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  if (invoice.status === "PAID") {
    return NextResponse.json({ error: "Invoice already fully paid" }, { status: 400 });
  }
  if (amount > invoice.amountDue) {
    return NextResponse.json({ error: `Amount exceeds remaining due: Rp ${invoice.amountDue.toLocaleString("id-ID")}` }, { status: 400 });
  }

  // Create payment
  const payment = await prisma.payment.create({
    data: {
      invoiceId,
      amount,
      paymentMethod: paymentMethod || "cash",
      refNo,
      notes,
    },
  });

  // Update invoice
  const newAmountPaid = invoice.amountPaid + amount;
  const newAmountDue = invoice.total - newAmountPaid;
  let newStatus = "UNPAID";
  if (newAmountDue <= 0) newStatus = "PAID";
  else if (newAmountPaid > 0) newStatus = "PARTIAL";

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      amountPaid: newAmountPaid,
      amountDue: Math.max(0, newAmountDue),
      status: newStatus,
    },
  });

  // Update AR if exists
  if (invoice.ar.length > 0) {
    const ar = invoice.ar[0];
    const newBalance = ar.amount - newAmountPaid;
    await prisma.accountReceivable.update({
      where: { id: ar.id },
      data: {
        balance: Math.max(0, newBalance),
        status: newBalance <= 0 ? "PAID" : "OPEN",
      },
    });
  }

  // Auto journal entry: Kas/Bank (D) vs Piutang Usaha (K)
  try {
    // Determine Kas COA based on payment method
    let kasCode = "1110"; // default: Kas Tunai
    if (paymentMethod === "transfer") kasCode = "1120"; // Bank BCA
    const kasCOA = await prisma.cOA.findFirst({ where: { code: kasCode } });
    const piutangCOA = await prisma.cOA.findFirst({ where: { code: "1200" } });

    if (kasCOA && piutangCOA) {
      // Generate JU number: JU-XXX/MM/YYYY
        const _now = new Date();
        const _mm = String(_now.getMonth() + 1).padStart(2, '0');
        const _yyyy = _now.getFullYear();
        const _dateSuffix = `/${_mm}/${_yyyy}`;
        const _lastJE = await prisma.journalEntry.findFirst({
          where: { jeNo: { startsWith: 'JU-', endsWith: _dateSuffix } },
          orderBy: { jeNo: 'desc' },
        });
        const _seq = _lastJE ? parseInt(_lastJE.jeNo.split('-')[1]?.split('/')[0] || '0') + 1 : 1;
        const jeNo = `JU-${String(_seq).padStart(3, '0')}${_dateSuffix}`;
      await prisma.journalEntry.create({
        data: {
          jeNo,
          date: new Date(),
          description: `Pembayaran invoice ${invoice.invNo} - ${invoice.customer.name}`,
          refType: "payment",
          refId: payment.id,
          storeId: user.storeId,
          status: "Posted",
          createdById: user.id,
          details: {
            create: [
              { coaId: kasCOA.id, description: `Penerimaan ${invoice.invNo}`, debit: amount, credit: 0 },
              { coaId: piutangCOA.id, description: `Pelunasan Piutang ${invoice.invNo}`, debit: 0, credit: amount },
            ],
          },
        },
      });
    }
  } catch (err) {
    console.error("Auto-journal (payment) failed:", err);
  }

  await logActivity({ userId: user.id, action: "PAYMENT_RECEIVED", entity: "Payment", entityId: payment.id, details: { invNo: invoice.invNo, woNo: invoice.wo?.woNo, soId: invoice.wo?.soId, amount, method: paymentMethod || "cash", newStatus } });

  return NextResponse.json({
    data: {
      ...payment,
      invoiceStatus: newStatus,
      amountPaid: newAmountPaid,
      amountDue: Math.max(0, newAmountDue),
    },
  }, { status: 201 });
});
