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
  const { soId, mekanikId, targetDate, targetTime, customerWaiting, serviceMekaniks, serviceSpareparts, serviceIds, sparepartIds } = body;

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

  const woNo = await generateWONumber(user.storeId);

  // Copy items from SO to WO — only items selected in the form (serviceIds / sparepartIds).
  // `serviceIds`/`sparepartIds` from frontend:
  //   - undefined: backward-compat (copy all)
  //   - [] (empty array): strict — copy none
  //   - [...] (non-empty): strict — copy only those in the list
  const items: any[] = [];
  const selectedServiceIds = new Set<string>(serviceIds || []);
  const selectedSparepartIds = new Set<string>(sparepartIds || []);
  const servicesLocked = Array.isArray(serviceIds);
  const sparepartsLocked = Array.isArray(sparepartIds);

  let serviceIdx = 0;
  for (const sv of so.services) {
    // Skip services that were removed from the form (not in selectedServiceIds)
    if (servicesLocked && !selectedServiceIds.has(sv.serviceId)) {
      serviceIdx++;
      continue;
    }
    const service = await prisma.service.findUnique({ where: { id: sv.serviceId } });
    const isSublet = sv.itemType === "Sublet" || sv.itemType === "Sundry";
    const assignedTo = isSublet ? null : (serviceMekaniks?.[serviceIdx] || null);
    items.push({
      itemType: (sv.itemType || "Service").toLowerCase(), // service | sublet | sundry
      itemId: sv.serviceId,
      itemName: service?.name || "Service",
      qty: sv.qty,
      unitPrice: sv.unitPrice,
      total: sv.total,
      assignedTo,
      supplierId: sv.supplierId || null,
      cost: sv.cost || 0,
    });
    // Add spareparts linked to this service (only for non-sublet/sundry)
    if (!isSublet) {
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
    }
    serviceIdx++;
  }

  // Add SO spareparts that are NOT linked to any service AND selected in the form
  for (const sp of so.spareparts) {
    if (sparepartsLocked && !selectedSparepartIds.has(sp.sparepartId)) continue;
    // Skip if already added as service-linked sparepart
    if (items.some(it => it.itemType === "sparepart" && it.itemId === sp.sparepartId)) continue;
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
