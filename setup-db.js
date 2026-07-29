const { Client } = require('pg');

(async () => {
  const client = new Client({ host: '127.0.0.1', port: 5432, user: 'postgres', password: '', database: 'postgres' });
  await client.connect();

  // Check if pwncorp user exists
  const userCheck = await client.query("SELECT usename FROM pg_user WHERE usename = 'pwncorp'");
  if (userCheck.rows.length === 0) {
    console.log('Creating user pwncorp...');
    await client.query("CREATE USER pwncorp WITH PASSWORD 'pwncorp'");
    console.log('User pwncorp created');
  } else {
    console.log('User pwncorp already exists');
  }

  // Check if database exists
  const dbCheck = await client.query("SELECT datname FROM pg_database WHERE datname = 'pwncorp_erp'");
  if (dbCheck.rows.length === 0) {
    console.log('Creating database pwncorp_erp...');
    await client.query('CREATE DATABASE pwncorp_erp OWNER pwncorp');
    console.log('Database pwncorp_erp created');
  } else {
    console.log('Database pwncorp_erp already exists');
  }

  await client.end();
  console.log('Setup complete!');
})();
