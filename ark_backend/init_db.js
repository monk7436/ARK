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
    console.log('✅ Tables created successfully: users, customers, materials, manufacturers, inventory, invoices.');

    // Seed default admin user if not existing
    const userCheck = await client.query('SELECT * FROM users WHERE email = $1', ['admin@ark.com']);
    if (userCheck.rows.length === 0) {
      await client.query(
        `INSERT INTO users (email, password_hash, name, role) 
         VALUES ($1, $2, $3, $4)`,
        ['admin@ark.com', '$2a$10$X87S1Qk2p2tQe798LpPzU.Fq8y49sH1wJq2h5zJ2G1y1s1v1w1w1a', 'Store Owner', 'OWNER']
      );
      console.log('👤 Created default admin user.');
    }

    // Seed sample customers
    const custCheck = await client.query('SELECT * FROM customers');
    if (custCheck.rows.length === 0) {
      await client.query(
        `INSERT INTO customers (name, company_name, phone, gstin, address)
         VALUES 
         ('Vikram Shah (Owner)', 'Royal Swarn Jewellers Pvt Ltd', '+91 98765 43210', '27AAAAA0000A1Z5', 'Shop 14, Zaveri Bazaar, Mumbai, MH'),
         ('Rajesh Kalyan (Partner)', 'Kalyan Partner Store', '+91 98111 22334', '07BBBBB1111B2Z8', 'Johri Bazaar, Jaipur, RJ')`
      );
      console.log('👥 Seeded sample Customer profiles.');
    }

    console.log('🎉 Neon PostgreSQL initialization COMPLETE!');
  } catch (err) {
    console.error('❌ Error initializing database:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

initializeDatabase();
