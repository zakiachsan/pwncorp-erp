import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const search = searchParams.get("search") || "";
  const coaId = searchParams.get("coaId") || "all";
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  // Filter on journal_detail, joined with journal_entry (for header) and coa
  const where: any = { je: { storeId: user.storeId } };

  if (search) {
    where.OR = [
      { je: { jeNo: { contains: search, mode: "insensitive" } } },
      { je: { description: { contains: search, mode: "insensitive" } } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (coaId && coaId !== "all") where.coaId = coaId;

  if (dateFrom || dateTo) {
    where.je.date = {};
    if (dateFrom) where.je.date.gte = new Date(dateFrom);
    if (dateTo) where.je.date.lte = new Date(dateTo);
  }

  const [details, total, summary] = await Promise.all([
    prisma.journalDetail.findMany({
      where,
      include: {
        je: { select: { jeNo: true, date: true, description: true, refType: true, refId: true, status: true } },
        coa: { select: { id: true, code: true, name: true } },
      },
      orderBy: [{ je: { date: "desc" } }, { id: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.journalDetail.count({ where }),
    prisma.journalDetail.aggregate({
      where,
      _sum: { debit: true, credit: true },
    }),
  ]);

  const data = details.map((d: any) => ({
    id: d.id,
    jeNo: d.je.jeNo,
    date: d.je.date,
    refType: d.je.refType,
    refId: d.je.refId,
    description: d.je.description,
    detailDescription: d.description,
    coa: { id: d.coa.id, code: d.coa.code, name: d.coa.name },
    debit: d.debit,
    credit: d.credit,
  }));

  return NextResponse.json({
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    summary: {
      totalDebit: summary._sum.debit || 0,
      totalCredit: summary._sum.credit || 0,
    },
  });
});

export const POST = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { description, refType, refId, status, details, date, contact, attachment } = body;

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
  const txnDate = date ? new Date(date) : new Date();
  const mm = String(txnDate.getMonth() + 1).padStart(2, '0');
  const yyyy = txnDate.getFullYear();
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
      date: txnDate,
      description,
      refType: refType || "manual",
      refId: refId || null,
      storeId: user.storeId,
      status: status || "Draft",
      createdById: user.id,
      contact: contact || null,
      attachment: attachment || null,
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
