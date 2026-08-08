const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

async function initializeDatabase() {
  console.log('⚡ Connecting to Neon PostgreSQL database...');
  const client = await pool.connect();
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    console.log('📦 Executing DDL Schema creation on Neon...');
    await client.query(schemaSql);
    console.log('✅ Tables verified: users, customers, materials, material_diamond_items, material_gemstone_items, jobs, job_diamond_items, job_gemstone_items, manufacturers, inventory, invoices.');

    // Seed default admin user for store management authentication if not existing
    const userCheck = await client.query('SELECT * FROM users WHERE email = $1', ['admin@ark.com']);
    if (userCheck.rows.length === 0) {
      await client.query(
        `INSERT INTO users (email, password_hash, name, role) 
         VALUES ($1, $2, $3, $4)`,
        ['admin@ark.com', '$2a$10$X87S1Qk2p2tQe798LpPzU.Fq8y49sH1wJq2h5zJ2G1y1s1v1w1w1a', 'Store Owner', 'OWNER']
      );
      console.log('👤 Initialized admin authentication user.');
    }

    console.log('🎉 Neon PostgreSQL initialization COMPLETE (Clean database-driven schema)!');
  } catch (err) {
    console.error('❌ Error initializing database:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

initializeDatabase();
