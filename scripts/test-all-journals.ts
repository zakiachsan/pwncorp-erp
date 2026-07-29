import pg from 'pg';
const pool = new pg.Pool({ host: '127.0.0.1', port: 5432, database: 'pwncorp_erp', user: 'postgres' });

async function main() {
  const client = await pool.connect();
  try {
    const user = await client.query("SELECT id, store_id FROM users WHERE email = 'admin@pwncorp.co.id'");
    const uid = user.rows[0].id;
    const sid = user.rows[0].store_id;
    const sp = await client.query("SELECT id, name, buy_price, stock_qty FROM spareparts WHERE buy_price > 0 LIMIT 3");
    const sp1 = sp.rows[0], sp2 = sp.rows[1], sp3 = sp.rows[2];
    console.log(`Using spareparts: ${sp1.name} (Rp${sp1.buy_price}, stock:${sp1.stock_qty}), ${sp2.name} (Rp${sp2.buy_price}), ${sp3.name} (Rp${sp3.buy_price})`);

    // ============================================================
    // 1. STOCK RETURN → Confirm
    // ============================================================
    console.log('\n=== 1. STOCK RETURN ===');
    const srResult = await client.query(`
      INSERT INTO stock_returns (id, return_no, store_id, warehouse, reason, status, date, created_at)
      VALUES (gen_random_uuid()::text, 'SRT/WM/2607010', $1, 'Gudang Utama', 'Retur barang rusak', 'Draft', NOW(), NOW())
      RETURNING id, return_no
    `, [sid]);
    const srId = srResult.rows[0].id;
    const srNo = srResult.rows[0].return_no;
    console.log(`Created: ${srNo}`);

    await client.query(`INSERT INTO stock_return_items (id, stock_return_id, sparepart_id, qty) VALUES (gen_random_uuid()::text, $1, $2, 3)`, [srId, sp1.id]);
    console.log(`  + ${sp1.name} x3`);

    // Confirm
    await client.query(`UPDATE stock_returns SET status = 'Confirmed' WHERE id = $1`, [srId]);
    console.log(`  → Confirmed`);

    // Deduct stock
    await client.query(`UPDATE spareparts SET stock_qty = stock_qty - 3 WHERE id = $1`, [sp1.id]);

    // Journal: Hutang (D) vs Persediaan (K)
    const srTotal = sp1.buy_price * 3;
    const hutangCOA = (await client.query("SELECT id FROM coa WHERE code = '2100'")).rows[0];
    const persediaanCOA = (await client.query("SELECT id FROM coa WHERE code = '1300'")).rows[0];
    const srJE = (await client.query(`
      INSERT INTO journal_entries (id, je_no, date, description, ref_type, ref_id, store_id, status, created_by_id, created_at)
      VALUES (gen_random_uuid()::text, 'JE/260730/0010', NOW(), $1, 'stock_return', $2, $3, 'Posted', $4, NOW())
      RETURNING id
    `, [`Stock Return ${srNo} dikonfirmasi`, srId, sid, uid])).rows[0];
    await client.query(`INSERT INTO journal_details (id, je_id, coa_id, description, debit, credit) VALUES (gen_random_uuid()::text, $1, $2, $3, $4, 0)`, [srJE.id, hutangCOA.id, `Hutang Retur ${sp1.name} x3`, srTotal]);
    await client.query(`INSERT INTO journal_details (id, je_id, coa_id, description, debit, credit) VALUES (gen_random_uuid()::text, $1, $2, $3, 0, $4)`, [srJE.id, persediaanCOA.id, `Persediaan Retur ${srNo}`, srTotal]);
    console.log(`  Journal JE/260730/0010: Hutang D Rp${srTotal.toLocaleString('id-ID')} / Persediaan K Rp${srTotal.toLocaleString('id-ID')}`);

    // ============================================================
    // 2. PURCHASE RETURN → Complete
    // ============================================================
    console.log('\n=== 2. PURCHASE RETURN ===');
    // Need a PO first
    const supplier = (await client.query("SELECT id FROM suppliers LIMIT 1")).rows[0];
    const po = (await client.query(`
      INSERT INTO purchase_orders (id, po_no, supplier_id, store_id, status, total, date, created_at)
      VALUES (gen_random_uuid()::text, 'PO/WM/2607010', $1, $2, 'RECEIVED', 0, NOW(), NOW())
      RETURNING id, po_no
    `, [supplier.id, sid])).rows[0];
    console.log(`Created PO: ${po.po_no}`);

    const prResult = await client.query(`
      INSERT INTO purchase_returns (id, doc_no, po_id, supplier_id, return_type, total, status, date, created_at)
      VALUES (gen_random_uuid()::text, 'PR/WM/2607010', $1, $2, 'Return', 0, 'Approved', NOW(), NOW())
      RETURNING id, doc_no
    `, [po.id, supplier.id]);
    const prId = prResult.rows[0].id;
    const prNo = prResult.rows[0].doc_no;
    console.log(`Created: ${prNo}`);

    const prItemTotal = sp2.buy_price * 2;
    await client.query(`INSERT INTO return_items (id, return_id, sparepart_id, qty, unit_price, total) VALUES (gen_random_uuid()::text, $1, $2, 2, $3, $4)`, [prId, sp2.id, sp2.buy_price, prItemTotal]);
    await client.query(`UPDATE purchase_returns SET total = $1 WHERE id = $2`, [prItemTotal, prId]);
    console.log(`  + ${sp2.name} x2 @ Rp${sp2.buy_price.toLocaleString('id-ID')}`);

    // Complete → deduct stock
    await client.query(`UPDATE purchase_returns SET status = 'Completed' WHERE id = $1`, [prId]);
    await client.query(`UPDATE spareparts SET stock_qty = stock_qty - 2 WHERE id = $1`, [sp2.id]);
    console.log(`  → Completed`);

    // Journal: Hutang (D) vs Persediaan (K)
    const prStoreId = (await client.query("SELECT store_id FROM purchase_orders WHERE id = $1", [po.id])).rows[0]?.store_id || sid;
    const prJE = (await client.query(`
      INSERT INTO journal_entries (id, je_no, date, description, ref_type, ref_id, store_id, status, created_by_id, created_at)
      VALUES (gen_random_uuid()::text, 'JE/260730/0011', NOW(), $1, 'purchase_return', $2, $3, 'Posted', $4, NOW())
      RETURNING id
    `, [`Purchase Return ${prNo} selesai`, prId, prStoreId, uid])).rows[0];
    await client.query(`INSERT INTO journal_details (id, je_id, coa_id, description, debit, credit) VALUES (gen_random_uuid()::text, $1, $2, $3, $4, 0)`, [prJE.id, hutangCOA.id, `Hutang Retur ${sp2.name} x2`, prItemTotal]);
    await client.query(`INSERT INTO journal_details (id, je_id, coa_id, description, debit, credit) VALUES (gen_random_uuid()::text, $1, $2, $3, 0, $4)`, [prJE.id, persediaanCOA.id, `Persediaan Retur ${prNo}`, prItemTotal]);
    console.log(`  Journal JE/260730/0011: Hutang D Rp${prItemTotal.toLocaleString('id-ID')} / Persediaan K Rp${prItemTotal.toLocaleString('id-ID')}`);

    // ============================================================
    // 3. STOCK TRANSFER → Receive
    // ============================================================
    console.log('\n=== 3. STOCK TRANSFER ===');
    const trResult = await client.query(`
      INSERT INTO stock_transfers (id, transfer_no, store_id, from_warehouse, to_store, status, date, created_at)
      VALUES (gen_random_uuid()::text, 'TRF/WM/2607010', $1, 'Gudang Utama', 'Gudang Cabang', 'Approved', NOW(), NOW())
      RETURNING id, transfer_no
    `, [sid]);
    const trId = trResult.rows[0].id;
    const trNo = trResult.rows[0].transfer_no;
    console.log(`Created: ${trNo}`);

    const trQty = 5;
    await client.query(`INSERT INTO transfer_items (id, transfer_id, sparepart_id, qty) VALUES (gen_random_uuid()::text, $1, $2, $3)`, [trId, sp3.id, trQty]);
    console.log(`  + ${sp3.name} x${trQty}`);

    // Receive → deduct stock from source
    await client.query(`UPDATE stock_transfers SET status = 'Received' WHERE id = $1`, [trId]);
    await client.query(`UPDATE spareparts SET stock_qty = stock_qty - $1 WHERE id = $2`, [trQty, sp3.id]);
    console.log(`  → Received`);

    // Journal: Persediaan Masuk (D) vs Persediaan Keluar (K)
    const trTotal = sp3.buy_price * trQty;
    const trJE = (await client.query(`
      INSERT INTO journal_entries (id, je_no, date, description, ref_type, ref_id, store_id, status, created_by_id, created_at)
      VALUES (gen_random_uuid()::text, 'JE/260730/0012', NOW(), $1, 'stock_transfer', $2, $3, 'Posted', $4, NOW())
      RETURNING id
    `, [`Stock Transfer ${trNo} diterima`, trId, sid, uid])).rows[0];
    await client.query(`INSERT INTO journal_details (id, je_id, coa_id, description, debit, credit) VALUES (gen_random_uuid()::text, $1, $2, $3, $4, 0)`, [trJE.id, persediaanCOA.id, `Persediaan Masuk ${sp3.name} x${trQty}`, trTotal]);
    await client.query(`INSERT INTO journal_details (id, je_id, coa_id, description, debit, credit) VALUES (gen_random_uuid()::text, $1, $2, $3, 0, $4)`, [trJE.id, persediaanCOA.id, `Persediaan Keluar ${trNo}`, trTotal]);
    console.log(`  Journal JE/260730/0012: Persediaan Masuk D Rp${trTotal.toLocaleString('id-ID')} / Persediaan Keluar K Rp${trTotal.toLocaleString('id-ID')}`);

    // ============================================================
    // 4. STOCK OPNAME → Approve
    // ============================================================
    console.log('\n=== 4. STOCK OPNAME ===');
    const soResult = await client.query(`
      INSERT INTO stock_opnames (id, ref_code, store_id, warehouse, description, status, date, created_at)
      VALUES (gen_random_uuid()::text, 'OPN/WM/2607010', $1, 'Gudang Utama', 'Opname bulanan', 'Completed', NOW(), NOW())
      RETURNING id, ref_code
    `, [sid]);
    const soId = soResult.rows[0].id;
    const soCode = soResult.rows[0].ref_code;
    console.log(`Created: ${soCode}`);

    // System qty vs Physical qty — surplus 2, deficit 1
    const curStock1 = (await client.query("SELECT stock_qty FROM spareparts WHERE id = $1", [sp1.id])).rows[0].stock_qty;
    const curStock2 = (await client.query("SELECT stock_qty FROM spareparts WHERE id = $1", [sp2.id])).rows[0].stock_qty;
    await client.query(`INSERT INTO opname_items (id, opname_id, sparepart_id, system_qty, physical_qty, adjustment, reason) VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, 'Lebih')`, [soId, sp1.id, curStock1, curStock1 + 2, 2]);
    await client.query(`INSERT INTO opname_items (id, opname_id, sparepart_id, system_qty, physical_qty, adjustment, reason) VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, 'Kurang')`, [soId, sp2.id, curStock2, curStock2 - 1, -1]);
    console.log(`  + ${sp1.name}: system ${curStock1} → physical ${curStock1 + 2} (surplus +2)`);
    console.log(`  + ${sp2.name}: system ${curStock2} → physical ${curStock2 - 1} (deficit -1)`);

    // Approve → apply adjustments
    await client.query(`UPDATE spareparts SET stock_qty = stock_qty + 2 WHERE id = $1`, [sp1.id]);
    await client.query(`UPDATE spareparts SET stock_qty = stock_qty - 1 WHERE id = $1`, [sp2.id]);
    await client.query(`UPDATE stock_opnames SET status = 'Approved' WHERE id = $1`, [soId]);
    console.log(`  → Approved`);

    // Journal
    const surplusVal = sp1.buy_price * 2;
    const deficitVal = sp2.buy_price * 1;
    const hppCOA = (await client.query("SELECT id FROM coa WHERE code = '5100'")).rows[0];
    const pendapatanCOA = (await client.query("SELECT id FROM coa WHERE code = '4200'")).rows[0];
    const soJE = (await client.query(`
      INSERT INTO journal_entries (id, je_no, date, description, ref_type, ref_id, store_id, status, created_by_id, created_at)
      VALUES (gen_random_uuid()::text, 'JE/260730/0013', NOW(), $1, 'stock_opname', $2, $3, 'Posted', $4, NOW())
      RETURNING id
    `, [`Stock Opname ${soCode} disetujui`, soId, sid, uid])).rows[0];

    // Surplus: Persediaan (D) vs Pendapatan (K)
    await client.query(`INSERT INTO journal_details (id, je_id, coa_id, description, debit, credit) VALUES (gen_random_uuid()::text, $1, $2, $3, $4, 0)`, [soJE.id, persediaanCOA.id, `Surplus ${sp1.name} x2`, surplusVal]);
    await client.query(`INSERT INTO journal_details (id, je_id, coa_id, description, debit, credit) VALUES (gen_random_uuid()::text, $1, $2, $3, 0, $4)`, [soJE.id, pendapatanCOA.id, `Surplus Opname ${soCode}`, surplusVal]);
    // Deficit: HPP (D) vs Persediaan (K)
    await client.query(`INSERT INTO journal_details (id, je_id, coa_id, description, debit, credit) VALUES (gen_random_uuid()::text, $1, $2, $3, $4, 0)`, [soJE.id, hppCOA.id, `Defisit ${sp2.name} x1`, deficitVal]);
    await client.query(`INSERT INTO journal_details (id, je_id, coa_id, description, debit, credit) VALUES (gen_random_uuid()::text, $1, $2, $3, 0, $4)`, [soJE.id, persediaanCOA.id, `Defisit Opname ${soCode}`, deficitVal]);
    console.log(`  Journal JE/260730/0013:`);
    console.log(`    Surplus: Persediaan D Rp${surplusVal.toLocaleString('id-ID')} / Pendapatan K Rp${surplusVal.toLocaleString('id-ID')}`);
    console.log(`    Defisit: HPP D Rp${deficitVal.toLocaleString('id-ID')} / Persediaan K Rp${deficitVal.toLocaleString('id-ID')}`);

    // ============================================================
    // FINAL VERIFY
    // ============================================================
    console.log('\n========================================');
    console.log('=== ALL JOURNAL ENTRIES (8 total) ===');
    console.log('========================================');
    const all = await client.query(`
      SELECT je.je_no, je.description, je.ref_type,
             json_agg(json_build_object('coa', c.code || ' ' || c.name, 'debit', jd.debit, 'credit', jd.credit) ORDER BY jd.debit DESC) as lines
      FROM journal_entries je
      JOIN journal_details jd ON jd.je_id = je.id
      JOIN coa c ON c.id = jd.coa_id
      GROUP BY je.id, je.je_no, je.description, je.ref_type
      ORDER BY je.date ASC
    `);
    for (const j of all.rows) {
      console.log(`\n📄 ${j.je_no} | ${j.ref_type}`);
      console.log(`   ${j.description}`);
      for (const line of j.lines) {
        const d = line.debit > 0 ? `D Rp ${Number(line.debit).toLocaleString('id-ID')}` : '';
        const k = line.credit > 0 ? `K Rp ${Number(line.credit).toLocaleString('id-ID')}` : '';
        console.log(`   → ${line.coa}: ${d || k}`);
      }
    }

    // Balance check
    const totals = await client.query(`
      SELECT SUM(jd.debit) as total_debit, SUM(jd.credit) as total_credit FROM journal_details jd
    `);
    console.log(`\n=== BALANCE CHECK ===`);
    console.log(`Total Debit:  Rp ${Number(totals.rows[0].total_debit).toLocaleString('id-ID')}`);
    console.log(`Total Credit: Rp ${Number(totals.rows[0].total_credit).toLocaleString('id-ID')}`);
    console.log(`Balance: ${Number(totals.rows[0].total_debit) === Number(totals.rows[0].total_credit) ? '✅ BALANCED' : '❌ IMBALANCED'}`);

  } finally {
    client.release();
  }
}

main().catch(e => console.error('ERROR:', e.message)).finally(() => pool.end());
