
const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres@127.0.0.1:5432/pwncorp_erp' });
(async () => {
  await client.connect();
  const res = await client.query("UPDATE \"WorkOrder\" SET status = 'Revised' WHERE \"woNo\" = 'SWO/WM/2607001' RETURNING status");
  console.log('WO status reverted to:', res.rows[0]?.status);
  await client.end();
})();

