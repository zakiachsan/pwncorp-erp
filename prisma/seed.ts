import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const { Pool } = pg;
const pool = new Pool({ 
  host: "127.0.0.1",
  port: 5435,
  database: "pwncorp_erp",
  user: "pwncorp",
  password: "test",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Stores ───
  const storeWM = await prisma.store.create({ data: { name: "Wijaya Motor", code: "WM", address: "Bengkel Utama" } });
  const storePJ = await prisma.store.create({ data: { name: "PT Putro Joyo Motor", code: "PJ", address: "Cabang 1" } });
  const storeNJ = await prisma.store.create({ data: { name: "PT Nia Jaya Motor", code: "NJ", address: "Cabang 2" } });
  const storePW = await prisma.store.create({ data: { name: "PT Putra Wijaya Motor", code: "PW", address: "Cabang 3" } });

  // ─── Roles ───
  const roleOwner = await prisma.role.create({ data: { name: "Owner" } });
  const roleAdmin = await prisma.role.create({ data: { name: "Admin" } });
  const roleSA = await prisma.role.create({ data: { name: "SA" } });
  const roleMekanik = await prisma.role.create({ data: { name: "Mekanik" } });
  const roleFinance = await prisma.role.create({ data: { name: "Finance" } });

  // ─── Users ───
  const hash = await bcrypt.hash("password123", 10);
  await prisma.user.create({ data: { name: "Yusro Iqbal", email: "owner@bengkel.com", passwordHash: hash, roleId: roleOwner.id, storeId: storeWM.id } });
  await prisma.user.create({ data: { name: "Angga Novianto", email: "admin@pwncorp.co.id", passwordHash: hash, roleId: roleAdmin.id, storeId: storeWM.id } });
  await prisma.user.create({ data: { name: "Rudi", email: "rudi@bengkel.com", passwordHash: hash, roleId: roleSA.id, storeId: storePW.id } });
  await prisma.user.create({ data: { name: "Budi", email: "budi@bengkel.com", passwordHash: hash, roleId: roleSA.id, storeId: storePJ.id } });
  await prisma.user.create({ data: { name: "Ani", email: "ani@bengkel.com", passwordHash: hash, roleId: roleSA.id, storeId: storeNJ.id } });
  await prisma.user.create({ data: { name: "Bambang", email: "bambang@bengkel.com", passwordHash: hash, roleId: roleMekanik.id, storeId: storePJ.id } });
  await prisma.user.create({ data: { name: "Agus", email: "agus@bengkel.com", passwordHash: hash, roleId: roleMekanik.id, storeId: storeWM.id } });
  await prisma.user.create({ data: { name: "Hendra", email: "hendra@bengkel.com", passwordHash: hash, roleId: roleMekanik.id, storeId: storePW.id } });
  await prisma.user.create({ data: { name: "Finance", email: "finance@bengkel.com", passwordHash: hash, roleId: roleFinance.id, storeId: storeWM.id } });

  // ─── Customers ───
  const c1 = await prisma.customer.create({ data: { name: "Budi Santoso", type: "retail", phone: "0812-1111-0001", whatsapp: "081211110001", storeId: storeWM.id } });
  const c2 = await prisma.customer.create({ data: { name: "PT Maju Jaya", type: "wholesale", phone: "0812-2222-0002", address: "Jl. Industri No. 5", storeId: storeWM.id } });
  const c3 = await prisma.customer.create({ data: { name: "Siti Rahmawati", type: "retail", phone: "0812-3333-0003", storeId: storePW.id } });
  const c4 = await prisma.customer.create({ data: { name: "CV Berkah Abadi", type: "wholesale", phone: "0812-4444-0004", address: "Jl. Niaga No. 10", storeId: storeWM.id } });
  const c5 = await prisma.customer.create({ data: { name: "Ahmad Fauzi", type: "retail", phone: "0812-5555-0005", storeId: storeNJ.id } });
  const c6 = await prisma.customer.create({ data: { name: "PT Transport Jaya", type: "wholesale", phone: "0812-6666-0006", address: "Jl. Logistik No. 15", storeId: storePJ.id } });

  // ─── Vehicles ───
  await prisma.vehicle.create({ data: { customerId: c1.id, plateNo: "B 1234 CD", brand: "Toyota", model: "Avanza", year: 2019, storeId: storeWM.id } });
  await prisma.vehicle.create({ data: { customerId: c2.id, plateNo: "B 5678 EF", brand: "Honda", model: "Civic", year: 2020, storeId: storeWM.id } });
  await prisma.vehicle.create({ data: { customerId: c3.id, plateNo: "B 9012 GH", brand: "Mitsubishi", model: "Pajero", year: 2018, storeId: storePW.id } });
  await prisma.vehicle.create({ data: { customerId: c4.id, plateNo: "B 3456 IJ", brand: "Suzuki", model: "Ertiga", year: 2021, storeId: storeWM.id } });
  await prisma.vehicle.create({ data: { customerId: c5.id, plateNo: "B 7890 KL", brand: "Daihatsu", model: "Xenia", year: 2020, storeId: storeNJ.id } });
  await prisma.vehicle.create({ data: { customerId: c6.id, plateNo: "B 1112 MN", brand: "Isuzu", model: "Elf", year: 2019, storeId: storePJ.id } });
  await prisma.vehicle.create({ data: { customerId: c4.id, plateNo: "B 1314 OP", brand: "Mitsubishi", model: "L300", year: 2017, storeId: storeWM.id } });

  // ─── Suppliers ───
  const sup1 = await prisma.supplier.create({ data: { companyName: "PT Auto Parts Sejahtera", phone: "021-5555-0001", storeId: storeWM.id } });
  const sup2 = await prisma.supplier.create({ data: { companyName: "CV Suku Cadang Jaya", phone: "021-5555-0002", storeId: storeWM.id } });
  const sup3 = await prisma.supplier.create({ data: { companyName: "UD Sparepart Berkah", phone: "021-5555-0003", storeId: storeWM.id } });
  const sup4 = await prisma.supplier.create({ data: { companyName: "PT Maju Motor Indonesia", phone: "021-5555-0004", storeId: storeWM.id } });
  const sup5 = await prisma.supplier.create({ data: { companyName: "CV Ban Jaya Abadi", phone: "021-5555-0005", storeId: storeWM.id } });
  const sup6 = await prisma.supplier.create({ data: { companyName: "PT Diesel Parts", phone: "021-5555-0006", storeId: storeWM.id } });

  // ─── Spareparts ───
  const sparts = [
    { sku: "SP-BND-001", name: "BENDIX STATER", code: "PRD-001", brand: "Bendix", type: "Brake", buyPrice: 150000, sellPrice: 185000, stockQty: 48, minStock: 5, category: "Brake", supplierId: sup1.id },
    { sku: "SP-SWC-002", name: "SWITCH HEAD LIGHT", code: "PRD-002", brand: "Denso", type: "Electrical", buyPrice: 55000, sellPrice: 75000, stockQty: 120, minStock: 10, category: "Electrical", supplierId: sup2.id },
    { sku: "SP-WNT-003", name: "WHEEL NUT 12MM", code: "PRD-003", brand: "Bosch", type: "Chassis", buyPrice: 5000, sellPrice: 8500, stockQty: 500, minStock: 50, category: "Chassis", isBundle: true, supplierId: sup3.id },
    { sku: "SP-CMP-004", name: "COMPRESSOR ASSY", code: "PRD-004", brand: "Sanden", type: "AC System", buyPrice: 2000000, sellPrice: 2350000, stockQty: 12, minStock: 2, category: "AC System", supplierId: sup4.id },
    { sku: "SP-OIL-005", name: "OIL FILTER 1010A", code: "PRD-005", brand: "Toyota", type: "Engine", buyPrice: 30000, sellPrice: 42000, stockQty: 230, minStock: 20, category: "Engine", supplierId: sup5.id },
    { sku: "SP-FLT-006", name: "FUEL FILTER ASSY", code: "PRD-006", brand: "Denso", type: "Engine", buyPrice: 90000, sellPrice: 125000, stockQty: 65, minStock: 5, category: "Engine", supplierId: sup2.id },
    { sku: "SP-PLG-007", name: "PLUG NGK BKR6E", code: "PRD-007", brand: "NGK", type: "Ignition", buyPrice: 25000, sellPrice: 35000, stockQty: 300, minStock: 30, category: "Ignition", supplierId: sup4.id },
    { sku: "SP-PLY-008", name: "PLYWOOD BELT TENSIONER", code: "PRD-008", brand: "Gates", type: "Belt", buyPrice: 150000, sellPrice: 195000, stockQty: 40, minStock: 5, category: "Belt" },
    { sku: "SP-STR-009", name: "STRUT SHOCK ABSORBER", code: "PRD-009", brand: "KYB", type: "Suspension", buyPrice: 400000, sellPrice: 480000, stockQty: 28, minStock: 3, category: "Suspension" },
    { sku: "SP-BRG-010", name: "BEARING WHEEL 6205", code: "PRD-010", brand: "NSK", type: "Chassis", buyPrice: 45000, sellPrice: 68000, stockQty: 150, minStock: 15, category: "Chassis", isBundle: true },
    { sku: "SP-CLK-011", name: "CLUTCH DISC 200MM", code: "PRD-011", brand: "Exedy", type: "Clutch", buyPrice: 300000, sellPrice: 375000, stockQty: 22, minStock: 2, category: "Clutch" },
    { sku: "SP-RTR-012", name: "ROTOR DISC FRONT", code: "PRD-012", brand: "Bendix", type: "Brake", buyPrice: 230000, sellPrice: 290000, stockQty: 35, minStock: 5, category: "Brake" },
    { sku: "SP-PAD-013", name: "BRAKE PAD SET REAR", code: "PRD-013", brand: "Akebono", type: "Brake", buyPrice: 120000, sellPrice: 165000, stockQty: 55, minStock: 8, category: "Brake" },
    { sku: "SP-BAT-014", name: "BATTERY 60D23L", code: "PRD-014", brand: "GS Astra", type: "Electrical", buyPrice: 550000, sellPrice: 650000, stockQty: 18, minStock: 2, category: "Electrical" },
    { sku: "SP-BLT-015", name: "V-BELT 4PK950", code: "PRD-015", brand: "Bando", type: "Belt", buyPrice: 30000, sellPrice: 45000, stockQty: 80, minStock: 10, category: "Belt" },
    { sku: "SP-THM-016", name: "THERMOSTAT 82C", code: "PRD-016", brand: "Toyota", type: "Engine", buyPrice: 90000, sellPrice: 125000, stockQty: 42, minStock: 5, category: "Engine" },
    { sku: "SP-SPK-017", name: "SPARK PLUG COPPER", code: "PRD-017", brand: "NGK", type: "Ignition", buyPrice: 18000, sellPrice: 28000, stockQty: 200, minStock: 25, category: "Ignition" },
    { sku: "SP-WPR-018", name: "WIPER BLADE 22IN", code: "PRD-018", brand: "Bosch", type: "Body", buyPrice: 35000, sellPrice: 55000, stockQty: 90, minStock: 10, category: "Body", isBundle: true },
    { sku: "SP-CBL-019", name: "CABLE CLUTCH ASSY", code: "PRD-019", brand: "Exedy", type: "Clutch", buyPrice: 150000, sellPrice: 195000, stockQty: 15, minStock: 2, category: "Clutch" },
    { sku: "SP-LMP-020", name: "LAMP H4 12V 60W", code: "PRD-020", brand: "Philips", type: "Electrical", buyPrice: 30000, sellPrice: 48000, stockQty: 160, minStock: 15, category: "Electrical" },
  ];
  for (const s of sparts) {
    await prisma.sparepart.create({ data: { ...s, storeId: storeWM.id, tax: "PPN 11%" } });
  }

  // ─── Services ───
  const svcs = [
    { sku: "JAS-OVH-001", name: "Overhaul Mesin", category: "Engine", standardPrice: 2375000 },
    { sku: "JAS-NTF-001", name: "NITRO FILL (BARU)", category: "AC", standardPrice: 20000 },
    { sku: "JAS-TUN-001", name: "Tune Up Mesin Bensin", category: "Engine", standardPrice: 350000 },
    { sku: "JAS-SPO-001", name: "Spooring & Balancing", category: "Chassis", standardPrice: 250000 },
    { sku: "JAS-GOL-001", name: "Ganti Oli + Filter", category: "Engine", standardPrice: 150000 },
    { sku: "JAS-BRK-001", name: "Service Rem", category: "Brake", standardPrice: 200000 },
    { sku: "JAS-CAT-001", name: "Cat Full Body", category: "Body", standardPrice: 14000000 },
  ];
  for (const s of svcs) {
    await prisma.service.create({ data: { ...s, storeId: storeWM.id } });
  }

  // ─── Service Packages ───
  const pkgs = [
    { sku: "PACK-PREMIUM-D", name: "GASOLINE TREATMENT", price: 857881, estDuration: "3 Jam 30 Menit" },
    { sku: "PACK-BODYREPAIR-SEDAN", name: "CAT ALL BODY, LAS / KETOK / DEMPUL + EPOXY + CAT FINISHING + DETAILING", price: 22200000, estDuration: "3 Hari 8 Jam" },
    { sku: "PACK-BODYREPAIR-L", name: "CAT ALL BODY, LAS / KETOK / DEMPUL + EPOXY + CAT FINISHING", price: 25458716, estDuration: "2 Jam 30 Menit" },
    { sku: "PACK-002", name: "GANTI OLI & FILTER OLI", price: 620664 },
    { sku: "PACK-001", name: "SPOORING & BALANCING", price: 253569 },
    { sku: "PACK-BODYREPAIR-FULL", name: "CAT FULL BODY", price: 14000000 },
    { sku: "PACK-PREMIUM-C", name: "DIESEL TREATMENT", price: 630416 },
  ];
  for (const p of pkgs) {
    await prisma.servicePackage.create({ data: { ...p, storeId: storeWM.id, tax: "PPN" } });
  }

  // ─── COA ───
  const coaAsset = await prisma.cOA.create({ data: { code: "1000", name: "ASET", kategori: "Asset", normalBalance: "Debit", level: 1 } });
  const coaKas = await prisma.cOA.create({ data: { code: "1100", name: "Kas & Bank", kategori: "Asset", normalBalance: "Debit", parentId: coaAsset.id, level: 2 } });
  await prisma.cOA.create({ data: { code: "1110", name: "Kas Tunai", kategori: "Asset", normalBalance: "Debit", parentId: coaKas.id, level: 3 } });
  await prisma.cOA.create({ data: { code: "1120", name: "Bank BCA", kategori: "Asset", normalBalance: "Debit", parentId: coaKas.id, level: 3 } });
  await prisma.cOA.create({ data: { code: "1130", name: "Bank Mandiri", kategori: "Asset", normalBalance: "Debit", parentId: coaKas.id, level: 3 } });
  await prisma.cOA.create({ data: { code: "1200", name: "Piutang Usaha", kategori: "Asset", normalBalance: "Debit", parentId: coaAsset.id, level: 2 } });
  await prisma.cOA.create({ data: { code: "1300", name: "Persediaan", kategori: "Asset", normalBalance: "Debit", parentId: coaAsset.id, level: 2 } });

  const coaLiab = await prisma.cOA.create({ data: { code: "2000", name: "LIABILITAS", kategori: "Liability", normalBalance: "Kredit", level: 1 } });
  await prisma.cOA.create({ data: { code: "2100", name: "Hutang Usaha", kategori: "Liability", normalBalance: "Kredit", parentId: coaLiab.id, level: 2 } });

  const coaEq = await prisma.cOA.create({ data: { code: "3000", name: "EKUITAS", kategori: "Equity", normalBalance: "Kredit", level: 1 } });
  await prisma.cOA.create({ data: { code: "3100", name: "Modal", kategori: "Equity", normalBalance: "Kredit", parentId: coaEq.id, level: 2 } });

  const coaRev = await prisma.cOA.create({ data: { code: "4000", name: "PENDAPATAN", kategori: "Revenue", normalBalance: "Kredit", level: 1 } });
  await prisma.cOA.create({ data: { code: "4100", name: "Pendapatan Jasa", kategori: "Revenue", normalBalance: "Kredit", parentId: coaRev.id, level: 2 } });
  await prisma.cOA.create({ data: { code: "4200", name: "Pendapatan Sparepart", kategori: "Revenue", normalBalance: "Kredit", parentId: coaRev.id, level: 2 } });

  const coaExp = await prisma.cOA.create({ data: { code: "5000", name: "BEBAN", kategori: "Expense", normalBalance: "Debit", level: 1 } });
  await prisma.cOA.create({ data: { code: "5100", name: "HPP", kategori: "Expense", normalBalance: "Debit", parentId: coaExp.id, level: 2 } });
  await prisma.cOA.create({ data: { code: "5200", name: "Beban Gaji", kategori: "Expense", normalBalance: "Debit", parentId: coaExp.id, level: 2 } });
  await prisma.cOA.create({ data: { code: "5300", name: "Beban Listrik", kategori: "Expense", normalBalance: "Debit", parentId: coaExp.id, level: 2 } });

  // ─── Bank Accounts ───
  await prisma.bankAccount.create({ data: { bankName: "Kas Tunai", accountNo: "-", accountName: "Kas Besar", balance: 25000000, storeId: storeWM.id } });
  await prisma.bankAccount.create({ data: { bankName: "Bank BCA", accountNo: "123-456-7890", accountName: "BCA Wijaya Motor", balance: 150000000, storeId: storeWM.id } });
  await prisma.bankAccount.create({ data: { bankName: "Bank Mandiri", accountNo: "098-765-4321", accountName: "Mandiri Wijaya Motor", balance: 85000000, storeId: storeWM.id } });
  await prisma.bankAccount.create({ data: { bankName: "Bank BRI", accountNo: "567-890-1234", accountName: "BRI Wijaya Motor", balance: 45000000, storeId: storeWM.id } });

  console.log("✅ Seed selesai!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
