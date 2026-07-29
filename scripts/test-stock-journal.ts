import pg from 'pg';
const pool = new pg.Pool({ host: '127.0.0.1', port: 5432, database: 'pwncorp_erp', user: 'postgres' });

async function main() {
  const client = await pool.connect();
  try {
    const user = await client.query("SELECT id, store_id FROM users WHERE email = 'admin@pwncorp.co.id'");

    // Create stock order
    const soResult = await client.query(`
      INSERT INTO stock_orders (id, order_no, store_id, status, date, created_at)
      VALUES (gen_random_uuid()::text, 'OPO/WM/2607008', $1, 'PENDING', NOW(), NOW())
      RETURNING id, order_no
    `, [user.rows[0].store_id]);
    const soId = soResult.rows[0].id;
    const soNo = soResult.rows[0].order_no;

    // Add 3 items with known SKUs
    const items = [
      { sku: 'SP-OIL-005', qty: 2 },
      { sku: 'SP-PLG-007', qty: 4 },
      { sku: 'SP-PAD-013', qty: 1 },
    ];

    let totalValue = 0;
    const jeDetails: string[] = [];

    for (const item of items) {
      const sp = await client.query("SELECT id, name, buy_price FROM spareparts WHERE sku = $1", [item.sku]);
      if (sp.rows.length > 0) {
        const s = sp.rows[0];
        await client.query(`
          INSERT INTO stock_order_items (id, stock_order_id, sparepart_id, qty, sent_qty)
          VALUES (gen_random_uuid()::text, $1, $2, $3, $3)
        `, [soId, s.id, item.qty]);
        const itemTotal = (s.buy_price || 0) * item.qty;
        totalValue += itemTotal;
        jeDetails.push(`  → Persediaan ${s.name} x${item.qty}: D Rp ${itemTotal.toLocaleString('id-ID')}`);
        console.log(`  + ${s.name} x${item.qty} @ Rp ${(s.buy_price || 0).toLocaleString('id-ID')} = Rp ${itemTotal.toLocaleString('id-ID')}`);
      }
    }

    // Receive it
    await client.query("UPDATE stock_orders SET status = 'RECEIVED' WHERE id = $1", [soId]);
    console.log(`\nSO ${soNo} → RECEIVED`);

    // Create journal
    const persediaanCOA = await client.query("SELECT id FROM coa WHERE code = '1300'");
    const hutangCOA = await client.query("SELECT id FROM coa WHERE code = '2100'");

    const jeResult = await client.query(`
      INSERT INTO journal_entries (id, je_no, date, description, ref_type, ref_id, store_id, status, created_by_id, created_at)
      VALUES (gen_random_uuid()::text, 'JE/260730/0004', NOW(), $1, 'stock_order', $2, $3, 'Posted', $4, NOW())
      RETURNING id
    `, [`Stock Order ${soNo} diterima`, soId, user.rows[0].store_id, user.rows[0].id]);

    await client.query(`
      INSERT INTO journal_details (id, je_id, coa_id, description, debit, credit)
      VALUES (gen_random_uuid()::text, $1, $2, $3, $4, 0)
    `, [jeResult.rows[0].id, persediaanCOA.rows[0].id, `Persediaan ${soNo}`, totalValue]);

    await client.query(`
      INSERT INTO journal_details (id, je_id, coa_id, description, debit, credit)
      VALUES (gen_random_uuid()::text, $1, $2, $3, 0, $4)
    `, [jeResult.rows[0].id, hutangCOA.rows[0].id, `Hutang Pembelian ${soNo}`, totalValue]);

    console.log(`\n📄 JE/260730/0004 — Stock Order ${soNo}`);
    jeDetails.forEach(d => console.log(d));
    console.log(`  → Hutang Usaha: K Rp ${totalValue.toLocaleString('id-ID')}`);

    // Final verify
    console.log('\n=== ALL JOURNALS ===');
    const journals = await client.query(`
      SELECT je.je_no, je.description, je.ref_type,
             json_agg(json_build_object('coa', c.code || ' ' || c.name, 'debit', jd.debit, 'credit', jd.credit)) as lines
      FROM journal_entries je
      JOIN journal_details jd ON jd.je_id = je.id
      JOIN coa c ON c.id = jd.coa_id
      GROUP BY je.id, je.je_no, je.description, je.ref_type
      ORDER BY je.date DESC
    `);
    for (const j of journals.rows) {
      console.log(`\n📄 ${j.je_no} | ${j.ref_type}`);
      console.log(`   ${j.description}`);
      for (const line of j.lines) {
        const d = line.debit > 0 ? `D Rp ${Number(line.debit).toLocaleString('id-ID')}` : '';
        const k = line.credit > 0 ? `K Rp ${Number(line.credit).toLocaleString('id-ID')}` : '';
        console.log(`   → ${line.coa}: ${d || k}`);
      }
    }
  } finally {
    client.release();
  }
}

main().catch(e => console.error('ERROR:', e.message)).finally(() => pool.end());
