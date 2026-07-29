import pg from 'pg';
import http from 'http';

const pool = new pg.Pool({ host: '127.0.0.1', port: 5432, database: 'pwncorp_erp', user: 'postgres' });

// Helper to get session cookie via NextAuth
async function login(): Promise<string> {
  return new Promise((resolve, reject) => {
    // Step 1: Get CSRF
    http.get('http://localhost:3000/api/auth/csrf', (res) => {
      let data = '';
      let cookies = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        cookies = res.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ') || '';
        const csrfToken = JSON.parse(data).csrfToken;
        
        // Step 2: Login
        const postData = new URLSearchParams({
          email: 'admin@pwncorp.co.id',
          password: 'password123',
          csrfToken,
          callbackUrl: 'http://localhost:3000/dashboard',
          json: 'true',
        }).toString();
        
        const loginReq = http.request('http://localhost:3000/api/auth/callback/credentials', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookies,
          },
        }, (loginRes) => {
          let loginData = '';
          let loginCookies = loginRes.headers['set-cookie'] || [];
          loginRes.on('data', chunk => loginData += chunk);
          loginRes.on('end', () => {
            const allCookies = [...cookies.split('; '), ...loginCookies.map(c => c.split(';')[0])].join('; ');
            console.log('Login response:', loginData.slice(0, 200));
            console.log('Cookies:', allCookies.slice(0, 200));
            resolve(allCookies);
          });
        });
        loginReq.write(postData);
        loginReq.end();
      });
    }).on('error', reject);
  });
}

