import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";

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
  const { complaint, salesperson, status, customerId, vehicleId, odometer, color, bookingSource, referenceNumber, planServiceTime, saId, date, spareparts, services } = body;

  const existing = await prisma.serviceOrder.findUnique({
    where: { id: params.id },
    include: { spareparts: true, services: true },
  });
  if (!existing) return NextResponse.json({ error: "Service order not found" }, { status: 404 });

  // Validate status transition
  if (status) {
    const validTransitions: Record<string, string[]> = {
      "Draft": ["Delivered", "Approved", "Cancelled"],
      "Delivered": ["Approved", "Cancelled"],
      "Approved": ["Cancelled"],
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
    },
  });

  return NextResponse.json({ data: so });
});

export const DELETE = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const existing = await prisma.serviceOrder.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Service order not found" }, { status: 404 });

  if (existing.status !== "Draft") {
    return NextResponse.json({ error: "Only Draft service orders can be deleted" }, { status: 400 });
  }

  await prisma.serviceOrder.update({ where: { id: params.id }, data: { status: "Cancelled" } });
  return NextResponse.json({ data: { success: true } });
});
