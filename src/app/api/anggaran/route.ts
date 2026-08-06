import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const { searchParams } = new URL(req.url);
  const swoId = searchParams.get("swoId");

  const where: any = { storeId: user.storeId };
  if (swoId) where.swoId = swoId;

  const data = await prisma.anggaran.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data });
});

export const POST = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { swoId, sroId, customer, kendaraan, noPol, anggaran, realisasi } = body;

  if (!swoId) {
    return NextResponse.json({ error: "swoId is required" }, { status: 400 });
  }

  const item = await prisma.anggaran.create({
    data: {
      swoId,
      sroId: sroId || null,
      customer: customer || null,
      kendaraan: kendaraan || null,
      noPol: noPol || null,
      anggaran: parseFloat(anggaran) || 0,
      realisasi: parseFloat(realisasi) || 0,
      storeId: user.storeId,
    },
  });

  return NextResponse.json({ data: item }, { status: 201 });
});
