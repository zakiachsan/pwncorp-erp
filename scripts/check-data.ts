import pg from 'pg';
const pool = new pg.Pool({ host: '127.0.0.1', port: 5432, database: 'pwncorp_erp', user: 'postgres' });
async function main() {
  const client = await pool.connect();
  const wo = await client.query("SELECT id, wo_no, status FROM work_orders WHERE status = 'COMPLETED' LIMIT 5");
  console.log('Completed WOs:', JSON.stringify(wo.rows));
  const woAny = await client.query("SELECT id, wo_no, status FROM work_orders LIMIT 10");
  console.log('All WOs:', JSON.stringify(woAny.rows));
  const inv = await client.query('SELECT id, inv_no, status, total FROM invoices LIMIT 5');
  console.log('Invoices:', JSON.stringify(inv.rows));
  client.release();
}
main().catch(e => console.error(e.message)).finally(() => pool.end());
