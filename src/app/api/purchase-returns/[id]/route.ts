import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const ret = await prisma.purchaseReturn.findFirst({
    where: { OR: [{ id: params.id }, { docNo: params.id }] },
    include: {
      po: {
        select: {
          id: true, poNo: true, warehouse: true,
          items: { include: { sparepart: { select: { id: true, sku: true, name: true, code: true } } } },
        },
      },
      supplier: { select: { id: true, companyName: true, address: true, phone: true } },
      items: { include: { sparepart: { select: { id: true, sku: true, name: true, stockQty: true } } } },
    },
  });
  if (!ret) return NextResponse.json({ error: "Purchase return not found" }, { status: 404 });
  return NextResponse.json({ data: ret });
});

export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { action, items, reason, returnType, warehouse } = body;

  const ret = await prisma.purchaseReturn.findUnique({
    where: { id: params.id },
    include: { items: true },
  });
  if (!ret) return NextResponse.json({ error: "Purchase return not found" }, { status: 404 });

  const validTransitions: Record<string, string[]> = {
    Draft: ["Sent", "Cancelled"],
    Sent: ["Approved", "Cancelled"],
    Approved: ["Completed"],
    Completed: [],
    Cancelled: [],
  };

  // ── WORKFLOW ACTIONS ──
  if (action) {
    const targetStatus = action === "send" ? "Sent" : action === "approve" ? "Approved" : action === "complete" ? "Completed" : action === "cancel" ? "Cancelled" : null;
    if (!targetStatus) return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    if (!validTransitions[ret.status]?.includes(targetStatus)) {
      return NextResponse.json({ error: `Cannot transition from ${ret.status} to ${targetStatus}` }, { status: 400 });
    }

    // On Complete: reduce stock
    if (targetStatus === "Completed") {
      for (const item of ret.items) {
        const sparepart = await prisma.sparepart.findUnique({ where: { id: item.sparepartId } });
        if (sparepart) {
          const qtyBefore = sparepart.stockQty;
          await prisma.sparepart.update({
            where: { id: item.sparepartId },
            data: { stockQty: { decrement: item.qty } },
          });
          await prisma.stockHistory.create({
            data: {
              sparepartId: item.sparepartId,
              storeId: (ret as any).storeId || (await prisma.purchaseOrder.findUnique({ where: { id: ret.poId } }))?.storeId || "",
              changeType: "out",
              qtyChange: item.qty,
              qtyBefore,
              qtyAfter: qtyBefore - item.qty,
              refDoc: "PR",
              refNo: ret.docNo,
              date: new Date(),
            },
          });
        }
      }
    }

    // Auto journal on Completed: Hutang Usaha (D) vs Persediaan (K)
    if (targetStatus === "Completed") {
      try {
        const hutangCOA = await prisma.cOA.findFirst({ where: { code: "2100" } });
        const persediaanCOA = await prisma.cOA.findFirst({ where: { code: "1300" } });
        if (hutangCOA && persediaanCOA) {
          let totalValue = 0;
          const details: any[] = [];
          for (const item of ret.items) {
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
              description: `Persediaan Retur ${ret.docNo}`,
              debit: 0,
              credit: totalValue,
            });
            const storeId = (ret as any).storeId || (await prisma.purchaseOrder.findUnique({ where: { id: ret.poId } }))?.storeId || "";
            const jeNo = `JE/${new Date().toISOString().slice(2, 10).replace(/-/g, "")}/${String(Date.now()).slice(-4)}`;
            await prisma.journalEntry.create({
              data: {
                jeNo,
                date: new Date(),
                description: `Purchase Return ${ret.docNo} selesai`,
                refType: "purchase_return",
                refId: ret.id,
                storeId,
                status: "Posted",
                createdById: user.id,
                details: { create: details },
              },
            });
          }
        }
      } catch (err) {
        console.error("Auto-journal (purchase return) failed:", err);
      }
    }

    const updated = await prisma.purchaseReturn.update({
      where: { id: params.id },
      data: { status: targetStatus },
      include: {
        po: { select: { poNo: true } },
        supplier: { select: { companyName: true } },
        items: { include: { sparepart: { select: { sku: true, name: true } } } },
      },
    });
    return NextResponse.json({ data: updated });
  }

  // ── EDIT (Draft only) ──
  if (ret.status !== "Draft") {
    return NextResponse.json({ error: "Only Draft returns can be edited" }, { status: 400 });
  }

  const updateData: any = {};
  if (reason !== undefined) updateData.reason = reason;
  if (returnType !== undefined) updateData.returnType = returnType;
  if (warehouse !== undefined) updateData.warehouse = warehouse;

  if (items !== undefined) {
    await prisma.returnItem.deleteMany({ where: { returnId: params.id } });
    let total = 0;
    for (const item of items) {
      const lineTotal = (item.qty || 0) * (item.unitPrice || 0);
      total += lineTotal;
      await prisma.returnItem.create({
        data: {
          returnId: params.id,
          sparepartId: item.sparepartId,
          qty: item.qty || 0,
          unitPrice: item.unitPrice || 0,
          total: lineTotal,
        },
      });
    }
    updateData.total = total;
  }

  const updated = await prisma.purchaseReturn.update({
    where: { id: params.id },
    data: updateData,
    include: {
      po: { select: { poNo: true } },
      supplier: { select: { companyName: true } },
      items: { include: { sparepart: { select: { sku: true, name: true } } } },
    },
  });
  return NextResponse.json({ data: updated });
});
