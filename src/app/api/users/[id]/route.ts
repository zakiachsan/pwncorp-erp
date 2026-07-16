import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

const userSelect = {
  id: true, name: true, email: true, roleId: true, storeId: true, isActive: true, createdAt: true,
  role: { select: { id: true, name: true } },
  store: { select: { id: true, name: true, code: true } },
};

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: userSelect,
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json({ data: user });
});

export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const currentUser = (await getCurrentUser()) as any;
  const body = await req.json();
  const { name, email, password, roleId, storeId, isActive } = body;

  const existing = await prisma.user.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (email && email !== existing.email) {
    const dup = await prisma.user.findUnique({ where: { email } });
    if (dup) return NextResponse.json({ error: "Email already exists" }, { status: 409 });
  }

  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (roleId !== undefined) updateData.roleId = roleId;
  if (storeId !== undefined) updateData.storeId = storeId;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (password) updateData.passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.update({
    where: { id: params.id },
    data: updateData,
    select: userSelect,
  });

  return NextResponse.json({ data: user });
});

export const DELETE = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const currentUser = (await getCurrentUser()) as any;
  if (params.id === currentUser.id) {
    return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await prisma.user.update({ where: { id: params.id }, data: { isActive: false } });
  return NextResponse.json({ data: { success: true } });
});
