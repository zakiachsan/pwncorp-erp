import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const warehouseId = searchParams.get("warehouseId");

  if (!warehouseId) {
    return NextResponse.json({ error: "warehouseId is required" }, { status: 400 });
  }

  try {
    const stocks = await prisma.warehouseStock.findMany({
      where: { warehouseId },
    });

    const stockMap: Record<string, number> = {};
    for (const s of stocks) {
      stockMap[s.sparepartId] = s.qty;
    }

    return NextResponse.json({ data: stockMap });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
