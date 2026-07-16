import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";
import { generateInvNumber } from "@/lib/numbering";

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
  if (wo.status !== "Completed") {
    return NextResponse.json({ error: "Work order must be Completed before generating invoice" }, { status: 400 });
  }

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

  // Auto-create AR for wholesale customers
  if (wo.so.customer.type === "wholesale") {
    await prisma.accountReceivable.create({
      data: {
        invoiceId: invoice.id,
        customerId: wo.so.customerId,
        amount: total,
        balance: total,
        dueDate: invoice.dueDate!,
      },
    });
  }

  return NextResponse.json({ data: invoice }, { status: 201 });
});
