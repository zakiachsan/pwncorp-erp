import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const storeId = user.storeId;
  const { searchParams } = new URL(req.url);
  const report = searchParams.get("report") || "summary-po";
  const limit = parseInt(searchParams.get("limit") || "100");

  switch (report) {
    case "summary-po": {
      const data = await prisma.purchaseOrder.findMany({
        where: { storeId },
        include: {
          supplier: { select: { companyName: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      return NextResponse.json({ data });
    }
    case "summary-delivery": {
      const data = await prisma.purchaseDelivery.findMany({
        where: { storeId },
        include: {
          po: { select: { poNo: true, supplier: { select: { companyName: true } } } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      return NextResponse.json({ data });
    }
    case "summary-return": {
      const data = await prisma.purchaseReturn.findMany({
        where: { po: { storeId } },
        include: {
          supplier: { select: { companyName: true } },
          po: { select: { poNo: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      return NextResponse.json({ data });
    }
    default:
      return NextResponse.json({ error: "Unknown report" }, { status: 400 });
  }
});
