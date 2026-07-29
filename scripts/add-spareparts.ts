import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ host: '127.0.0.1', port: 5432, database: 'pwncorp_erp', user: 'postgres' });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  try {
    const sro = await prisma.serviceOrder.findUnique({
      where: { soNo: 'SRO/WM/2607003' },
    });
    
    if (!sro) {
      console.log('SRO not found!');
      return;
    }

    // Get spareparts
    const oilFilter = await prisma.sparepart.findFirst({ where: { code: 'PRD-005' } }); // OIL FILTER 1010A Rp42.000
    const sparkPlug = await prisma.sparepart.findFirst({ where: { code: 'PRD-007' } }); // PLUG NGK BKR6E Rp35.000
    const brakePad = await prisma.sparepart.findFirst({ where: { code: 'PRD-013' } }); // BRAKE PAD SET REAR Rp165.000

    // Add spareparts
    if (oilFilter) {
      await prisma.sOSparepart.create({
        data: {
          soId: sro.id,
          sparepartId: oilFilter.id,
          qty: 2,
          unitPrice: oilFilter.sellPrice || 42000,
          total: (oilFilter.sellPrice || 42000) * 2,
        },
      });
      console.log('Added:', oilFilter.name, 'x2');
    }

    if (sparkPlug) {
      await prisma.sOSparepart.create({
        data: {
          soId: sro.id,
          sparepartId: sparkPlug.id,
          qty: 4,
          unitPrice: sparkPlug.sellPrice || 35000,
          total: (sparkPlug.sellPrice || 35000) * 4,
        },
      });
      console.log('Added:', sparkPlug.name, 'x4');
    }

    if (brakePad) {
      await prisma.sOSparepart.create({
        data: {
          soId: sro.id,
          sparepartId: brakePad.id,
          qty: 1,
          unitPrice: brakePad.sellPrice || 165000,
          total: (brakePad.sellPrice || 165000) * 1,
        },
      });
      console.log('Added:', brakePad.name, 'x1');
    }

    // Update total (services + spareparts)
    const services = await prisma.sOService.findMany({ where: { soId: sro.id } });
    const spareparts = await prisma.sOSparepart.findMany({ where: { soId: sro.id } });
    
    const serviceTotal = services.reduce((sum, s) => sum + s.total, 0);
    const sparepartTotal = spareparts.reduce((sum, s) => sum + s.total, 0);
    
    await prisma.serviceOrder.update({
      where: { id: sro.id },
      data: { total: serviceTotal + sparepartTotal },
    });

    console.log('\n=== SUMMARY ===');
    console.log('Services: Rp' + serviceTotal.toLocaleString());
    console.log('Spareparts: Rp' + sparepartTotal.toLocaleString());
    console.log('Grand Total: Rp' + (serviceTotal + sparepartTotal).toLocaleString());
    console.log('\nSpareparts added:');
    spareparts.forEach((s: any) => console.log(' -', s.sparepartId, 'x' + s.qty, 'Rp' + s.total.toLocaleString()));
    
  } catch (e: any) {
    console.error('ERROR:', e.message);
  }
}

main().finally(() => prisma.$disconnect());
