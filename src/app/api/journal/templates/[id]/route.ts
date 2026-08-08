import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/auth-helpers";

export const PATCH = withAuth(async (req: NextRequest, { params }: any) => {
  const body = await req.json();
  const { name, items } = body;

  const tmpl = await prisma.journalTemplate.findUnique({ where: { id: params.id } });
  if (!tmpl) return NextResponse.json({ error: "Template not found" }, { status: 404 });

  await prisma.journalTemplateItem.deleteMany({ where: { templateId: params.id } });

  const updated = await prisma.journalTemplate.update({
    where: { id: params.id },
    data: {
      name: name || tmpl.name,
      items: {
        create: (items || []).map((i: any) => ({ coaId: i.coaId, side: i.side || "debit" })),
      },
    },
    include: { items: true },
  });

  return NextResponse.json({ data: updated });
});

export const DELETE = withAuth(async (_req: NextRequest, { params }: any) => {
  await prisma.journalTemplate.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
});
