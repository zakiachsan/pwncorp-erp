import prisma from "@/lib/prisma";

interface JournalLine {
  coaCode: string;   // search by COA code
  description?: string;
  debit: number;
  credit: number;
}

export async function createAutoJournal(
  storeId: string,
  userId: string,
  description: string,
  refType: string,
  refId: string,
  lines: JournalLine[]
): Promise<string | null> {
  try {
    const jeNo = `JE/${new Date().toISOString().slice(2, 10).replace(/-/g, "")}/${String(Date.now()).slice(-4)}`;

    // Resolve COA codes to IDs
    const details = await Promise.all(
      lines.map(async (line) => {
        const coa = await prisma.cOA.findFirst({
          where: { code: { startsWith: line.coaCode } },
        });
        if (!coa) throw new Error(`COA not found: ${line.coaCode}`);
        return {
          coaId: coa.id,
          description: line.description || description,
          debit: line.debit,
          credit: line.credit,
        };
      })
    );

    await prisma.journalEntry.create({
      data: {
        jeNo,
        date: new Date(),
        description,
        refType,
        refId,
        storeId,
        status: "Posted",
        createdById: userId,
        details: { create: details },
      },
    });

    return jeNo;
  } catch (err) {
    console.error("Auto journal failed:", err);
    return null;
  }
}
