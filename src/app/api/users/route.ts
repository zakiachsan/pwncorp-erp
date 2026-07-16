import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

// Exclude passwordHash from responses
const userSelect = {
  id: true, name: true, email: true, roleId: true, storeId: true, isActive: true, createdAt: true,
  role: { select: { id: true, name: true } },
  store: { select: { id: true, name: true, code: true } },
};

export const GET = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const roleId = searchParams.get("roleId");

  const where: any = { storeId: user.storeId, isActive: true };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }
  if (roleId) where.roleId = roleId;

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: userSelect,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const POST = withAuth(async (req: NextRequest) => {
  const currentUser = (await getCurrentUser()) as any;
  const body = await req.json();
  const { name, email, password, roleId, storeId } = body;

  if (!name || !email || !password || !roleId) {
    return NextResponse.json({ error: "name, email, password, and roleId are required" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Email already exists" }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: { name, email, passwordHash, roleId, storeId: storeId || currentUser.storeId },
    select: userSelect,
  });

  return NextResponse.json({ data: newUser }, { status: 201 });
});
