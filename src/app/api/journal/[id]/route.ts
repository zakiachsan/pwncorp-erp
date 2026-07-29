import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  // Support lookup by id OR jeNo
  const identifier = decodeURIComponent(params.id);
  const je = await prisma.journalEntry.findFirst({
    where: identifier.includes('/') ? { jeNo: identifier } : { id: identifier },
    include: {
      details: { include: { coa: { select: { code: true, name: true, kategori: true } } } },
      createdBy: { select: { id: true, name: true } },
      approvedBy: { select: { id: true, name: true } },
    },
  });
  if (!je) return NextResponse.json({ error: "Journal entry not found" }, { status: 404 });

  // Calculate totals and alias details → lines for frontend
  const totalDebit = je.details.reduce((s: number, d: any) => s + (d.debit || 0), 0);
  const totalCredit = je.details.reduce((s: number, d: any) => s + (d.credit || 0), 0);

  return NextResponse.json({ data: { ...je, lines: je.details, totalDebit, totalCredit } });
});

export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { status } = body;

  const existing = await prisma.journalEntry.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Journal entry not found" }, { status: 404 });

  const updateData: any = {};
  if (status === "Approved") {
    updateData.status = "Approved";
    updateData.approvedById = user.id;
  } else if (status === "Posted") {
    updateData.status = "Posted";
  }

  const je = await prisma.journalEntry.update({
    where: { id: params.id },
    data: updateData,
    include: {
      details: { include: { coa: { select: { code: true, name: true } } } },
    },
  });

  return NextResponse.json({ data: je });
});
