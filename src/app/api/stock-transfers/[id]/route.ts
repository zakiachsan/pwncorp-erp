import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const transfer = await prisma.stockTransfer.findUnique({
    where: { id: params.id },
    include: {
      items: { include: { sparepart: { select: { sku: true, name: true, stockQty: true } } } },
    },
  });
  if (!transfer) return NextResponse.json({ error: "Transfer not found" }, { status: 404 });
  return NextResponse.json({ data: transfer });
});

export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { action, notes } = body;

  const existing = await prisma.stockTransfer.findUnique({
    where: { id: params.id },
    include: { items: true },
  });
  if (!existing) return NextResponse.json({ error: "Transfer not found" }, { status: 404 });

  const validTransitions: Record<string, string[]> = {
    Draft: ["Confirmed", "Cancelled"],
    Confirmed: ["Approved", "Cancelled"],
    Approved: ["Received"],
    Received: [],
    Cancelled: [],
  };

  if (!action) return NextResponse.json({ error: "action is required" }, { status: 400 });
  const targetStatus = action === "confirm" ? "Confirmed" : action === "approve" ? "Approved" : action === "receive" ? "Received" : action === "cancel" ? "Cancelled" : null;
  if (!targetStatus) return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  if (!validTransitions[existing.status]?.includes(targetStatus)) {
    return NextResponse.json({ error: `Cannot transition from ${existing.status} to ${targetStatus}` }, { status: 400 });
  }

  // On Received: deduct stock from source
  if (targetStatus === "Received") {
    for (const item of existing.items) {
      const sp = await prisma.sparepart.findUnique({ where: { id: item.sparepartId } });
      if (sp && sp.stockQty >= item.qty) {
        const qtyBefore = sp.stockQty;
        await prisma.sparepart.update({
          where: { id: item.sparepartId },
          data: { stockQty: { decrement: item.qty } },
        });
        await prisma.stockHistory.create({
          data: {
            sparepartId: item.sparepartId,
            storeId: existing.storeId,
            changeType: "transfer_out",
            qtyChange: item.qty,
            qtyBefore,
            qtyAfter: qtyBefore - item.qty,
            refDoc: "TRF",
            refNo: existing.transferNo,
            date: new Date(),
          },
        });
      }
    }
  }

  // Auto journal on Received: Persediaan Gudang Tujuan (D) vs Persediaan Gudang Asal (K)
  if (targetStatus === "Received") {
    try {
      const persediaanCOA = await prisma.cOA.findFirst({ where: { code: "1300" } });
      if (persediaanCOA) {
        let totalValue = 0;
        const details: any[] = [];
        for (const item of existing.items) {
          const sp = await prisma.sparepart.findUnique({ where: { id: item.sparepartId } });
          const itemTotal = (sp?.buyPrice || 0) * item.qty;
          totalValue += itemTotal;
          if (itemTotal > 0) {
            details.push({
              coaId: persediaanCOA.id,
              description: `Persediaan Masuk ${sp?.name || sp?.sku} x${item.qty}`,
              debit: itemTotal,
              credit: 0,
            });
          }
        }
        if (totalValue > 0) {
          details.push({
            coaId: persediaanCOA.id,
            description: `Persediaan Keluar ${existing.transferNo}`,
            debit: 0,
            credit: totalValue,
          });
          // Generate JU number: JU-XXX/MM/YYYY
        const _now = new Date();
        const _mm = String(_now.getMonth() + 1).padStart(2, '0');
        const _yyyy = _now.getFullYear();
        const _dateSuffix = `/${_mm}/${_yyyy}`;
        const _lastJE = await prisma.journalEntry.findFirst({
          where: { jeNo: { startsWith: 'JU-' }, jeNo: { endsWith: _dateSuffix } },
          orderBy: { jeNo: 'desc' },
        });
        const _seq = _lastJE ? parseInt(_lastJE.jeNo.split('-')[1]?.split('/')[0] || '0') + 1 : 1;
        const jeNo = `JU-${String(_seq).padStart(3, '0')}${_dateSuffix}`;
          await prisma.journalEntry.create({
            data: {
              jeNo,
              date: new Date(),
              description: `Stock Transfer ${existing.transferNo} diterima`,
              refType: "stock_transfer",
              refId: existing.id,
              storeId: existing.storeId,
              status: "Posted",
              createdById: user.id,
              details: { create: details },
            },
          });
        }
      }
    } catch (err) {
      console.error("Auto-journal (stock transfer) failed:", err);
    }
  }

  const updateData: any = { status: targetStatus };
  if (notes !== undefined) updateData.notes = notes;

  const transfer = await prisma.stockTransfer.update({
    where: { id: params.id },
    data: updateData,
    include: { items: { include: { sparepart: { select: { sku: true, name: true } } } } },
  });

  return NextResponse.json({ data: transfer });
});
