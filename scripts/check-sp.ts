import pg from 'pg';
const pool = new pg.Pool({ host: '127.0.0.1', port: 5432, database: 'pwncorp_erp', user: 'postgres' });
async function main() {
  const client = await pool.connect();
  const r = await client.query('SELECT sku, name, buy_price FROM spareparts');
  console.log(JSON.stringify(r.rows, null, 2));
  client.release();
}
main().finally(() => pool.end());
