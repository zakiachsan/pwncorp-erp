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
  // Find the WO
  const wo = await prisma.workOrder.findFirst({
    where: { woNo: "SWO/WM/2607001" },
    include: { items: true },
  });
  if (!wo) { console.log("WO not found!"); return; }
  console.log(`WO: ${wo.woNo} (id: ${wo.id})`);
  console.log(`\nWO Items (${wo.items.length}):`);
  for (const item of wo.items) {
    console.log(`  itemType=${item.itemType} itemId=${item.itemId} itemName=${item.itemName}`);
  }

  // Check if the sparepartId in WO items matches warehouse_stocks
  const spItem = wo.items.find(i => i.itemType === "sparepart");
  if (spItem) {
    console.log(`\nFirst sparepart item: ${spItem.itemName} (id: ${spItem.itemId})`);
    const ws = await prisma.warehouseStock.findFirst({ where: { sparepartId: spItem.itemId } });
    console.log(`Warehouse stock record exists: ${!!ws}`);
    if (ws) console.log(`  qty: ${ws.qty}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
