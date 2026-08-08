import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async () => {
  const user = (await getCurrentUser()) as any;
  const data = await prisma.journalTemplate.findMany({
    where: { storeId: user.storeId },
    include: {
      items: { include: { coa: { select: { id: true, code: true, name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ data });
});

export const POST = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { name, items } = body;

  if (!name || !items || !items.length) {
    return NextResponse.json({ error: "name and items are required" }, { status: 400 });
  }

  const tmpl = await prisma.journalTemplate.create({
    data: {
      name,
      storeId: user.storeId,
      items: {
        create: items.map((i: any) => ({ coaId: i.coaId, side: i.side || "debit" })),
      },
    },
    include: { items: true },
  });

  return NextResponse.json({ data: tmpl }, { status: 201 });
});
