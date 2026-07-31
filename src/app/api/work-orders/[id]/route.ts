import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const wo = await prisma.workOrder.findUnique({
    where: { id: params.id },
    include: {
      so: {
        include: {
          customer: true,
          vehicle: true,
          store: { select: { name: true } },
          sa: { select: { id: true, name: true } },
          spareparts: { include: { sparepart: true } },
          services: { include: { service: true } },
        },
      },
      mekanik: { select: { id: true, name: true } },
      items: { include: { supplier: { select: { id: true, companyName: true } } } },
      invoices: { include: { payments: true } },
      stockOrders: { include: { items: { include: { sparepart: { select: { sku: true, name: true, stockQty: true } } } } } },
      photos: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!wo) return NextResponse.json({ error: "Work order not found" }, { status: 404 });

  // Auto-sync: when status is REVISED, add new SO items to WO
  if (wo.status === "Revised" && wo.so) {
    const existingItemIds = new Set(wo.items.map(i => i.itemId));
    const newItems: any[] = [];

    // Check for new services
    for (const sv of wo.so.services) {
      if (!existingItemIds.has(sv.serviceId)) {
        const service = await prisma.service.findUnique({ where: { id: sv.serviceId } });
        newItems.push({
          woId: wo.id,
          itemType: (sv.itemType || "Service").toLowerCase(), // service | sublet | sundry
          itemId: sv.serviceId,
          itemName: service?.name || "Service",
          qty: sv.qty,
          unitPrice: sv.unitPrice,
          total: sv.total,
          supplierId: sv.supplierId || null,
          cost: sv.cost || 0,
        });
      }
    }

    // Check for new spareparts
    for (const sp of wo.so.spareparts) {
      if (!existingItemIds.has(sp.sparepartId)) {
        const sparepart = await prisma.sparepart.findUnique({ where: { id: sp.sparepartId } });
        newItems.push({
          woId: wo.id,
          itemType: "sparepart",
          itemId: sp.sparepartId,
          itemName: sparepart?.name || "Sparepart",
          qty: sp.qty,
          unitPrice: sp.unitPrice,
          total: sp.total,
        });
      }
    }

    // Insert new items to DB
    if (newItems.length > 0) {
      await prisma.wOItem.createMany({ data: newItems });
      // Refresh wo.items with supplier
      wo.items = await prisma.wOItem.findMany({ where: { woId: wo.id }, include: { supplier: { select: { id: true, companyName: true } } } });
    }
  }

  // Enrich items with sparepart/service details and resolve assignedTo names
  const assignedToIds = Array.from(new Set(((wo.items as any[]) || []).map((i: any) => i.assignedTo).filter((v: any) => typeof v === "string")));
  const userMap: Record<string, string> = {};
  if (assignedToIds.length > 0) {
    const users = await prisma.user.findMany({
      where: { id: { in: assignedToIds } },
      select: { id: true, name: true },
    });
    users.forEach(u => { userMap[u.id] = u.name; });
  }

  // Two-pass approach: first identify service indices, then link spareparts correctly
  // This handles edge cases where spareparts appear before any service (standalone SO spareparts)
  const serviceIndices: number[] = [];
  const serviceSparepartMap: Record<number, any[]> = {};
  const orphanSpareparts: { arrayIdx: number; sp: any; item: any }[] = [];
  
  // PASS 1: Identify services and collect sparepart data
  const enrichedItems = await Promise.all(
    (wo.items || []).map(async (item, arrayIdx) => {
      const assignedToName = item.assignedTo ? (userMap[item.assignedTo] || item.assignedTo) : null;
      if (item.itemType === "sparepart") {
        const sp = await prisma.sparepart.findUnique({
          where: { id: item.itemId },
          select: { sku: true, name: true, code: true, sellPrice: true, stockQty: true },
        });
        orphanSpareparts.push({ arrayIdx, sp, item });
        return { ...item, sku: sp?.sku || null, code: sp?.code || null, sparepartName: sp?.name || null, stockQty: sp?.stockQty || 0, assignedToName };
      }
      if (item.itemType === "service") {
        const svc = await prisma.service.findUnique({
          where: { id: item.itemId },
          select: { sku: true, name: true },
        });
        serviceIndices.push(arrayIdx);
        return { ...item, sku: svc?.sku || null, code: null, sparepartName: svc?.name || null, assignedToName };
      }
      return { ...item, assignedToName };
    })
  );

  // PASS 2: Link spareparts to services
  // Strategy: spareparts between service[N] and service[N+1] belong to service[N]
  // Spareparts before service[0] also belong to service[0]
  for (const { arrayIdx, sp, item } of orphanSpareparts) {
    // Find which service this sparepart belongs to
    let targetServiceIdx = -1;
    for (let i = serviceIndices.length - 1; i >= 0; i--) {
      if (arrayIdx >= serviceIndices[i]) {
        targetServiceIdx = serviceIndices[i];
        break;
      }
    }
    // If sparepart is before all services, link to first service
    if (targetServiceIdx === -1 && serviceIndices.length > 0) {
      targetServiceIdx = serviceIndices[0];
    }
    if (targetServiceIdx >= 0) {
      if (!serviceSparepartMap[targetServiceIdx]) serviceSparepartMap[targetServiceIdx] = [];
      serviceSparepartMap[targetServiceIdx].push({ sku: sp?.sku, name: sp?.name || item.itemName, qty: item.qty });
    }
  }

  // Attach linked spareparts to each service item (lookup by array index)
  const finalItems = enrichedItems.map((item, idx) => {
    if (item.itemType === "service") {
      return { ...item, linkedSpareparts: serviceSparepartMap[idx] || [] };
    }
    return item;
  });

  return NextResponse.json({ data: { ...wo, items: finalItems } });
});

