import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

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
        invoice: { select: { invNo: true, customer: { select: { name: true } } } },
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
    include: { customer: true, ar: true },
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

  // Auto journal entry: Kas (D) vs Pendapatan (K)
  try {
    // Find the Kas/Bank COA account
    const kasCOA = await prisma.cOA.findFirst({
      where: { name: { contains: "Kas", mode: "insensitive" }, kategori: "Asset" },
    });
    const revenueCOA = await prisma.cOA.findFirst({
      where: { name: { contains: "Pendapatan", mode: "insensitive" }, kategori: "Revenue" },
    });

    if (kasCOA && revenueCOA) {
      const jeNo = `JE/${new Date().toISOString().slice(2, 10).replace(/-/g, "")}/${String(Date.now()).slice(-4)}`;
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
              { coaId: revenueCOA.id, description: `Pendapatan ${invoice.invNo}`, debit: 0, credit: amount },
            ],
          },
        },
      });
    }
  } catch (err) {
    // Journal is non-critical — log but don't fail payment
    console.error("Auto-journal failed:", err);
  }

  return NextResponse.json({
    data: {
      ...payment,
      invoiceStatus: newStatus,
      amountPaid: newAmountPaid,
      amountDue: Math.max(0, newAmountDue),
    },
  }, { status: 201 });
});
