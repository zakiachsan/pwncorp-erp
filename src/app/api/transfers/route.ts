import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";
import { generateTransferNumber } from "@/lib/numbering";

export const GET = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";

  const where: any = {};
  if (search) {
    where.OR = [
      { transferNo: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.transfer.findMany({
      where,
      include: {
        fromBankAccount: { select: { id: true, bankName: true, accountNo: true, accountName: true } },
        toBankAccount: { select: { id: true, bankName: true, accountNo: true, accountName: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transfer.count({ where }),
  ]);

  return NextResponse.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const POST = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { fromBankId, toBankId, amount, description, date } = body;

  if (!fromBankId) return NextResponse.json({ error: "Source account is required" }, { status: 400 });
  if (!toBankId) return NextResponse.json({ error: "Destination account is required" }, { status: 400 });
  if (!amount || amount <= 0) return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
  if (fromBankId === toBankId) return NextResponse.json({ error: "Source and destination must be different" }, { status: 400 });

  const transferNo = await generateTransferNumber(user.storeId);

  const transfer = await prisma.transfer.create({
    data: {
      transferNo,
      fromBankId,
      toBankId,
      amount,
      description,
      date: date ? new Date(date) : new Date(),
    },
    include: {
      fromBankAccount: { select: { id: true, bankName: true, accountNo: true, accountName: true } },
      toBankAccount: { select: { id: true, bankName: true, accountNo: true, accountName: true } },
    },
  });

  return NextResponse.json({ data: transfer }, { status: 201 });
});
