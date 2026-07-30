import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const ret = await prisma.stockReturn.findUnique({
    where: { id: params.id },
    include: {
      wo: { select: { woNo: true } },
      items: { include: { sparepart: { select: { sku: true, name: true, stockQty: true } } } },
    },
  });
  if (!ret) return NextResponse.json({ error: "Stock return not found" }, { status: 404 });
  return NextResponse.json({ data: ret });
});

export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { action } = body;

  const existing = await prisma.stockReturn.findUnique({
    where: { id: params.id },
    include: { items: { include: { sparepart: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Stock return not found" }, { status: 404 });

  const validTransitions: Record<string, string[]> = {
    Draft: ["Confirmed", "Cancelled"],
    Confirmed: ["Cancelled"],
    Cancelled: [],
  };

  if (!action) return NextResponse.json({ error: "action is required" }, { status: 400 });

  const targetStatus = action === "confirm" ? "Confirmed" : action === "cancel" ? "Cancelled" : null;
  if (!targetStatus) return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  if (!validTransitions[existing.status]?.includes(targetStatus)) {
    return NextResponse.json({ error: `Cannot transition from ${existing.status} to ${targetStatus}` }, { status: 400 });
  }

  // On Confirm: deduct stock + auto journal
  if (targetStatus === "Confirmed") {
    for (const item of existing.items) {
      const sp = await prisma.sparepart.findUnique({ where: { id: item.sparepartId } });
      if (sp) {
        const qtyBefore = sp.stockQty;
        await prisma.sparepart.update({
          where: { id: item.sparepartId },
          data: { stockQty: { decrement: item.qty } },
        });
        await prisma.stockHistory.create({
          data: {
            sparepartId: item.sparepartId,
            storeId: existing.storeId,
            changeType: "out",
            qtyChange: item.qty,
            qtyBefore,
            qtyAfter: qtyBefore - item.qty,
            refDoc: "SRT",
            refNo: existing.returnNo,
            date: new Date(),
          },
        });
      }
    }

    // Auto journal: Hutang Usaha (D) vs Persediaan (K)
    try {
      const hutangCOA = await prisma.cOA.findFirst({ where: { code: "2100" } });
      const persediaanCOA = await prisma.cOA.findFirst({ where: { code: "1300" } });
      if (hutangCOA && persediaanCOA) {
        let totalValue = 0;
        const details: any[] = [];
        for (const item of existing.items) {
          const sp = item.sparepart;
          const itemTotal = (sp?.buyPrice || 0) * item.qty;
          totalValue += itemTotal;
          if (itemTotal > 0) {
            details.push({
              coaId: hutangCOA.id,
              description: `Hutang Retur ${sp?.name || sp?.sku} x${item.qty}`,
              debit: itemTotal,
              credit: 0,
            });
          }
        }
        if (totalValue > 0) {
          details.push({
            coaId: persediaanCOA.id,
            description: `Persediaan Retur ${existing.returnNo}`,
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
              description: `Stock Return ${existing.returnNo} dikonfirmasi`,
              refType: "stock_return",
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
      console.error("Auto-journal (stock return) failed:", err);
    }
  }

  const ret = await prisma.stockReturn.update({
    where: { id: params.id },
    data: { status: targetStatus },
    include: {
      wo: { select: { woNo: true } },
      items: { include: { sparepart: { select: { sku: true, name: true } } } },
    },
  });

  return NextResponse.json({ data: ret });
});
