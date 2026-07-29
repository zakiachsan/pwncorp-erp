import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ host: '127.0.0.1', port: 5432, database: 'pwncorp_erp', user: 'postgres' });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  try {
    const coaCount = await prisma.cOA.count();
    console.log('COA count:', coaCount);
    if (coaCount > 0) {
      const coas = await prisma.cOA.findMany({ orderBy: { code: 'asc' } });
      coas.forEach((c: any) => console.log(c.code, '-', c.name, '(' + c.kategori + ')'));
    } else {
      console.log('NO COA FOUND - need to seed');
    }
    const journalCount = await prisma.journalEntry.count();
    console.log('Journal count:', journalCount);
    const invoiceCount = await prisma.invoice.count();
    console.log('Invoice count:', invoiceCount);
  } catch (e: any) {
    console.error('ERROR:', e.message);
  }
}

main().finally(() => prisma.$disconnect());
