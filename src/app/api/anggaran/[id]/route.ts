import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/auth-helpers";

export const DELETE = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const existing = await prisma.anggaran.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Anggaran not found" }, { status: 404 });

  await prisma.anggaran.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
});

export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const body = await req.json();
  const { sroId, customer, kendaraan, noPol, anggaran, realisasi } = body;

  const existing = await prisma.anggaran.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Anggaran not found" }, { status: 404 });

  const updateData: any = {};
  if (sroId !== undefined) updateData.sroId = sroId;
  if (customer !== undefined) updateData.customer = customer;
  if (kendaraan !== undefined) updateData.kendaraan = kendaraan;
  if (noPol !== undefined) updateData.noPol = noPol;
  if (anggaran !== undefined) updateData.anggaran = parseFloat(anggaran) || 0;
  if (realisasi !== undefined) updateData.realisasi = parseFloat(realisasi) || 0;

  const item = await prisma.anggaran.update({
    where: { id: params.id },
    data: updateData,
  });

  return NextResponse.json({ data: item });
});
