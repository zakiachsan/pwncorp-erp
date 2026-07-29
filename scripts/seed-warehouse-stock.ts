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
  console.log("🌱 Seeding warehouse stock...");

  // Get warehouses
  const warehouses = await prisma.warehouse.findMany();
  console.log(`Found ${warehouses.length} warehouses`);

  // Get spareparts
  const spareparts = await prisma.sparepart.findMany();
  console.log(`Found ${spareparts.length} spareparts`);

  if (warehouses.length === 0 || spareparts.length === 0) {
    console.log("❌ Need warehouses and spareparts first!");
    return;
  }

  // Create warehouse stock for each sparepart in each warehouse
  // Gudang Utama (GU-01): main stock
  // Gudang Suku Cadang (GS-01): parts stock  
  // Gudang Ban & Velg (GB-01): only wheel/tire related
  
  for (const sp of spareparts) {
    for (const wh of warehouses) {
      let qty = 0;
      
      // Gudang Utama: gets 40% of total stock
      if (wh.code === "GU-01") {
        qty = Math.floor(sp.stockQty * 0.4);
      }
      // Gudang Suku Cadang: gets 50% of total stock
      else if (wh.code === "GS-01") {
        qty = Math.floor(sp.stockQty * 0.5);
      }
      // Gudang Ban & Velg: gets 10% (only for wheel/tire/belt items)
      else if (wh.code === "GB-01") {
        const isWheelOrTire = sp.category === "Chassis" || sp.category === "Belt" || sp.name.toLowerCase().includes("wheel") || sp.name.toLowerCase().includes("ban") || sp.name.toLowerCase().includes("velg");
        qty = isWheelOrTire ? Math.floor(sp.stockQty * 0.1) : 0;
      }

      // Upsert warehouse stock
      await prisma.warehouseStock.upsert({
        where: { 
          warehouseId_sparepartId: { 
            warehouseId: wh.id, 
            sparepartId: sp.id 
          } 
        },
        update: { qty },
        create: {
          warehouseId: wh.id,
          sparepartId: sp.id,
          qty,
        },
      });
    }
    console.log(`  ✅ ${sp.name}: ${sp.stockQty} total`);
  }

  // Show summary
  console.log("\n📊 Warehouse Stock Summary:");
  for (const wh of warehouses) {
    const stocks = await prisma.warehouseStock.findMany({ where: { warehouseId: wh.id } });
    const total = stocks.reduce((sum, s) => sum + s.qty, 0);
    console.log(`  ${wh.name} (${wh.code}): ${total} items`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
