import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ host: '127.0.0.1', port: 5432, database: 'pwncorp_erp', user: 'postgres' });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  try {
    const store = await prisma.store.findFirst();
    const customer = await prisma.customer.findFirst();
    const vehicle = await prisma.vehicle.findFirst();
    const sa = await prisma.user.findFirst({ where: { role: { name: 'SA' } } });
    const services = await prisma.service.findMany({ take: 2 });
    
    if (!store || !customer || !vehicle || !sa || services.length === 0) {
      console.log('Missing data');
      return;
    }

    const sro = await prisma.serviceOrder.create({
      data: {
        soNo: 'SRO/WM/2607003',
        storeId: store.id,
        customerId: customer.id,
        vehicleId: vehicle.id,
        saId: sa.id,
        complaint: 'Service berkala - ganti oli dan cek rem',
        status: 'Diagnosis',
        date: new Date(),
        total: services.reduce((sum: number, s: any) => sum + (s.sellPrice || 0), 0),
        services: {
          create: services.map((s: any) => ({
            serviceId: s.id,
            qty: 1,
            unitPrice: s.sellPrice || 0,
            total: s.sellPrice || 0,
          })),
        },
      },
      include: {
        services: true,
        customer: true,
        vehicle: true,
      },
    });

    console.log('SUCCESS! Created SRO:', sro.soNo, 'Status:', sro.status);
  } catch (e: any) {
    console.error('ERROR:', e.message);
  }
}

main().finally(() => prisma.$disconnect());
