import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const opname = await prisma.stockOpname.findUnique({
    where: { id: params.id },
    include: {
      items: { include: { sparepart: { select: { sku: true, name: true, stockQty: true } } } },
    },
  });
  if (!opname) return NextResponse.json({ error: "Stock opname not found" }, { status: 404 });
  return NextResponse.json({ data: opname });
});

export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { action, items: bodyItems } = body;

  const existing = await prisma.stockOpname.findUnique({
    where: { id: params.id },
    include: { items: { include: { sparepart: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Stock opname not found" }, { status: 404 });

  const validTransitions: Record<string, string[]> = {
    Draft: ["Completed", "Cancelled"],
    Completed: ["Approved", "Cancelled"],
    Approved: [],
    Cancelled: [],
  };

  // ── WORKFLOW ACTIONS ──
  if (action) {
    const targetStatus = action === "complete" ? "Completed" : action === "approve" ? "Approved" : action === "cancel" ? "Cancelled" : null;
    if (!targetStatus) return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    if (!validTransitions[existing.status]?.includes(targetStatus)) {
      return NextResponse.json({ error: `Cannot transition from ${existing.status} to ${targetStatus}` }, { status: 400 });
    }

    // On Complete: update items with counted/approved/reason from form
    if (targetStatus === "Completed" && bodyItems && Array.isArray(bodyItems)) {
      for (const item of bodyItems) {
        if (item.id) {
          const physicalQty = parseInt(item.physicalQty) || 0;
          const approvedQty = parseInt(item.approvedQty) || physicalQty;
          const adjustment = approvedQty - (item.systemQty || 0);
          await prisma.opnameItem.update({
            where: { id: item.id },
            data: {
              physicalQty,
              adjustment,
              reason: item.reason || null,
            },
          });
        }
      }
    }

    // On Approved: apply stock adjustments based on adjustment
    if (targetStatus === "Approved") {
      // Re-fetch items after potential complete update
      const freshItems = await prisma.opnameItem.findMany({
        where: { opnameId: params.id },
        include: { sparepart: true },
      });
      for (const item of freshItems) {
        const adj = item.adjustment;
        if (adj !== 0) {
          const sp = await prisma.sparepart.findUnique({ where: { id: item.sparepartId } });
          if (!sp) continue;
          const qtyBefore = sp.stockQty;
          const qtyAfter = sp.stockQty + adj;
          await prisma.sparepart.update({ where: { id: item.sparepartId }, data: { stockQty: qtyAfter } });
          await prisma.stockHistory.create({
            data: {
              sparepartId: item.sparepartId,
              storeId: existing.storeId,
              changeType: "adjust",
              qtyChange: adj,
              qtyBefore,
              qtyAfter,
              refDoc: "OPNAME",
              refNo: existing.refCode,
              date: new Date(),
            },
          });
        }
      }
    }

    // Auto journal on Approved: Persediaan (D/K) based on adjustment
    if (targetStatus === "Approved") {
      try {
        const persediaanCOA = await prisma.cOA.findFirst({ where: { code: "1300" } });
        const hppCOA = await prisma.cOA.findFirst({ where: { code: "5100" } });
        const pendapatanCOA = await prisma.cOA.findFirst({ where: { code: "4200" } });
        if (persediaanCOA) {
          const freshItems = await prisma.opnameItem.findMany({
            where: { opnameId: params.id },
            include: { sparepart: true },
          });
          let surplusTotal = 0;
          let deficitTotal = 0;
          const details: any[] = [];
          for (const item of freshItems) {
            if (item.adjustment === 0) continue;
            const sp = item.sparepart;
            const adjValue = Math.abs(item.adjustment) * (sp?.buyPrice || 0);
            if (item.adjustment > 0) {
              surplusTotal += adjValue;
              details.push({
                coaId: persediaanCOA.id,
                description: `Surplus ${sp?.name || sp?.sku} x${item.adjustment}`,
                debit: adjValue,
                credit: 0,
              });
            } else {
              deficitTotal += adjValue;
              details.push({
                coaId: hppCOA?.id || persediaanCOA.id,
                description: `Defisit ${sp?.name || sp?.sku} x${Math.abs(item.adjustment)}`,
                debit: adjValue,
                credit: 0,
              });
            }
          }
          if (surplusTotal > 0 && pendapatanCOA) {
            details.push({
              coaId: pendapatanCOA.id,
              description: `Surplus Opname ${existing.refCode}`,
              debit: 0,
              credit: surplusTotal,
            });
          }
          if (deficitTotal > 0 && persediaanCOA) {
            details.push({
              coaId: persediaanCOA.id,
              description: `Defisit Opname ${existing.refCode}`,
              debit: 0,
              credit: deficitTotal,
            });
          }
          if (details.length > 0) {
            const jeNo = `JE/${new Date().toISOString().slice(2, 10).replace(/-/g, "")}/${String(Date.now()).slice(-4)}`;
            await prisma.journalEntry.create({
              data: {
                jeNo,
                date: new Date(),
                description: `Stock Opname ${existing.refCode} disetujui`,
                refType: "stock_opname",
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
        console.error("Auto-journal (stock opname) failed:", err);
      }
    }

    const updated = await prisma.stockOpname.update({
      where: { id: params.id },
      data: { status: targetStatus },
      include: { items: { include: { sparepart: { select: { sku: true, name: true, stockQty: true } } } } },
    });
    return NextResponse.json({ data: updated });
  }

  // ── EDIT ITEMS (Draft only) ──
  if (existing.status !== "Draft") {
    return NextResponse.json({ error: "Only Draft opnames can be edited" }, { status: 400 });
  }

  if (bodyItems !== undefined) {
    await prisma.opnameItem.deleteMany({ where: { opnameId: params.id } });
    for (const item of bodyItems) {
      await prisma.opnameItem.create({
        data: {
          opnameId: params.id,
          sparepartId: item.sparepartId,
          systemQty: item.systemQty || 0,
          physicalQty: item.physicalQty || 0,
          adjustment: (item.physicalQty || 0) - (item.systemQty || 0),
          reason: item.reason || null,
        },
      });
    }
  }

  const updated = await prisma.stockOpname.update({
    where: { id: params.id },
    data: {},
    include: { items: { include: { sparepart: { select: { sku: true, name: true, stockQty: true } } } } },
  });
  return NextResponse.json({ data: updated });
});
