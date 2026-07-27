import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const soId = params.id;

  // Get WO and Invoice IDs linked to this SO
  const workOrders = await prisma.workOrder.findMany({
    where: { soId },
    select: { id: true },
  });
  const woIds = workOrders.map(wo => wo.id);

  const invoices = woIds.length > 0
    ? await prisma.invoice.findMany({
        where: { woId: { in: woIds } },
        select: { id: true, invNo: true },
      })
    : [];
  const invNos = invoices.map(i => i.invNo);

  // Fetch all related activity logs
  const logs = await prisma.activityLog.findMany({
    where: {
      OR: [
        // Direct SO changes
        { entity: "ServiceOrder", entityId: soId },
        // WO changes (by entity + entityId from DB)
        ...woIds.map(woId => ({ entity: "WorkOrder", entityId: woId })),
        // WO changes (by soId in details JSON — catches logs before WO exists in DB)
        { entity: "WorkOrder", details: { contains: soId } },
        // Invoice/Payment changes — match by soId or woId in details JSON
        { entity: "Invoice", details: { contains: soId } },
        { entity: "Payment", details: { contains: soId } },
        ...invNos.map(invNo => ({ entity: "Invoice", details: { contains: invNo } })),
        ...invNos.map(invNo => ({ entity: "Payment", details: { contains: invNo } })),
      ],
    },
    include: {
      user: { select: { id: true, name: true } },
    },
    orderBy: { timestamp: "desc" },
  });

  return NextResponse.json({ data: logs });
});