async function main() {
  const client = await pool.connect();
  try {
    // Step 1: Complete WO SWO/WM/2607003
    console.log('\n=== STEP 1: Complete WO SWO/WM/2607003 ===');
    const wo = await client.query("SELECT id, wo_no, status FROM work_orders WHERE wo_no = 'SWO/WM/2607003'");
    if (wo.rows.length === 0) { console.log('WO not found'); return; }
    console.log('WO:', wo.rows[0]);
    
    // Update WO to COMPLETED
    await client.query("UPDATE work_orders SET status = 'COMPLETED' WHERE wo_no = 'SWO/WM/2607003'");
    console.log('WO status → COMPLETED');
    
    // Step 2: Create Invoice
    console.log('\n=== STEP 2: Create Invoice ===');
    const userId = await client.query("SELECT id FROM users WHERE email = 'admin@pwncorp.co.id'");
    const storeId = await client.query("SELECT store_id FROM users WHERE email = 'admin@pwncorp.co.id'");
    const user = userId.rows[0];
    const store = storeId.rows[0];
    
    const invNo = 'SRI/WM/2607001';
    const woId = wo.rows[0].id;
    
    // Get WO items
    const woItems = await client.query('SELECT * FROM wo_items WHERE wo_id = $1', [woId]);
    console.log('WO items:', woItems.rows.length);
    
    const total = woItems.rows.reduce((s: number, r: any) => s + (r.total || 0), 0);
    console.log('Total:', total);
    
    // Get customer
    const soData = await client.query('SELECT so.customer_id FROM work_orders wo JOIN service_orders so ON wo.so_id = so.id WHERE wo.id = $1', [woId]);
    const customerId = soData.rows[0]?.customer_id;
    console.log('Customer ID:', customerId);
    
    // Insert invoice
    const invResult = await client.query(`
      INSERT INTO invoices (id, inv_no, wo_id, customer_id, store_id, status, total, amount_paid, amount_due, invoice_date, due_date, created_at)
      VALUES (gen_random_uuid()::text, $1, $2, $3, $4, 'UNPAID', $5, 0, $5, NOW(), NOW() + INTERVAL '30 days', NOW())
      RETURNING id, inv_no
    `, [invNo, woId, customerId, store.store_id, total]);
    const inv = invResult.rows[0];
    console.log('Invoice created:', inv.inv_no, 'ID:', inv.id);
    
    // Insert invoice items
    for (const item of woItems.rows) {
      await client.query(`
        INSERT INTO invoice_items (id, invoice_id, item, description, qty, unit_price, total)
        VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6)
      `, [inv.id, item.item_name, item.item_type === 'sparepart' ? 'Sparepart' : 'Jasa', item.qty, item.unit_price, item.total]);
    }
    console.log('Invoice items inserted');
    
    // Step 3: Create journal entry for invoice (manual)
    console.log('\n=== STEP 3: Create Invoice Journal ===');
    const piutangCOA = await client.query("SELECT id FROM coa WHERE code = '1200'");
    const jasaCOA = await client.query("SELECT id FROM coa WHERE code = '4100'");
    const sparepartCOA = await client.query("SELECT id FROM coa WHERE code = '4200'");
    
    if (piutangCOA.rows.length === 0 || jasaCOA.rows.length === 0) {
      console.log('COA not found!');
      return;
    }
    
    const sparepartTotal = woItems.rows.filter((i: any) => i.item_type === 'sparepart').reduce((s: number, i: any) => s + (i.total || 0), 0);
    const serviceTotal = woItems.rows.filter((i: any) => i.item_type !== 'sparepart').reduce((s: number, i: any) => s + (i.total || 0), 0);
    console.log('Service total:', serviceTotal, 'Sparepart total:', sparepartTotal);
    
    const jeNo = 'JE/260730/0001';
    const jeResult = await client.query(`
      INSERT INTO journal_entries (id, je_no, date, description, ref_type, ref_id, store_id, status, created_by_id, created_at)
      VALUES (gen_random_uuid()::text, $1, NOW(), $2, 'invoice', $3, $4, 'Posted', $5, NOW())
      RETURNING id
    `, [jeNo, `Invoice ${invNo}`, inv.id, store.store_id, user.id]);
    const jeId = jeResult.rows[0].id;
    console.log('Journal entry created:', jeNo, 'ID:', jeId);
    
    // Insert journal details
    await client.query(`
      INSERT INTO journal_details (id, je_id, coa_id, description, debit, credit)
      VALUES (gen_random_uuid()::text, $1, $2, $3, $4, 0)
    `, [jeId, piutangCOA.rows[0].id, `Piutang ${invNo}`, total]);
    
    if (serviceTotal > 0) {
      await client.query(`
        INSERT INTO journal_details (id, je_id, coa_id, description, debit, credit)
        VALUES (gen_random_uuid()::text, $1, $2, $3, 0, $4)
      `, [jeId, jasaCOA.rows[0].id, `Pendapatan Jasa ${invNo}`, serviceTotal]);
    }
    if (sparepartTotal > 0 && sparepartCOA.rows.length > 0) {
      await client.query(`
        INSERT INTO journal_details (id, je_id, coa_id, description, debit, credit)
        VALUES (gen_random_uuid()::text, $1, $2, $3, 0, $4)
      `, [jeId, sparepartCOA.rows[0].id, `Pendapatan Sparepart ${invNo}`, sparepartTotal]);
    }
    console.log('Journal details inserted');
    
    // Step 4: Create payment
    console.log('\n=== STEP 4: Create Payment ===');
    const payResult = await client.query(`
      INSERT INTO payments (id, invoice_id, amount, payment_date, payment_method, created_at)
      VALUES (gen_random_uuid()::text, $1, $2, NOW(), 'cash', NOW())
      RETURNING id
    `, [inv.id, total]);
    const payment = payResult.rows[0];
    console.log('Payment created, amount:', total);
    
    // Update invoice
    await client.query("UPDATE invoices SET status = 'PAID', amount_paid = $1, amount_due = 0 WHERE id = $2", [total, inv.id]);
    console.log('Invoice status → PAID');
    
    // Step 5: Create payment journal
    console.log('\n=== STEP 5: Create Payment Journal ===');
    const kasCOA = await client.query("SELECT id FROM coa WHERE code = '1110'");
    if (kasCOA.rows.length === 0) { console.log('Kas COA not found'); return; }
    
    const jeNo2 = 'JE/260730/0002';
    const je2Result = await client.query(`
      INSERT INTO journal_entries (id, je_no, date, description, ref_type, ref_id, store_id, status, created_by_id, created_at)
      VALUES (gen_random_uuid()::text, $1, NOW(), $2, 'payment', $3, $4, 'Posted', $5, NOW())
      RETURNING id
    `, [jeNo2, `Pembayaran invoice ${invNo} - Customer`, payment.id, store.store_id, user.id]);
    const je2Id = je2Result.rows[0].id;
    
    await client.query(`
      INSERT INTO journal_details (id, je_id, coa_id, description, debit, credit)
      VALUES (gen_random_uuid()::text, $1, $2, $3, $4, 0)
    `, [je2Id, kasCOA.rows[0].id, `Penerimaan ${invNo}`, total]);
    
    await client.query(`
      INSERT INTO journal_details (id, je_id, coa_id, description, debit, credit)
      VALUES (gen_random_uuid()::text, $1, $2, $3, 0, $4)
    `, [je2Id, piutangCOA.rows[0].id, `Pelunasan Piutang ${invNo}`, total]);
    console.log('Payment journal created:', jeNo2);
    
    // Step 6: Verify all journals
    console.log('\n=== STEP 6: VERIFY ALL JOURNALS ===');
    const journals = await client.query(`
      SELECT je.je_no, je.description, je.ref_type, je.status,
             json_agg(json_build_object('coa', c.code || ' ' || c.name, 'debit', jd.debit, 'credit', jd.credit)) as lines
      FROM journal_entries je
      JOIN journal_details jd ON jd.je_id = je.id
      JOIN coa c ON c.id = jd.coa_id
      GROUP BY je.id, je.je_no, je.description, je.ref_type, je.status
      ORDER BY je.date DESC
    `);
    
    for (const j of journals.rows) {
      console.log(`\n📄 ${j.je_no} | ${j.ref_type} | ${j.status}`);
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
