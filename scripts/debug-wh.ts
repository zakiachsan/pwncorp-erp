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
  for (const wh of whs) {
    const count = await prisma.warehouseStock.count({ where: { warehouseId: wh.id } });
    console.log(`${wh.code} | id=${wh.id} | stocks=${count}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
