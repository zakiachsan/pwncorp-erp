import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const pr = await prisma.paymentRequest.findUnique({ where: { id: params.id } });
  if (!pr) return NextResponse.json({ error: "Payment request not found" }, { status: 404 });
  return NextResponse.json({ data: pr });
});

export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const body = await req.json();
  const { status } = body;

  const validStatuses = ["pending", "approved", "rejected", "paid"];
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json({ error: `Invalid status: ${status}` }, { status: 400 });
  }

  const existing = await prisma.paymentRequest.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Payment request not found" }, { status: 404 });

  const pr = await prisma.paymentRequest.update({
    where: { id: params.id },
    data: { status },
  });

  return NextResponse.json({ data: pr });
});
