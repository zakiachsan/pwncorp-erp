import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest) => {
  const user = (req as any).user || (await import("@/lib/auth-helpers").then(m => m.getCurrentUser()));
  const storeId = (user as any).storeId;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type");

  const where: any = { storeId, isActive: true };
  if (search) where.name = { contains: search, mode: "insensitive" };
  if (type) where.type = type;

  const [data, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      include: { _count: { select: { vehicles: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.customer.count({ where }),
  ]);

  return NextResponse.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const POST = withAuth(async (req: NextRequest) => {
  const user = (await import("@/lib/auth-helpers").then(m => m.getCurrentUser())) as any;
  const body = await req.json();
  const { name, type, phone, whatsapp, email, address } = body;

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const customer = await prisma.customer.create({
    data: { storeId: user.storeId, name, type: type || "retail", phone, whatsapp, email, address },
  });

  return NextResponse.json({ data: customer }, { status: 201 });
});
