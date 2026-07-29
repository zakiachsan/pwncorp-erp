import pg from 'pg';

const pool = new pg.Pool({ host: '127.0.0.1', port: 5432, database: 'pwncorp_erp', user: 'postgres' });

async function main() {
  const client = await pool.connect();
  try {
    // Check current journals
    const journals = await client.query(`
      SELECT je.je_no, je.description, je.ref_type, je.status, je.date,
             json_agg(json_build_object('coa_code', c.code, 'coa_name', c.name, 'debit', jd.debit, 'credit', jd.credit)) as lines
      FROM journal_entries je
      JOIN journal_details jd ON jd.je_id = je.id
      JOIN coa c ON c.id = jd.coa_id
      GROUP BY je.id, je.je_no, je.description, je.ref_type, je.status, je.date
      ORDER BY je.date DESC
      LIMIT 20
    `);

    console.log(`\n=== ${journals.rows.length} JOURNAL ENTRIES FOUND ===\n`);
    
    for (const j of journals.rows) {
      console.log(`📄 ${j.je_no} | ${j.date.toISOString().slice(0,10)} | ${j.ref_type} | ${j.status}`);
      console.log(`   ${j.description}`);
      for (const line of j.lines) {
        const debit = line.debit > 0 ? `Rp ${line.debit.toLocaleString('id-ID')}` : '';
        const credit = line.credit > 0 ? `Rp ${line.credit.toLocaleString('id-ID')}` : '';
        console.log(`   → ${line.coa_code} ${line.coa_name}: ${debit ? 'D ' + debit : 'K ' + credit}`);
      }
      console.log('');
    }

    if (journals.rows.length === 0) {
      console.log('NO JOURNALS YET - need to trigger via transactions');
    }
  } finally {
    client.release();
  }
}

main().catch(e => console.error(e)).finally(() => pool.end());
