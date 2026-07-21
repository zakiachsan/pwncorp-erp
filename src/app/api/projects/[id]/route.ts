import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const project = await prisma.project.findFirst({
    where: { OR: [{ id: params.id }, { name: params.id }] },
    include: {
      customer: { select: { id: true, name: true, phone: true, email: true } },
      expenses: { orderBy: { date: "desc" } },
      _count: { select: { expenses: true } },
    },
  });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  return NextResponse.json({ data: project });
});

export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const body = await req.json();
  const { name, status, contractValue, startDate, endDate, customerId } = body;

  const existing = await prisma.project.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const project = await prisma.project.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined && { name }),
      ...(status !== undefined && { status }),
      ...(contractValue !== undefined && { contractValue }),
      ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
      ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      ...(customerId !== undefined && { customerId }),
    },
    include: {
      customer: { select: { id: true, name: true } },
      _count: { select: { expenses: true } },
    },
  });

  return NextResponse.json({ data: project });
});
