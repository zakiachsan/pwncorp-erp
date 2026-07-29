import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";
import { generateWONumber } from "@/lib/numbering";
import { logActivity } from "@/lib/activity-log";

export const GET = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status");
  const mekanikId = searchParams.get("mekanikId");
  const soId = searchParams.get("soId");

  const where: any = { storeId: user.storeId };
  if (search) where.woNo = { contains: search, mode: "insensitive" };
  if (status) where.status = status;
  if (mekanikId) where.mekanikId = mekanikId;
  if (soId) where.soId = soId;

  const [data, total] = await Promise.all([
    prisma.workOrder.findMany({
      where,
      include: {
        so: { select: { soNo: true, customer: { select: { name: true } }, vehicle: { select: { plateNo: true } } } },
        mekanik: { select: { id: true, name: true } },
        _count: { select: { items: true, invoices: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.workOrder.count({ where }),
  ]);

  return NextResponse.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const POST = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { soId, mekanikId, targetDate, targetTime, customerWaiting, serviceMekaniks, serviceSpareparts } = body;

  if (!soId) return NextResponse.json({ error: "soId is required" }, { status: 400 });

  // Validate SO exists and is Approved
  const so = await prisma.serviceOrder.findFirst({
    where: { id: soId, storeId: user.storeId },
    include: { spareparts: true, services: true },
  });
  if (!so) return NextResponse.json({ error: "Service order not found" }, { status: 404 });
  if (so.status !== "Approved") {
    return NextResponse.json({ error: "Service order must be Approved before creating work order" }, { status: 400 });
  }

  // Check if active (non-cancelled) WO already exists for this SO
  const existingWO = await prisma.workOrder.findFirst({ 
    where: { soId, status: { not: "Cancelled" } } 
  });
  if (existingWO) {
    return NextResponse.json({ error: "Work order already exists for this service order" }, { status: 409 });
  }

  const woNo = await generateWONumber(user.storeId);

  // Copy items from SO to WO
  const items: any[] = [];

  // First pass: collect service-linked sparepart IDs to avoid duplicates
  const allLinkedSparepartIds = new Set<string>();
  let scanIdx = 0;
  for (const sv of so.services) {
    (serviceSpareparts?.[scanIdx] || []).forEach((id: string) => allLinkedSparepartIds.add(id));
    scanIdx++;
  }

  // Add SO spareparts only if NOT already linked to a service
  for (const sp of so.spareparts) {
    if (!allLinkedSparepartIds.has(sp.sparepartId)) {
      const sparepart = await prisma.sparepart.findUnique({ where: { id: sp.sparepartId } });
      items.push({
        itemType: "sparepart",
        itemId: sp.sparepartId,
        itemName: sparepart?.name || "Sparepart",
        qty: sp.qty,
        unitPrice: sp.unitPrice,
        total: sp.total,
      });
    }
  }

  let serviceIdx = 0;
  for (const sv of so.services) {
    const service = await prisma.service.findUnique({ where: { id: sv.serviceId } });
    const assignedTo = serviceMekaniks?.[serviceIdx] || null;
    items.push({
      itemType: "service",
      itemId: sv.serviceId,
      itemName: service?.name || "Service",
      qty: sv.qty,
      unitPrice: sv.unitPrice,
      total: sv.total,
      assignedTo,
    });
    // Add spareparts linked to this service
    const linkedSparepartIds = serviceSpareparts?.[serviceIdx] || [];
    for (const spId of linkedSparepartIds) {
      const sparepart = await prisma.sparepart.findUnique({ where: { id: spId } });
      if (sparepart) {
        items.push({
          itemType: "sparepart",
          itemId: spId,
          itemName: sparepart.name,
          qty: 1,
          unitPrice: sparepart.sellPrice || 0,
          total: sparepart.sellPrice || 0,
          assignedTo,
        });
      }
    }
    serviceIdx++;
  }

  const wo = await prisma.workOrder.create({
    data: {
      woNo,
      soId,
      mekanikId: mekanikId || null,
      storeId: user.storeId,
      targetDate: targetDate ? new Date(targetDate) : null,
      targetTime: targetTime || null,
      customerWaiting: customerWaiting === true,
      items: { create: items },
    },
    include: {
      so: { select: { soNo: true, customer: { select: { name: true } }, vehicle: { select: { plateNo: true } } } },
      mekanik: { select: { id: true, name: true } },
      items: true,
    },
  });

  await logActivity({ userId: user.id, action: "WO_CREATED", entity: "WorkOrder", entityId: wo.id, details: { woNo: wo.woNo, soId, soNo: so.soNo, mekanikName: mekanikId || null, itemCount: items.length } });

  return NextResponse.json({ data: wo }, { status: 201 });
});
