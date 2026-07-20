import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";

  const where: any = { storeId: user.storeId };
  if (search) {
    where.OR = [
      { receiptNo: { contains: search, mode: "insensitive" } },
      { customerName: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.receipt.findMany({
      where,
      include: {
        bankAccount: { select: { id: true, bankName: true, accountNo: true, accountName: true } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.receipt.count({ where }),
  ]);

  return NextResponse.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const POST = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { receiptNo, bankAccountId, customerName, amount, description, date } = body;

  if (!receiptNo) return NextResponse.json({ error: "Receipt number is required" }, { status: 400 });
  if (!bankAccountId) return NextResponse.json({ error: "Bank account is required" }, { status: 400 });
  if (!amount) return NextResponse.json({ error: "Amount is required" }, { status: 400 });

  const receipt = await prisma.receipt.create({
    data: {
      receiptNo,
      bankAccountId,
      storeId: user.storeId,
      customerName: customerName || "",
      amount,
      description,
      date: date ? new Date(date) : undefined,
      createdById: user.id,
    },
    include: {
      bankAccount: { select: { id: true, bankName: true, accountNo: true, accountName: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ data: receipt }, { status: 201 });
});
