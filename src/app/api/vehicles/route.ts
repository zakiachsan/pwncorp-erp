import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const customerId = searchParams.get("customerId");

  const where: any = { storeId: user.storeId };
  if (search) where.plateNo = { contains: search, mode: "insensitive" };
  if (customerId) where.customerId = customerId;

  const [data, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      include: { customer: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.vehicle.count({ where }),
  ]);

  return NextResponse.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const POST = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { customerId, plateNo, brand, model, year, chassisNo, engineNo } = body;

  if (!customerId || !plateNo || !brand) {
    return NextResponse.json({ error: "customerId, plateNo, and brand are required" }, { status: 400 });
  }

  const vehicle = await prisma.vehicle.create({
    data: { storeId: user.storeId, customerId, plateNo, brand, model, year, chassisNo, engineNo },
  });

  return NextResponse.json({ data: vehicle }, { status: 201 });
});
