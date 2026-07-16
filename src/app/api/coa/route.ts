import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const kategori = searchParams.get("kategori");
  const search = searchParams.get("search") || "";
  const flat = searchParams.get("flat") === "true";

  const where: any = { isActive: true };
  if (kategori) where.kategori = kategori;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { code: { contains: search, mode: "insensitive" } },
    ];
  }

  if (flat) {
    const data = await prisma.cOA.findMany({ where, orderBy: { code: "asc" } });
    return NextResponse.json({ data });
  }

  // Tree mode: get parents then children
  const parents = await prisma.cOA.findMany({
    where: { ...where, parentId: null },
    include: { children: { orderBy: { code: "asc" } } },
    orderBy: { code: "asc" },
  });

  return NextResponse.json({ data: parents });
});

export const POST = withAuth(async (req: NextRequest) => {
  const body = await req.json();
  const { code, name, kategori, normalBalance, parentId, level } = body;

  if (!code || !name || !kategori || !normalBalance) {
    return NextResponse.json({ error: "code, name, kategori, and normalBalance are required" }, { status: 400 });
  }

  const existing = await prisma.cOA.findUnique({ where: { code } });
  if (existing) return NextResponse.json({ error: "COA code already exists" }, { status: 409 });

  const coa = await prisma.cOA.create({
    data: { code, name, kategori, normalBalance, parentId: parentId || null, level: level || 1 },
    include: { children: true },
  });

  return NextResponse.json({ data: coa }, { status: 201 });
});
