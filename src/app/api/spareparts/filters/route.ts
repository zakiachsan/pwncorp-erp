import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;

  const [brands, categories] = await Promise.all([
    prisma.sparepart.findMany({
      where: { storeId: user.storeId, brand: { not: null } },
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { brand: "asc" },
    }),
    prisma.sparepart.findMany({
      where: { storeId: user.storeId, category: { not: null } },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
  ]);

  return NextResponse.json({
    brands: brands.map((b) => b.brand).filter(Boolean),
    categories: categories.map((c) => c.category).filter(Boolean),
  });
});
