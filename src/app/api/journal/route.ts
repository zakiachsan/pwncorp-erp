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
  const refType = searchParams.get("refType");
  const coaId = searchParams.get("coaId");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const where: any = { storeId: user.storeId };
  if (search) {
    where.OR = [
      { jeNo: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (status) where.status = status;
  if (refType) where.refType = refType;
  if (coaId) where.details = { some: { coaId } };
  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = new Date(dateFrom);
    if (dateTo) where.date.lte = new Date(dateTo);
  }

  const [data, total] = await Promise.all([
    prisma.journalEntry.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true } },
        details: {
          select: { debit: true, credit: true, coaId: true, description: true },
        },
      },
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.journalEntry.count({ where }),
  ]);

  // Calculate totalDebit/totalCredit for each entry
  const dataWithTotals = data.map((j: any) => ({
    ...j,
    totalDebit: j.details.reduce((s: number, d: any) => s + (d.debit || 0), 0),
    totalCredit: j.details.reduce((s: number, d: any) => s + (d.credit || 0), 0),
  }));

  return NextResponse.json({ data: dataWithTotals, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const POST = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { description, refType, refId, status, details } = body;

  if (!description || !details || !details.length) {
    return NextResponse.json({ error: "description and details are required" }, { status: 400 });
  }

  // Validate debit = credit
  const totalDebit = details.reduce((sum: number, d: any) => sum + (d.debit || 0), 0);
  const totalCredit = details.reduce((sum: number, d: any) => sum + (d.credit || 0), 0);
  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    return NextResponse.json({ error: `Debit (${totalDebit}) and credit (${totalCredit}) must balance` }, { status: 400 });
  }

  // Generate JU number: JU-XXX/MM/YYYY
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const dateSuffix = `/${mm}/${yyyy}`;
  const prefix = `JU-`;
  const lastJE = await prisma.journalEntry.findFirst({
    where: { jeNo: { startsWith: prefix, endsWith: dateSuffix } },
    orderBy: { jeNo: 'desc' },
  });
  const seq = lastJE ? parseInt(lastJE.jeNo.split('-')[1]?.split('/')[0] || '0') + 1 : 1;
  const jeNo = `${prefix}${String(seq).padStart(3, '0')}${dateSuffix}`;

  const je = await prisma.journalEntry.create({
    data: {
      jeNo,
      date: new Date(),
      description,
      refType: refType || "manual",
      refId: refId || null,
      storeId: user.storeId,
      status: status || "Draft",
      createdById: user.id,
      details: {
        create: details.map((d: any) => ({
          coaId: d.coaId,
          description: d.description,
          debit: d.debit || 0,
          credit: d.credit || 0,
        })),
      },
    },
    include: {
      details: { include: { coa: { select: { code: true, name: true } } } },
      createdBy: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ data: je }, { status: 201 });
});
