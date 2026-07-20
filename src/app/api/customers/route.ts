import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/auth-helpers";

export const GET = withAuth(async (req: NextRequest) => {
  const user = (req as any).user || (await import("@/lib/auth-helpers").then(m => m.getCurrentUser()));
  const storeId = (user as any).storeId;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type");

  const where: any = { storeId, isActive: true };
  if (search) where.name = { contains: search, mode: "insensitive" };
  if (type) where.type = type;

  const [data, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      include: { _count: { select: { vehicles: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.customer.count({ where }),
  ]);

  // Attach display codes
  const enriched = await Promise.all(
    data.map(async (c) => {
      const cc = await prisma.$queryRawUnsafe<{ code: string }[]>(
        `SELECT code FROM customer_codes WHERE customer_id = $1`, c.id
      );
      return { ...c, code: cc[0]?.code || c.id.slice(-6) };
    })
  );

  return NextResponse.json({ data: enriched, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const POST = withAuth(async (req: NextRequest) => {
  const user = (await import("@/lib/auth-helpers").then(m => m.getCurrentUser())) as any;
  const body = await req.json();
  const { name, type, phone, whatsapp, email, address } = body;

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const customer = await prisma.customer.create({
    data: { storeId: user.storeId, name, type: type || "retail", phone, whatsapp, email, address },
  });

  // Generate display code
  const nextVal = await prisma.$queryRawUnsafe<{ nextval: number }[]>(`SELECT nextval('customer_code_seq') as nextval`);
  const code = `CTR-${String(nextVal[0].nextval).padStart(3, '0')}`;
  await prisma.$executeRawUnsafe(`INSERT INTO customer_codes (customer_id, code) VALUES ($1, $2)`, customer.id, code);

  return NextResponse.json({ data: { ...customer, code } }, { status: 201 });
});
