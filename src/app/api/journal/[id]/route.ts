import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const je = await prisma.journalEntry.findUnique({
    where: { id: params.id },
    include: {
      details: { include: { coa: { select: { code: true, name: true, kategori: true } } } },
      createdBy: { select: { id: true, name: true } },
      approvedBy: { select: { id: true, name: true } },
    },
  });
  if (!je) return NextResponse.json({ error: "Journal entry not found" }, { status: 404 });
  return NextResponse.json({ data: je });
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
