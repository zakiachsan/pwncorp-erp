import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const status = searchParams.get("status");

  const where: any = { storeId: user.storeId };
  if (status) where.status = status;

  const [data, total] = await Promise.all([
    prisma.paymentRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.paymentRequest.count({ where }),
  ]);

  return NextResponse.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const POST = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { amount, purpose, vendor, dueDate, notes } = body;

  if (!amount || !purpose) {
    return NextResponse.json({ error: "amount and purpose are required" }, { status: 400 });
  }

  const prNo = `PAYREQ/${new Date().toISOString().slice(2, 10).replace(/-/g, "")}/${String(Date.now()).slice(-4)}`;

  const pr = await prisma.paymentRequest.create({
    data: {
      prNo,
      storeId: user.storeId,
      requestedBy: user.id,
      amount,
      purpose,
      vendor: vendor || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      notes,
    },
  });

  return NextResponse.json({ data: pr }, { status: 201 });
});
