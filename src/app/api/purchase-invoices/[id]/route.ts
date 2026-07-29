import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const invoice = await prisma.purchaseInvoice.findFirst({
    where: { OR: [{ id: params.id }, { docNo: params.id }] },
    include: {
      supplier: true,
      po: { select: { poNo: true, total: true } },
      ap: true,
    },
  });
  if (!invoice) return NextResponse.json({ error: "Purchase invoice not found" }, { status: 404 });
  return NextResponse.json({ data: invoice });
});

export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const body = await req.json();
  const { status } = body;

  const existing = await prisma.purchaseInvoice.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Purchase invoice not found" }, { status: 404 });

  const updateData: any = {};
  if (status !== undefined) updateData.status = status;

  // If marked as PAID, update AP + auto journal
  if (status === "PAID") {
    const ap = await prisma.accountPayable.findFirst({ where: { purchaseInvoiceId: params.id } });
    if (ap) {
      await prisma.accountPayable.update({
        where: { id: ap.id },
        data: { balance: 0, status: "PAID" },
      });
    }

    // Auto journal: Hutang Usaha (D) vs Kas/Bank (K)
    try {
      const hutangCOA = await prisma.cOA.findFirst({ where: { code: "2100" } });
      const kasCOA = await prisma.cOA.findFirst({ where: { code: "1110" } }); // default: Kas Tunai
      if (hutangCOA && kasCOA) {
        const jeNo = `JE/${new Date().toISOString().slice(2, 10).replace(/-/g, "")}/${String(Date.now()).slice(-4)}`;
        await prisma.journalEntry.create({
          data: {
            jeNo,
            date: new Date(),
            description: `Pembayaran Purchase Invoice ${existing.docNo}`,
            refType: "purchase_invoice",
            refId: existing.id,
            storeId: existing.po?.storeId || "",
            status: "Posted",
            createdById: user.id,
            details: {
              create: [
                { coaId: hutangCOA.id, description: `Pelunasan Hutang ${existing.docNo}`, debit: existing.total, credit: 0 },
                { coaId: kasCOA.id, description: `Pembayaran ${existing.docNo}`, debit: 0, credit: existing.total },
              ],
            },
          },
        });
      }
    } catch (err) {
      console.error("Auto-journal (purchase invoice paid) failed:", err);
    }
  }

  const invoice = await prisma.purchaseInvoice.update({
    where: { id: params.id },
    data: updateData,
    include: { supplier: { select: { id: true, companyName: true } }, ap: true },
  });

  return NextResponse.json({ data: invoice });
});
