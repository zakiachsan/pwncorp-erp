import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;
const dbUrl = process.env.DATABASE_URL!;
const u = new URL(dbUrl);
const pool = new Pool({ host: u.hostname, port: parseInt(u.port || "5432"), database: u.pathname.slice(1), user: u.username, password: decodeURIComponent(u.password) });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const whs = await prisma.warehouse.findMany({ orderBy: { code: "asc" } });
  console.log("Warehouses:", whs.map(w => `${w.code} ${w.name}`));

  const sparts = await prisma.sparepart.findMany({ take: 5, orderBy: { sku: "asc" } });
  for (const sp of sparts) {
    console.log(`\n${sp.sku}: ${sp.name} (total: ${sp.stockQty})`);
    for (const wh of whs) {
      const ws = await prisma.warehouseStock.findFirst({ where: { warehouseId: wh.id, sparepartId: sp.id } });
      console.log(`  ${wh.code}: ${ws?.qty ?? "NOT FOUND"}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
