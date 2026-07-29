import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ host: '127.0.0.1', port: 5432, database: 'pwncorp_erp', user: 'postgres' });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  try {
    // Get existing SRO
    const sro = await prisma.serviceOrder.findUnique({
      where: { soNo: 'SRO/WM/2607003' },
      include: { services: true },
    });
    
    if (!sro) {
      console.log('SRO not found!');
      return;
    }

    // Delete existing services first
    await prisma.sOService.deleteMany({ where: { soId: sro.id } });
    
    // Get services and spareparts
    const gantiOli = await prisma.service.findFirst({ where: { name: 'Ganti Oli + Filter' } });
    const serviceRem = await prisma.service.findFirst({ where: { name: 'Service Rem' } });
    const tuneUp = await prisma.service.findFirst({ where: { name: 'Tune Up Mesin Bensin' } });
    
    const oilFilter = await prisma.sparepart.findFirst({ where: { code: 'PRD-005' } }); // OIL FILTER 1010A
    const sparkPlug = await prisma.sparepart.findFirst({ where: { code: 'PRD-007' } }); // PLUG NGK BKR6E
    const brakePad = await prisma.sparepart.findFirst({ where: { code: 'PRD-013' } }); // BRAKE PAD SET REAR
    
    // Update SRO status back to Diagnosis and update total
    const serviceTotal = (gantiOli?.sellPrice || 0) + (serviceRem?.sellPrice || 0) + (tuneUp?.sellPrice || 0);
    
    await prisma.serviceOrder.update({
      where: { id: sro.id },
      data: {
        status: 'Diagnosis',
        total: serviceTotal,
        complaint: 'Service berkala 60,000 km - ganti oli, service rem, tune up mesin',
      },
    });

    // Add services with proper prices
    if (gantiOli) {
      await prisma.sOService.create({
        data: {
          soId: sro.id,
          serviceId: gantiOli.id,
          qty: 1,
          unitPrice: 150000,
          total: 150000,
        },
      });
    }
    
    if (serviceRem) {
      await prisma.sOService.create({
        data: {
          soId: sro.id,
          serviceId: serviceRem.id,
          qty: 1,
          unitPrice: 200000,
          total: 200000,
        },
      });
    }
    
    if (tuneUp) {
      await prisma.sOService.create({
        data: {
          soId: sro.id,
          serviceId: tuneUp.id,
          qty: 1,
          unitPrice: 250000,
          total: 250000,
        },
      });
    }

    // Update total to include all services
    const finalTotal = 150000 + 200000 + 250000;
    await prisma.serviceOrder.update({
      where: { id: sro.id },
      data: { total: finalTotal },
    });

    // Get updated SRO
    const updated = await prisma.serviceOrder.findUnique({
      where: { soNo: 'SRO/WM/2607003' },
      include: { services: { include: { service: true } }, customer: true, vehicle: true },
    });

    console.log('=== SRO/WM/2607003 UPDATED ===');
    console.log('Status:', updated?.status);
    console.log('Customer:', updated?.customer?.name);
    console.log('Vehicle:', updated?.vehicle?.brand, updated?.vehicle?.model);
    console.log('Complaint:', updated?.complaint);
    console.log('Total: Rp' + (updated?.total || 0).toLocaleString());
    console.log('\nServices:');
    updated?.services?.forEach((s: any) => {
      console.log(' -', s.service?.name, 'x' + s.qty, 'Rp' + s.unitPrice.toLocaleString());
    });
    
    console.log('\nSpareparts available:');
    console.log(' -', oilFilter?.code, oilFilter?.name, 'Rp' + (oilFilter?.sellPrice||0).toLocaleString());
    console.log(' -', sparkPlug?.code, sparkPlug?.name, 'Rp' + (sparkPlug?.sellPrice||0).toLocaleString());
    console.log(' -', brakePad?.code, brakePad?.name, 'Rp' + (brakePad?.sellPrice||0).toLocaleString());
    
  } catch (e: any) {
    console.error('ERROR:', e.message);
  }
}

main().finally(() => prisma.$disconnect());
