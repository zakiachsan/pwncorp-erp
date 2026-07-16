import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: params.id },
    include: { customer: true },
  });
  if (!vehicle) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  return NextResponse.json({ data: vehicle });
});

export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const body = await req.json();
  const { customerId, plateNo, brand, model, year, chassisNo, engineNo } = body;

  const existing = await prisma.vehicle.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });

  const vehicle = await prisma.vehicle.update({
    where: { id: params.id },
    data: {
      ...(customerId !== undefined && { customerId }),
      ...(plateNo !== undefined && { plateNo }),
      ...(brand !== undefined && { brand }),
      ...(model !== undefined && { model }),
      ...(year !== undefined && { year }),
      ...(chassisNo !== undefined && { chassisNo }),
      ...(engineNo !== undefined && { engineNo }),
    },
  });

  return NextResponse.json({ data: vehicle });
});

export const DELETE = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const existing = await prisma.vehicle.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  await prisma.vehicle.delete({ where: { id: params.id } });
  return NextResponse.json({ data: { success: true } });
});
