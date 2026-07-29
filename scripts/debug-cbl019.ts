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
  // Find the specific sparepart
  const sp = await prisma.sparepart.findFirst({ where: { sku: "SP-CBL-019" } });
  if (!sp) { console.log("SP-CBL-019 not found!"); return; }
  console.log(`Sparepart: ${sp.sku} ${sp.name} (id: ${sp.id})`);

  // Check warehouse stock for this sparepart
  const stocks = await prisma.warehouseStock.findMany({
    where: { sparepartId: sp.id },
    include: { warehouse: true },
  });
  console.log(`\nWarehouse stocks for ${sp.sku}:`);
  if (stocks.length === 0) {
    console.log("  NO RECORDS FOUND!");
  } else {
    for (const s of stocks) {
      console.log(`  ${s.warehouse.code} (${s.warehouseId}): qty=${s.qty}`);
    }
  }

  // Also check all warehouse stocks count
  const total = await prisma.warehouseStock.count();
  console.log(`\nTotal warehouse_stocks records: ${total}`);

  // List all warehouses
  const whs = await prisma.warehouse.findMany();
  console.log("\nAll warehouses:");
  for (const wh of whs) {
    const count = await prisma.warehouseStock.count({ where: { warehouseId: wh.id } });
    console.log(`  ${wh.code} (${wh.id}): ${count} stock records`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