export const PUT = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { status: rawStatus, mekanikId, startDate, targetDate, items } = body;
  let status = rawStatus;

  const existing = await prisma.workOrder.findUnique({
    where: { id: params.id },
    include: { items: true },
  });
  if (!existing) return NextResponse.json({ error: "Work order not found" }, { status: 404 });

  // Validate status transition
  if (status) {
    const normStatus = status.toUpperCase();
    const normExisting = existing.status.toUpperCase();
    const validTransitions: Record<string, string[]> = {
      "DRAFT": ["WAITING", "IN PROGRESS", "CANCELLED"],
      "WAITING": ["IN PROGRESS", "CANCELLED"],
      "IN PROGRESS": ["WAITING FOR QC", "CANCELLED"],
      "WAITING FOR QC": ["COMPLETED", "IN PROGRESS", "CANCELLED"],
      "REVISED": ["WAITING FOR QC", "COMPLETED", "CANCELLED"],
      "COMPLETED": ["REVISED"],
      "CANCELLED": [],
    };
    if (!validTransitions[normExisting]?.includes(normStatus)) {
      return NextResponse.json({
        error: `Cannot transition from ${existing.status} to ${status}`,
      }, { status: 400 });
    }
    // Normalize status to title case for DB
    const titleCase: Record<string, string> = {
      "DRAFT": "Draft", "WAITING": "Waiting", "IN PROGRESS": "In Progress",
      "WAITING FOR QC": "Waiting for QC", "REVISED": "Revised", "COMPLETED": "Completed", "CANCELLED": "Cancelled",
    };
    status = titleCase[normStatus] || status;

    // Validate stock orders status before starting
    if (normStatus === "IN PROGRESS") {
      const sparepartItems = existing.items.filter(i => i.itemType === "sparepart");
      if (sparepartItems.length > 0) {
        const stockOrders = await prisma.stockOrder.findMany({
          where: { woId: existing.id },
          select: { status: true, orderNo: true },
        });
        if (stockOrders.length === 0) {
          return NextResponse.json({
            error: "Stock orders harus dibuat dulu sebelum bisa Start!",
          }, { status: 400 });
        }
        const notReceived = stockOrders.filter(so => so.status?.toUpperCase() !== "RECEIVED");
        if (notReceived.length > 0) {
          return NextResponse.json({
            error: `Stock orders harus status Received dulu! Masih Draft: ${notReceived.map(so => so.orderNo).join(", ")}`,
          }, { status: 400 });
        }
      }
      // Auto-deduct stock when moving to In Progress (mekanik starts working)
      for (const item of sparepartItems) {
        await prisma.sparepart.update({
          where: { id: item.itemId },
          data: { stockQty: { decrement: item.qty } },
        });
        // Log stock history
        await prisma.stockHistory.create({
          data: {
            sparepartId: item.itemId,
            storeId: user.storeId,
            changeType: "out",
            qtyChange: item.qty,
            qtyBefore: (await prisma.sparepart.findUnique({ where: { id: item.itemId } }))!.stockQty + item.qty,
            qtyAfter: (await prisma.sparepart.findUnique({ where: { id: item.itemId } }))!.stockQty,
            refDoc: "WO",
            refNo: existing.woNo,
            date: new Date(),
          },
        });
      }
    }
    // Validate stock orders status before marking Completed from REVISED
    if (normStatus === "COMPLETED" && normExisting === "REVISED") {
      // Check 1: all sparepart items must have stock orders
      const sparepartItems = existing.items.filter(i => i.itemType === "sparepart");
      const stockOrders = await prisma.stockOrder.findMany({
        where: { woId: existing.id },
        select: { status: true, orderNo: true, items: { select: { sparepartId: true } } },
      });
      const stockOrderSparepartIds = new Set(stockOrders.flatMap(so => so.items.map(i => i.sparepartId)));
      const unstockedSpareparts = sparepartItems.filter(sp => !stockOrderSparepartIds.has(sp.itemId));
      
      // Check 2: all stock orders must be Received
      const notReceived = stockOrders.filter(so => so.status?.toUpperCase() !== "RECEIVED");
      
      if (unstockedSpareparts.length > 0 || notReceived.length > 0) {
        let msg = "Tidak bisa Completed: ";
        if (unstockedSpareparts.length > 0) {
          msg += `${unstockedSpareparts.length} sparepart belum dibuatkan stock order. `;
        }
        if (notReceived.length > 0) {
          msg += `Stock orders belum Received: ${notReceived.map(so => so.orderNo).join(", ")}.`;
        }
        return NextResponse.json({ error: msg }, { status: 400 });
      }
    }
  }

  const updateData: any = {};
  if (status !== undefined) updateData.status = status;
  if (mekanikId !== undefined) updateData.mekanikId = mekanikId;
  if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
  if (targetDate !== undefined) updateData.targetDate = targetDate ? new Date(targetDate) : null;

  // Handle items replacement
  if (items !== undefined) {
    await prisma.wOItem.deleteMany({ where: { woId: params.id } });
    for (const item of items) {
      await prisma.wOItem.create({
        data: {
          woId: params.id,
          itemType: item.itemType,
          itemId: item.itemId || "",
          itemName: item.itemName || "",
          qty: item.qty || 1,
          unitPrice: item.unitPrice || 0,
          total: (item.qty || 1) * (item.unitPrice || 0),
          assignedTo: item.assignedTo || null,
          estimatedTime: item.estimatedTime || null,
        },
      });
    }
  }

  const wo = await prisma.workOrder.update({
    where: { id: params.id },
    data: updateData,
    include: {
      so: { select: { soNo: true, customer: { select: { name: true } }, vehicle: { select: { plateNo: true } } } },
      mekanik: { select: { id: true, name: true } },
      items: true,
    },
  });

  return NextResponse.json({ data: wo });
});
