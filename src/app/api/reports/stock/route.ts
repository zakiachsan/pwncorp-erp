import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const storeId = user.storeId;
  const { searchParams } = new URL(req.url);
  const report = searchParams.get("report") || "stock-position";
  const limit = parseInt(searchParams.get("limit") || "100");

  switch (report) {
    case "stock-position": {
      const data = await prisma.sparepart.findMany({
        where: { storeId },
        include: { supplier: { select: { companyName: true } } },
        orderBy: { stockQty: "asc" },
        take: limit,
      });
      return NextResponse.json({ data });
    }
    case "stock-movement": {
      const data = await prisma.stockHistory.findMany({
        where: { storeId },
        include: { sparepart: { select: { sku: true, name: true } } },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      return NextResponse.json({ data });
    }
    case "low-stock": {
      const data = await prisma.sparepart.findMany({
        where: { storeId, stockQty: { lte: prisma.sparepart.fields.minStock } },
        include: { supplier: { select: { companyName: true } } },
        orderBy: { stockQty: "asc" },
        take: limit,
      });
      return NextResponse.json({ data });
    }
    default:
      return NextResponse.json({ error: "Unknown report" }, { status: 400 });
  }
});
