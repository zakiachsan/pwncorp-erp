import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ host: '127.0.0.1', port: 5432, database: 'pwncorp_erp', user: 'postgres' });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  try {
    const services = await prisma.service.findMany();
    console.log('=== SERVICES ===');
    services.forEach((s: any) => console.log(s.id, s.name, 'Rp' + (s.sellPrice||0).toLocaleString()));
    
    const spareparts = await prisma.sparepart.findMany();
    console.log('\n=== SPAREPARTS ===');
    spareparts.forEach((s: any) => console.log(s.id, s.code, s.name, 'Rp' + (s.sellPrice||0).toLocaleString(), s.unit));
    
    const customers = await prisma.customer.findMany();
    console.log('\n=== CUSTOMERS ===');
    customers.forEach((c: any) => console.log(c.id, c.name, c.phone));
    
    const vehicles = await prisma.vehicle.findMany();
    console.log('\n=== VEHICLES ===');
    vehicles.forEach((v: any) => console.log(v.id, v.plateNumber, v.brand, v.model, v.year));
    
    // Check existing SRO
    const sro = await prisma.serviceOrder.findUnique({
      where: { soNo: 'SRO/WM/2607003' },
      include: { services: true, customer: true, vehicle: true },
    });
    console.log('\n=== SRO/WM/2607003 ===');
    console.log('Status:', sro?.status);
    console.log('Customer:', sro?.customer?.name);
    console.log('Vehicle:', sro?.vehicle?.plateNumber, sro?.vehicle?.brand, sro?.vehicle?.model);
    console.log('Services:', sro?.services?.length);
  } catch (e: any) {
    console.error('ERROR:', e.message);
  }
}

main().finally(() => prisma.$disconnect());
