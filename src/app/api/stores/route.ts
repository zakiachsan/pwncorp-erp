import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);

  const where = search ? { name: { contains: search, mode: "insensitive" as const } } : {};

  const data = await prisma.store.findMany({
    where,
    orderBy: { name: "asc" },
    take: limit,
    select: { id: true, name: true },
  });

  return NextResponse.json({ data });
}
