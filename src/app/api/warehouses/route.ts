import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const where: any = { storeId: user.storeId, isActive: true };
  if (search) where.name = { contains: search, mode: "insensitive" };

  const data = await prisma.warehouse.findMany({
    where,
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ data });
});

export const POST = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { name, code, address } = body;

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const warehouse = await prisma.warehouse.create({
    data: { storeId: user.storeId, name, code, address },
  });

  return NextResponse.json({ data: warehouse }, { status: 201 });
});
