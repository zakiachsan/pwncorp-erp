import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";
import { logActivity } from "@/lib/activity-log";

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const so = await prisma.serviceOrder.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      vehicle: true,
      sa: { select: { id: true, name: true } },
      store: { select: { id: true, name: true, code: true } },
      spareparts: { include: { sparepart: true } },
      services: { include: { service: true } },
      inspectionItems: { orderBy: { sortOrder: "asc" } },
      workOrders: {
        include: {
          mekanik: { select: { id: true, name: true } },
          items: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!so) return NextResponse.json({ error: "Service order not found" }, { status: 404 });
  return NextResponse.json({ data: so });
});

export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { complaint, salesperson, status, customerId, vehicleId, odometer, color, bookingSource, referenceNumber, planServiceTime, saId, date, spareparts, services, inspectionItems } = body;

  const existing = await prisma.serviceOrder.findUnique({
    where: { id: params.id },
    include: { spareparts: true, services: true, inspectionItems: true },
  });
  if (!existing) return NextResponse.json({ error: "Service order not found" }, { status: 404 });

  // Validate status transition
  if (status) {
    const validTransitions: Record<string, string[]> = {
          "Draft": ["Diagnosis", "Delivery", "Completed", "Cancelled"],
          "Diagnosis": ["Delivery", "Completed", "Cancelled"],
          "Delivery": ["Completed", "Cancelled"],
          "Completed": ["Cancelled"],
      "Cancelled": [],
    };
    if (!validTransitions[existing.status]?.includes(status)) {
      return NextResponse.json({
        error: `Cannot transition from ${existing.status} to ${status}`,
      }, { status: 400 });
    }
  }

  let total = existing.total;
  let updateData: any = {};

  if (complaint !== undefined) updateData.complaint = complaint;
  if (salesperson !== undefined) updateData.salesperson = salesperson;
  if (customerId !== undefined) updateData.customerId = customerId;
  if (vehicleId !== undefined) updateData.vehicleId = vehicleId;
  if (odometer !== undefined) updateData.odometer = odometer;
  if (color !== undefined) updateData.color = color;
  if (bookingSource !== undefined) updateData.bookingSource = bookingSource;
  if (referenceNumber !== undefined) updateData.referenceNumber = referenceNumber;
  if (planServiceTime !== undefined) updateData.planServiceTime = planServiceTime;
  if (saId !== undefined) updateData.saId = saId;
  if (date !== undefined) updateData.date = new Date(date);
  if (status !== undefined) updateData.status = status;

  // If items are being replaced, recalculate total
  if (spareparts !== undefined || services !== undefined) {
    total = 0;
    // Delete existing items and recreate
    if (spareparts !== undefined) {
      await prisma.sOSparepart.deleteMany({ where: { soId: params.id } });
      for (const sp of spareparts) {
        const lineTotal = sp.qty * sp.unitPrice;
        total += lineTotal;
        await prisma.sOSparepart.create({
          data: { soId: params.id, sparepartId: sp.sparepartId, qty: sp.qty, unitPrice: sp.unitPrice, total: lineTotal },
        });
      }
    }
    if (services !== undefined) {
      await prisma.sOService.deleteMany({ where: { soId: params.id } });
      for (const sv of services) {
        const lineTotal = sv.qty * sv.unitPrice;
        total += lineTotal;
        await prisma.sOService.create({
          data: { soId: params.id, serviceId: sv.serviceId, qty: sv.qty, unitPrice: sv.unitPrice, total: lineTotal },
        });
      }
    }
  }

  // Handle inspection items
  if (inspectionItems !== undefined) {
    await prisma.inspectionItem.deleteMany({ where: { soId: params.id } });
    for (let i = 0; i < inspectionItems.length; i++) {
      const item = inspectionItems[i];
      await prisma.inspectionItem.create({
        data: {
          soId: params.id,
          description: item.description || "",
          feedback: item.feedback || null,
          inspected: item.inspected || false,
          sortOrder: i,
        },
      });
    }
  }

  updateData.total = total;

  const so = await prisma.serviceOrder.update({
    where: { id: params.id },
    data: updateData,
    include: {
      customer: { select: { id: true, name: true } },
      vehicle: { select: { id: true, plateNo: true } },
      sa: { select: { id: true, name: true } },
      spareparts: { include: { sparepart: { select: { sku: true, name: true } } } },
      services: { include: { service: { select: { sku: true, name: true } } } },
      inspectionItems: { orderBy: { sortOrder: "asc" } },
    },
  });

  // Log changes
  if (status !== undefined && status !== existing.status) {
    await logActivity({ userId: user.id, action: "SO_STATUS_CHANGED", entity: "ServiceOrder", entityId: params.id, details: { from: existing.status, to: status } });
  }
  const changedFields: Record<string, any> = {};
  for (const key of ["complaint", "salesperson", "customerId", "vehicleId", "odometer", "color", "bookingSource", "referenceNumber", "planServiceTime", "saId", "date"]) {
    if ((body as any)[key] === undefined) continue;
    const oldVal = key === "date" ? new Date((existing as any)[key]).toISOString().slice(0, 10) : String((existing as any)[key] ?? "");
    const newVal = key === "date" ? new Date((body as any)[key]).toISOString().slice(0, 10) : String((body as any)[key] ?? "");
    if (oldVal !== newVal) {
      changedFields[key] = { from: (existing as any)[key], to: (body as any)[key] };
    }
  }
  if (Object.keys(changedFields).length > 0) {
    await logActivity({ userId: user.id, action: "SO_UPDATED", entity: "ServiceOrder", entityId: params.id, details: changedFields });
  }
  if (inspectionItems !== undefined) {
    const oldNames = (existing.inspectionItems || []).map((i: any) => i.description);
    const newNames = (inspectionItems as any[]).map((i: any) => i.description || "");
    const added = newNames.filter(n => !oldNames.includes(n));
    const removed = oldNames.filter(n => !newNames.includes(n));
    await logActivity({ userId: user.id, action: "SO_INSPECTION_UPDATED", entity: "ServiceOrder", entityId: params.id, details: { added, removed, before: oldNames.length, after: newNames.length } });
  }
  if (spareparts !== undefined) {
    const oldIds = (existing.spareparts || []).map((s: any) => s.sparepartId);
    const newIds = (spareparts as any[]).map((s: any) => s.sparepartId);
    const addedIds = newIds.filter(id => !oldIds.includes(id));
    const removedIds = oldIds.filter(id => !newIds.includes(id));
    // Resolve names for added/removed
    const allIds = Array.from(new Set([...addedIds, ...removedIds]));
    const spData = allIds.length > 0 ? await prisma.sparepart.findMany({ where: { id: { in: allIds } }, select: { id: true, name: true } }) : [];
    const nameMap = Object.fromEntries(spData.map(s => [s.id, s.name]));
    const added = addedIds.map(id => nameMap[id] || id);
    const removed = removedIds.map(id => nameMap[id] || id);
    await logActivity({ userId: user.id, action: "SO_SPAREPARTS_UPDATED", entity: "ServiceOrder", entityId: params.id, details: { added, removed, before: oldIds.length, after: newIds.length } });
  }
  if (services !== undefined) {
    const oldIds = (existing.services || []).map((s: any) => s.serviceId);
    const newIds = (services as any[]).map((s: any) => s.serviceId);
    const addedIds = newIds.filter(id => !oldIds.includes(id));
    const removedIds = oldIds.filter(id => !newIds.includes(id));
    const allIds = Array.from(new Set([...addedIds, ...removedIds]));
    const svcData = allIds.length > 0 ? await prisma.service.findMany({ where: { id: { in: allIds } }, select: { id: true, name: true } }) : [];
    const nameMap = Object.fromEntries(svcData.map(s => [s.id, s.name]));
    const added = addedIds.map(id => nameMap[id] || id);
    const removed = removedIds.map(id => nameMap[id] || id);
    await logActivity({ userId: user.id, action: "SO_SERVICES_UPDATED", entity: "ServiceOrder", entityId: params.id, details: { added, removed, before: oldIds.length, after: newIds.length } });
  }

  return NextResponse.json({ data: so });
});

export const DELETE = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const user = (await getCurrentUser()) as any;
  const existing = await prisma.serviceOrder.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Service order not found" }, { status: 404 });

  if (existing.status !== "Draft") {
    return NextResponse.json({ error: "Only Draft service orders can be deleted" }, { status: 400 });
  }

  await prisma.serviceOrder.update({ where: { id: params.id }, data: { status: "Cancelled" } });
  await logActivity({ userId: user.id, action: "SO_CANCELLED", entity: "ServiceOrder", entityId: params.id, details: { soNo: existing.soNo } });
  return NextResponse.json({ data: { success: true } });
});
