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
  const { description, type, amount, category, date } = body;

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
    data: {
      storeId: user.storeId,
      description,
      type,
      amount,
      balance: newBalance,
      category: category || "Lain-lain",
      date: date ? new Date(date) : new Date(),
    },
  });

  // Auto journal: Kas Tunai vs Beban/Pendapatan
  try {
    const kasCOA = await prisma.cOA.findFirst({ where: { code: "1110" } });
    if (kasCOA) {
      // Map category to expense COA
      const categoryToCOA: Record<string, string> = {
        "ATK & Perlengkapan": "5300",
        "Transportasi": "5200",
        "Konsumsi": "5200",
        "Maintenance": "5300",
        "Lain-lain": "5300",
      };
      const expenseCode = categoryToCOA[category || "Lain-lain"] || "5300";
      const expenseCOA = await prisma.cOA.findFirst({ where: { code: expenseCode } });
      const pendapatanCOA = await prisma.cOA.findFirst({ where: { code: "4200" } });

      const details: any[] = [];
      if (type === "in" && pendapatanCOA) {
        // Kas masuk: Kas Tunai (D) vs Pendapatan (K)
        details.push({ coaId: kasCOA.id, description: `Kas Masuk: ${description}`, debit: amount, credit: 0 });
        details.push({ coaId: pendapatanCOA.id, description: `Pendapatan: ${description}`, debit: 0, credit: amount });
      } else if (type === "out" && expenseCOA) {
        // Kas keluar: Beban (D) vs Kas Tunai (K)
        details.push({ coaId: expenseCOA.id, description: `${category}: ${description}`, debit: amount, credit: 0 });
        details.push({ coaId: kasCOA.id, description: `Kas Keluar: ${description}`, debit: 0, credit: amount });
      }

      if (details.length === 2) {
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
            date: entry.date,
            description: `Buku Kasir: ${description}`,
            refType: "petty_cash",
            refId: entry.id,
            storeId: user.storeId,
            status: "Posted",
            createdById: user.id,
            details: { create: details },
          },
        });
      }
    }
  } catch (err) {
    console.error("Auto-journal (petty cash) failed:", err);
  }

  return NextResponse.json({ data: entry }, { status: 201 });
});
