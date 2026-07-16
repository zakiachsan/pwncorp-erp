import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const type = searchParams.get("type");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const where: any = { storeId: user.storeId };
  if (type) where.type = type;
  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = new Date(dateFrom);
    if (dateTo) where.date.lte = new Date(dateTo);
  }

  const [data, total] = await Promise.all([
    prisma.pettyCash.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.pettyCash.count({ where }),
  ]);

  // Calculate current balance
  const allEntries = await prisma.pettyCash.findMany({
    where: { storeId: user.storeId },
    orderBy: { date: "asc" },
  });
  let runningBalance = 0;
  for (const e of allEntries) {
    runningBalance += e.type === "in" ? e.amount : -e.amount;
  }

  return NextResponse.json({
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    summary: { currentBalance: runningBalance },
  });
});

export const POST = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { description, type, amount } = body;

  if (!description || !type || !amount) {
    return NextResponse.json({ error: "description, type (in/out), and amount are required" }, { status: 400 });
  }

  // Calculate last balance
  const lastEntry = await prisma.pettyCash.findFirst({
    where: { storeId: user.storeId },
    orderBy: { date: "desc" },
  });
  const newBalance = (lastEntry?.balance || 0) + (type === "in" ? amount : -amount);

  if (type === "out" && newBalance < 0) {
    return NextResponse.json({ error: "Insufficient petty cash balance" }, { status: 400 });
  }

  const entry = await prisma.pettyCash.create({
    data: { storeId: user.storeId, description, type, amount, balance: newBalance, date: new Date() },
  });

  return NextResponse.json({ data: entry }, { status: 201 });
});
