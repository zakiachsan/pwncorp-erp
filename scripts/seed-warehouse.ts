import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;
const dbUrl = process.env.DATABASE_URL!;
const u = new URL(dbUrl);
const poolConfig = { host: u.hostname, port: parseInt(u.port || "5432"), database: u.pathname.slice(1), user: u.username, password: decodeURIComponent(u.password) };
const pool = new Pool(poolConfig);
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding warehouses & products...");

  // Get store WM
  const store = await prisma.store.findFirst({ where: { code: "WM" } });
  if (!store) { console.log("❌ Store WM not found!"); return; }
  console.log("✅ Store:", store.name, store.id);

  // Create warehouses
  const warehouses = [
    { name: "Gudang Utama", code: "GU-01", address: "Lantai 1 - Bengkel Utama" },
    { name: "Gudang Suku Cadang", code: "GS-01", address: "Lantai 1 - Area Sparepart" },
    { name: "Gudang Ban & Velg", code: "GB-01", address: "Lantai 1 - Area Ban" },
  ];

  for (const wh of warehouses) {
    const exists = await prisma.warehouse.findFirst({ where: { code: wh.code } });
    if (!exists) {
      await prisma.warehouse.create({ data: { ...wh, storeId: store.id } });
      console.log("  ✅ Created warehouse:", wh.name);
    } else {
      console.log("  ⏭️  Warehouse exists:", wh.name);
    }
  }

  // Check spareparts stock
  const spareparts = await prisma.sparepart.findMany({ where: { storeId: store.id } });
  console.log(`\n📦 Spareparts count: ${spareparts.length}`);
  
  // Show stock summary
  let totalStock = 0;
  let withStock = 0;
  for (const sp of spareparts) {
    totalStock += sp.stockQty;
    if (sp.stockQty > 0) withStock++;
  }
  console.log(`   Total stock qty: ${totalStock}`);
  console.log(`   With stock > 0: ${withStock}/${spareparts.length}`);
  
  // Show first 5
  for (const sp of spareparts.slice(0, 5)) {
    console.log(`   - ${sp.sku}: ${sp.name} (stock: ${sp.stockQty})`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
