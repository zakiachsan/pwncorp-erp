import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;
const dbUrl = process.env.DATABASE_URL;
let poolConfig: pg.PoolConfig;
if (dbUrl) {
  const u = new URL(dbUrl);
  poolConfig = { host: u.hostname, port: parseInt(u.port || "5432"), database: u.pathname.slice(1), user: u.username, password: decodeURIComponent(u.password) };
} else {
  poolConfig = { host: "127.0.0.1", port: 5435, database: "pwncorp_erp", user: "pwncorp", password: "test" };
}
const pool = new Pool(poolConfig);
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function spi(date: Date, seq: number) {
  const dd = date.toISOString().slice(2, 10).replace(/-/g, "");
  return `SPI/${dd}/${String(seq).padStart(4, "0")}`;
}

function poNo(date: Date, seq: number) {
  const dd = date.toISOString().slice(2, 10).replace(/-/g, "");
  return `PO/HO/${dd}/${String(seq).padStart(4, "0")}`;
}

async function main() {
  console.log("🌱 Seeding Purchase Invoices...");

  const stores = await prisma.store.findMany();
  const store = stores[0];
  if (!store) { console.error("No stores found!"); return; }

  const suppliers = await prisma.supplier.findMany({ where: { storeId: store.id } });
  if (suppliers.length === 0) { console.error("No suppliers found!"); return; }

  const spareparts = await prisma.sparepart.findMany({ where: { storeId: store.id }, take: 5 });
  if (spareparts.length === 0) { console.error("No spareparts found!"); return; }

  // Check if invoices already exist
  const existingCount = await prisma.purchaseInvoice.count();
  if (existingCount > 0) {
    console.log(`⚠️  ${existingCount} purchase invoices already exist. Skipping.`);
    return;
  }

  const today = new Date();
  const invoiceData = [
    { amount: 4500000,  status: "UNPAID", supIdx: 0, daysAgo: 24 },
    { amount: 12500000, status: "UNPAID", supIdx: 1, daysAgo: 21 },
    { amount: 3200000,  status: "PAID",   supIdx: 2, daysAgo: 18 },
    { amount: 8750000,  status: "UNPAID", supIdx: 3, daysAgo: 15 },
    { amount: 1500000,  status: "PAID",   supIdx: 0, daysAgo: 12 },
    { amount: 22000000, status: "UNPAID", supIdx: 1, daysAgo: 9 },
    { amount: 6800000,  status: "PAID",   supIdx: 2, daysAgo: 6 },
    { amount: 9500000,  status: "UNPAID", supIdx: 3, daysAgo: 3 },
  ];

  for (let i = 0; i < invoiceData.length; i++) {
    const d = invoiceData[i];
    const sup = suppliers[d.supIdx % suppliers.length];
    const poDate = new Date(today);
    poDate.setDate(poDate.getDate() - d.daysAgo);
    const invDate = new Date(poDate);
    invDate.setDate(invDate.getDate() + 2);
    const dueDate = new Date(invDate);
    dueDate.setDate(dueDate.getDate() + 30);

    // Create PO
    const po = await prisma.purchaseOrder.create({
      data: {
        poNo: poNo(poDate, 200 + i),
        supplierId: sup.id,
        storeId: store.id,
        status: "RECEIVED",
        total: d.amount,
        date: poDate,
      },
    });

    // Create PO Item
    const sp = spareparts[i % spareparts.length];
    const qty = Math.floor(d.amount / sp.buyPrice) || 5;
    const unitPrice = sp.buyPrice;
    await prisma.pOItem.create({
      data: { poId: po.id, sparepartId: sp.id, qty, unitPrice, total: d.amount },
    });

    // Create Purchase Invoice
    const docNo = spi(invDate, 5500 + i);
    const invoice = await prisma.purchaseInvoice.create({
      data: {
        docNo,
        poId: po.id,
        supplierId: sup.id,
        total: d.amount,
        status: d.status,
        date: invDate,
      },
    });

    // Create Account Payable
    await prisma.accountPayable.create({
      data: {
        purchaseInvoiceId: invoice.id,
        supplierId: sup.id,
        amount: d.amount,
        balance: d.status === "PAID" ? 0 : d.amount,
        dueDate,
        status: d.status === "PAID" ? "PAID" : "OPEN",
      },
    });

    console.log(`  ✅ ${docNo} — ${sup.companyName} — Rp ${d.amount.toLocaleString("id-ID")} [${d.status}]`);
  }

  console.log("\n✅ Done! 8 purchase invoices seeded.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
