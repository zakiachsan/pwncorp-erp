import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const ret = await prisma.purchaseReturn.findUnique({
    where: { id: params.id },
    include: {
      po: {
        select: {
          id: true,
          poNo: true,
          warehouse: true,
          items: {
            include: { sparepart: { select: { id: true, sku: true, name: true, code: true } } },
          },
        },
      },
      supplier: { select: { id: true, companyName: true, address: true, phone: true } },
    },
  });
  if (!ret) return NextResponse.json({ error: "Purchase return not found" }, { status: 404 });
  return NextResponse.json({ data: ret });
});
