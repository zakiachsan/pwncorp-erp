import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const coa = await prisma.cOA.findUnique({
    where: { id: params.id },
    include: { children: true, parent: true },
  });
  if (!coa) return NextResponse.json({ error: "COA not found" }, { status: 404 });
  return NextResponse.json({ data: coa });
});

export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const body = await req.json();
  const { name, kategori, normalBalance, parentId, isActive, code, divisi, note, noRek, pemilik } = body;

  const existing = await prisma.cOA.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "COA not found" }, { status: 404 });

  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (kategori !== undefined) updateData.kategori = kategori;
  if (normalBalance !== undefined) updateData.normalBalance = normalBalance;
  if (parentId !== undefined) updateData.parentId = parentId;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (code !== undefined) updateData.code = code;
  if (divisi !== undefined) updateData.divisi = divisi;
  if (note !== undefined) updateData.note = note;
  if (noRek !== undefined) updateData.noRek = noRek;
  if (pemilik !== undefined) updateData.pemilik = pemilik;

  const coa = await prisma.cOA.update({
    where: { id: params.id },
    data: updateData,
  });

  return NextResponse.json({ data: coa });
});

export const DELETE = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const existing = await prisma.cOA.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "COA not found" }, { status: 404 });

  await prisma.cOA.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
});
