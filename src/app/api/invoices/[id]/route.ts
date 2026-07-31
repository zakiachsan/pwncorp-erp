import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

// Hardcoded COA mapping (will become configurable in Phase C)
const COA_SUBLET_COST = "5500"; // Sublet & Sundry Cost
const COA_ACCOUNTS_PAYABLE = "2100"; // Hutang Usaha

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      store: { select: { name: true } },
      wo: {
        include: {
          so: {
            select: {
              soNo: true, date: true, planServiceTime: true,
              odometer: true, color: true, salesperson: true, bookingSource: true,
              referenceNumber: true, status: true, createdAt: true,
              sa: { select: { id: true, name: true } },
              vehicle: { select: { plateNo: true, brand: true, model: true, year: true } },
            },
          },
        },
      },
      items: true,
      payments: { orderBy: { paymentDate: "desc" } },
      ar: true,
    },
  });
  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  return NextResponse.json({ data: invoice });
});

export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const body = await req.json();
  const { status, dueDate } = body;

  const existing = await prisma.invoice.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  // Validate workflow transition
  if (status !== undefined && status !== existing.status) {
    const allowed = VALID_TRANSITIONS[existing.status] || [];
    if (!allowed.includes(status)) {
      return NextResponse.json({
        error: `Cannot change status from ${existing.status} to ${status}. Allowed: ${allowed.join(", ") || "none"}`,
      }, { status: 400 });
    }
  }

  const updateData: any = {};
  if (status !== undefined) updateData.status = status;
  if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);

  const invoice = await prisma.invoice.update({
    where: { id: params.id },
    data: updateData,
    include: { customer: { select: { id: true, name: true } }, items: true, payments: true },
  });

  // ─── Side effect: When SRI Completed, auto-create Invoice Payables for Sublet/Sundry items ───
  let createdIPs: any[] = [];
  if (status === "COMPLETED" && existing.status === "DRAFT") {
    try {
      // Load full WO with SO services (including sublet/sundry items)
      const fullWO = await prisma.workOrder.findUnique({
        where: { id: invoice.woId },
        include: {
          so: {
            include: {
              services: {
                include: { service: true, supplier: true },
                where: { itemType: { in: ["Sublet", "Sundry"] } },
              },
            },
          },
        },
      });

      if (fullWO?.so?.services && fullWO.so.services.length > 0) {
        // Group by supplierId
        const bySupplier = new Map<string, { items: any[]; supplier: any }>();
        for (const item of fullWO.so.services) {
          if (!item.supplierId) continue;
          if (!bySupplier.has(item.supplierId)) {
            bySupplier.set(item.supplierId, { items: [], supplier: item.supplier });
          }
          bySupplier.get(item.supplierId)!.items.push(item);
        }

        // Get store code for numbering
        const store = await prisma.store.findUnique({ where: { id: invoice.storeId } });
        const storeCode = store?.code || "XX";
        const now = new Date();
        const yy = String(now.getFullYear()).slice(-2);
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const datePrefix = `${yy}${mm}`;

        // Get COA accounts
        const coaCost = await prisma.cOA.findFirst({ where: { code: COA_SUBLET_COST } });
        const coaAP = await prisma.cOA.findFirst({ where: { code: COA_ACCOUNTS_PAYABLE } });
        if (!coaCost || !coaAP) {
          console.warn("Sublet/Sundry COA not found, skipping journal entry");
        }

        // Create one IP per supplier
        let ipSeq = await prisma.purchaseInvoice.count({
          where: { docNo: { startsWith: `IP/${storeCode}/${datePrefix}` } },
        });

        const supplierGroups = Array.from(bySupplier.entries());
        for (let i = 0; i < supplierGroups.length; i++) {
          const supplierId = supplierGroups[i][0];
          const group = supplierGroups[i][1];
          ipSeq += 1;
          const docNo = `IP/${storeCode}/${datePrefix}${String(ipSeq).padStart(3, "0")}`;
          const total = group.items.reduce((s: number, it: any) => s + (it.cost * it.qty || 0), 0);

          const supplierPOs = await prisma.purchaseOrder.findMany({
            where: { supplierId, storeId: invoice.storeId },
            take: 1,
            orderBy: { createdAt: "desc" },
          });

          if (supplierPOs.length === 0) {
            console.warn(`No PO for supplier ${supplierId}, skipping IP for ${docNo}`);
            continue;
          }

          const ip = await prisma.purchaseInvoice.create({
            data: {
              docNo,
              poId: supplierPOs[0].id,
              supplierId,
              total,
              status: "APPROVED",
              date: new Date(),
            },
          });

          if (coaAP) {
            await prisma.accountPayable.create({
              data: {
                purchaseInvoiceId: ip.id,
                supplierId,
                amount: total,
                balance: total,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                status: "OPEN",
              },
            });
          }

          if (coaCost && coaAP) {
            const currentUser = await getCurrentUser();
            const userId = (currentUser as any)?.id || invoice.customerId;
            await prisma.journalEntry.create({
              data: {
                jeNo: `JE/SUBLET/${docNo}`,
                date: new Date(),
                description: `Sublet/Sundry cost auto-generated from ${invoice.invNo} (${docNo})`,
                refType: "SubletSundry",
                refId: ip.id,
                storeId: invoice.storeId,
                createdById: userId,
                details: {
                  create: [
                    { coaId: coaCost.id, debit: total, credit: 0, description: `Sublet/Sundry cost - ${group.supplier?.companyName || ""}` },
                    { coaId: coaAP.id, debit: 0, credit: total, description: `AP - ${group.supplier?.companyName || ""}` },
                  ],
                },
              },
            });
          }

          createdIPs.push({ docNo, supplier: group.supplier?.companyName, total });
        }
      }
    } catch (err) {
      console.error("Failed to auto-create Sublet/Sundry IP:", err);
    }
  }

  return NextResponse.json({ data: invoice, createdIPs });
});

export const DELETE = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const existing = await prisma.invoice.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  if (existing.status !== "DRAFT") {
    return NextResponse.json({ error: "Only DRAFT invoices can be deleted" }, { status: 400 });
  }

  await prisma.invoice.delete({ where: { id: params.id } });
  return NextResponse.json({ data: { success: true } });
});
