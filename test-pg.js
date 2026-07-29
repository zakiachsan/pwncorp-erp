const { Client } = require('pg');

async function test(user, password, database) {
  const client = new Client({ host: '127.0.0.1', port: 5432, user, password, database });
  try {
    await client.connect();
    console.log(`Connected with ${user}@${database}`);
    const dbs = await client.query("SELECT datname FROM pg_database WHERE datistemplate = false");
    console.log('Databases:', dbs.rows.map(r => r.datname));
    const users = await client.query("SELECT usename FROM pg_user");
    console.log('Users:', users.rows.map(r => r.usename));
    await client.end();
    return true;
  } catch(e) {
    console.log(`Failed ${user}@${database}: ${e.message}`);
    return false;
  }
}

(async () => {
  // Try common PG credentials
  await test('postgres', 'postgres', 'postgres');
  await test('postgres', '', 'postgres');
  await test('postgres', 'password', 'postgres');
})();
