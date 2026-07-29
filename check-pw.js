const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function run() {
  const client = new Client({ host: '127.0.0.1', port: 5432, user: 'postgres', password: '', database: 'pwncorp_erp' });
  await client.connect();
  const res = await client.query("SELECT u.email, u.password_hash, u.name FROM users u WHERE u.email = 'admin@pwncorp.co.id'");
  if (res.rows.length === 0) {
    console.log('USER NOT FOUND');
  } else {
    const row = res.rows[0];
    console.log('Email:', row.email);
    console.log('Name:', row.name);
    console.log('Hash:', row.password_hash);
    const isValid = await bcrypt.compare('password123', row.password_hash);
    console.log('password123 valid:', isValid);
  }
  await client.end();
}
run().catch(e => console.error('Error:', e.message));
