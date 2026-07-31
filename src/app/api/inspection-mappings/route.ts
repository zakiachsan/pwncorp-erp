import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

// GET /api/inspection-mappings?inspectionItemId=xxx
export const GET = withAuth(async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const inspectionItemId = searchParams.get("inspectionItemId");
  const soId = searchParams.get("soId");

  const where: any = {};
  if (inspectionItemId) where.inspectionItemId = inspectionItemId;
  if (soId) {
    where.inspectionItem = { soId };
  }

  const mappings = await prisma.inspectionItemMapping.findMany({
    where,
    include: { inspectionItem: { select: { id: true, description: true, soId: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ data: mappings });
});

// POST /api/inspection-mappings
// Body: { inspectionItemId, sourceType, sourceId, qty? }
export const POST = withAuth(async (req: NextRequest) => {
  const body = await req.json();
  const { inspectionItemId, sourceType, sourceId, qty } = body;

  if (!inspectionItemId || !sourceType || !sourceId) {
    return NextResponse.json(
      { error: "inspectionItemId, sourceType, and sourceId are required" },
      { status: 400 }
    );
  }

  if (!["Package", "Sparepart", "Service", "Sublet", "Sundry"].includes(sourceType)) {
    return NextResponse.json(
      { error: `Invalid sourceType: ${sourceType}. Must be Package, Sparepart, Service, Sublet, or Sundry` },
      { status: 400 }
    );
  }

  // Check if mapping already exists (prevent duplicate)
  const existing = await prisma.inspectionItemMapping.findFirst({
    where: { inspectionItemId, sourceType, sourceId },
  });
  if (existing) {
    return NextResponse.json(
      { error: "This item is already mapped to this inspection" },
      { status: 409 }
    );
  }

  const mapping = await prisma.inspectionItemMapping.create({
    data: {
      inspectionItemId,
      sourceType,
      sourceId,
      qty: qty || 1,
    },
  });

  return NextResponse.json({ data: mapping }, { status: 201 });
});

// DELETE /api/inspection-mappings?id=xxx
export const DELETE = withAuth(async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await prisma.inspectionItemMapping.delete({ where: { id } });
  return NextResponse.json({ data: { success: true } });
});
