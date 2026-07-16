import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status");
  const supplierId = searchParams.get("supplierId");

  const where: any = {
    po: { storeId: user.storeId },
  };
  if (search) where.docNo = { contains: search, mode: "insensitive" };
  if (status) where.status = status;
  if (supplierId) where.supplierId = supplierId;

  const [data, total] = await Promise.all([
    prisma.purchaseInvoice.findMany({
      where,
      include: {
        supplier: { select: { id: true, companyName: true } },
        po: { select: { poNo: true } },
        ap: true,
      },
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.purchaseInvoice.count({ where }),
  ]);

  return NextResponse.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const POST = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { poId, supplierId, total, dueDate } = body;

  if (!poId || !supplierId || !total) {
    return NextResponse.json({ error: "poId, supplierId, and total are required" }, { status: 400 });
  }

  // Validate PO
  const po = await prisma.purchaseOrder.findFirst({
    where: { id: poId, storeId: user.storeId },
  });
  if (!po) return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });

  // Check for existing invoice
  const existing = await prisma.purchaseInvoice.findFirst({ where: { poId } });
  if (existing) return NextResponse.json({ error: "Invoice already exists for this PO" }, { status: 409 });

  const docNo = `SPI/${new Date().toISOString().slice(2, 10).replace(/-/g, "")}/${String(Date.now()).slice(-4)}`;
  const due = dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const invoice = await prisma.purchaseInvoice.create({
    data: {
      docNo,
      poId,
      supplierId,
      total,
      status: "UNPAID",
      date: new Date(),
    },
    include: {
      supplier: { select: { id: true, companyName: true } },
      po: { select: { poNo: true } },
    },
  });

  // Auto-create AP
  await prisma.accountPayable.create({
    data: {
      purchaseInvoiceId: invoice.id,
      supplierId,
      amount: total,
      balance: total,
      dueDate: due,
    },
  });

  return NextResponse.json({ data: invoice }, { status: 201 });
});
