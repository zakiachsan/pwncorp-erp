import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";
import { generateProjectNumber } from "@/lib/numbering";

export const GET = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status");

  const where: any = { storeId: user.storeId };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { customer: { name: { contains: search, mode: "insensitive" } } },
    ];
  }
  if (status) where.status = status;

  const [data, total] = await Promise.all([
    prisma.project.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true } },
        _count: { select: { expenses: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.project.count({ where }),
  ]);

  return NextResponse.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const POST = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { name, customerId, contractValue, startDate, endDate, status } = body;

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!customerId) return NextResponse.json({ error: "Customer is required" }, { status: 400 });

  const projectNo = await generateProjectNumber(user.storeId);

  const project = await prisma.project.create({
    data: {
      projectNo,
      storeId: user.storeId,
      name,
      customerId,
      contractValue: contractValue || 0,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      status: status || "active",
    },
    include: { customer: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ data: project }, { status: 201 });
});
