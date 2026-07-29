import { PrismaClient } from '@prisma/client';

// COA Codes
export const COA = {
  KAS_TUNAI: '1110',
  BANK_BCA: '1120',
  BANK_MANDIRI: '1130',
  PIUTANG: '1200',
  PERSEDIAAN: '1300',
  HUTANG: '2100',
  MODAL: '3100',
  PENDAPATAN_JASA: '4100',
  PENDAPATAN_SPAREPART: '4200',
  HPP: '5100',
  BEBAN_GAJI: '5200',
  BEBAN_LISTRIK: '5300',
} as const;

// Generate JE Number: JE/YYYYMM/XXXX
async function generateJENo(prisma: PrismaClient, storeId: string): Promise<string> {
  const now = new Date();
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prefix = `JE/${ym}/`;
  const last = await prisma.journalEntry.findFirst({
    where: { jeNo: { startsWith: prefix } },
    orderBy: { jeNo: 'desc' },
  });
  const seq = last ? parseInt(last.jeNo.split('/').pop() || '0') + 1 : 1;
  return `${prefix}${String(seq).padStart(4, '0')}`;
}

export interface JournalLine {
  coaCode: string;
  debit?: number;
  credit?: number;
  description?: string;
}

export interface CreateJournalParams {
  prisma: PrismaClient;
  storeId: string;
  createdById: string;
  date?: Date;
  description: string;
  refType: string;
  refId: string;
  lines: JournalLine[];
  status?: string;
}

export async function createJournalEntry(params: CreateJournalParams) {
  const { prisma, storeId, createdById, date, description, refType, refId, lines, status = 'Posted' } = params;

  // Validate: total debit must equal total credit
  const totalDebit = lines.reduce((s, l) => s + (l.debit || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (l.credit || 0), 0);
  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw new Error(`Journal imbalance: Debit ${totalDebit} ≠ Credit ${totalCredit}`);
  }

  const jeNo = await generateJENo(prisma, storeId);

  // Resolve COA IDs
  const coaRecords = await prisma.cOA.findMany({
    where: { code: { in: lines.map(l => l.coaCode) } },
  });
  const coaMap = new Map(coaRecords.map(c => [c.code, c.id]));

  const je = await prisma.journalEntry.create({
    data: {
      jeNo,
      date: date || new Date(),
      description,
      refType,
      refId,
      storeId,
      status,
      createdById,
      details: {
        create: lines.map(l => {
          const coaId = coaMap.get(l.coaCode);
          if (!coaId) throw new Error(`COA not found: ${l.coaCode}`);
          return {
            coaId,
            description: l.description || description,
            debit: l.debit || 0,
            credit: l.credit || 0,
          };
        }),
      },
    },
    include: { details: true },
  });

  return je;
}
