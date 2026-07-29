import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ host: '127.0.0.1', port: 5432, database: 'pwncorp_erp', user: 'postgres' });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  try {
    // Find WO
    const wo = await prisma.workOrder.findFirst({
      where: { woNo: 'SWO/WM/2607003' },
      include: { stockOrders: true },
    });

    if (!wo) {
      console.log('WO not found!');
      return;
    }

    console.log('WO found:', wo.woNo, 'Status:', wo.status);
    console.log('Stock orders:', wo.stockOrders.length);

    // Delete stock order items first
    for (const so of wo.stockOrders) {
      await prisma.stockOrderItem.deleteMany({ where: { stockOrderId: so.id } });
      console.log('Deleted items for SO:', so.orderNo);
    }

    // Delete stock orders
    await prisma.stockOrder.deleteMany({ where: { woId: wo.id } });
    console.log('Deleted all stock orders');

    // Update WO status to WAITING
    await prisma.workOrder.update({
      where: { id: wo.id },
      data: { status: 'WAITING' },
    });
    console.log('WO status updated to WAITING');

    // Verify
    const updated = await prisma.workOrder.findFirst({
      where: { woNo: 'SWO/WM/2607003' },
      include: { stockOrders: true },
    });
    console.log('\n=== VERIFIED ===');
    console.log('Status:', updated?.status);
    console.log('Stock orders:', updated?.stockOrders.length);
  } catch (e: any) {
    console.error('ERROR:', e.message);
  }
}

main().finally(() => prisma.$disconnect());
