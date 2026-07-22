import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";
import { generateSONumber } from "@/lib/numbering";

export const GET = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status");
  const customerId = searchParams.get("customerId");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const where: any = { storeId: user.storeId };
  if (search) where.soNo = { contains: search, mode: "insensitive" };
  if (status) where.status = status;
  if (customerId) where.customerId = customerId;
  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = new Date(dateFrom);
    if (dateTo) where.date.lte = new Date(dateTo);
  }

  const [data, total] = await Promise.all([
    prisma.serviceOrder.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true } },
        vehicle: { select: { id: true, plateNo: true, brand: true, model: true } },
        sa: { select: { id: true, name: true } },
        store: { select: { id: true, name: true, code: true } },
        _count: { select: { spareparts: true, services: true, workOrders: true } },
      },
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.serviceOrder.count({ where }),
  ]);

  return NextResponse.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const POST = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const body = await req.json();
  const { customerId, vehicleId, complaint, salesperson, bookingSource, referenceNumber, planServiceTime, odometer, color, spareparts, services } = body;

  if (!customerId || !vehicleId) {
    return NextResponse.json({ error: "customerId and vehicleId are required" }, { status: 400 });
  }

  // Validate customer & vehicle exist and belong to store
  const [customer, vehicle] = await Promise.all([
    prisma.customer.findFirst({ where: { id: customerId, storeId: user.storeId } }),
    prisma.vehicle.findFirst({ where: { id: vehicleId, storeId: user.storeId } }),
  ]);
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  if (!vehicle) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });

  const soNo = await generateSONumber(user.storeId);

  // Calculate total
  let total = 0;
  const spItems = (spareparts || []).map((sp: any) => {
    const lineTotal = sp.qty * sp.unitPrice;
    total += lineTotal;
    return { sparepartId: sp.sparepartId, qty: sp.qty, unitPrice: sp.unitPrice, total: lineTotal };
  });
  const svItems = (services || []).map((sv: any) => {
    const lineTotal = sv.qty * sv.unitPrice;
    total += lineTotal;
    return { serviceId: sv.serviceId, qty: sv.qty, unitPrice: sv.unitPrice, total: lineTotal };
  });

  const so = await prisma.serviceOrder.create({
    data: {
      soNo,
      customerId,
      vehicleId,
      saId: user.id,
      storeId: user.storeId,
      complaint,
      salesperson,
      bookingSource,
      referenceNumber,
      planServiceTime,
      odometer,
      color,
      total,
      spareparts: { create: spItems },
      services: { create: svItems },
    },
    include: {
      customer: { select: { id: true, name: true } },
      vehicle: { select: { id: true, plateNo: true, brand: true, model: true } },
      sa: { select: { id: true, name: true } },
      spareparts: { include: { sparepart: { select: { id: true, sku: true, name: true } } } },
      services: { include: { service: { select: { id: true, sku: true, name: true } } } },
    },
  });

  return NextResponse.json({ data: so }, { status: 201 });
});
