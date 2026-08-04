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
    console.log('✅ Tables created successfully: users, materials, manufacturers, inventory, invoices.');

    // Seed default admin user if not existing
    const userCheck = await client.query('SELECT * FROM users WHERE email = $1', ['admin@ark.com']);
    if (userCheck.rows.length === 0) {
      await client.query(
        `INSERT INTO users (email, password_hash, name, role) 
         VALUES ($1, $2, $3, $4)`,
        ['admin@ark.com', '$2a$10$X87S1Qk2p2tQe798LpPzU.Fq8y49sH1wJq2h5zJ2G1y1s1v1w1w1a', 'Store Owner', 'OWNER']
      );
      console.log('👤 Created default admin user (admin@ark.com / admin123).');
    }

    // Seed sample manufacturers
    const mfgCheck = await client.query('SELECT * FROM manufacturers');
    if (mfgCheck.rows.length === 0) {
      await client.query(
        `INSERT INTO manufacturers (name, office, photo_url, jobs_done, jobs_ongoing, gold_remaining, making_charge)
         VALUES 
         ('Ramesh Artisan Workshop', 'Zaveri Bazaar, Mumbai', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300', 42, 3, 110.500, 450.00),
         ('Swarn Artistry', 'Johri Bazaar, Jaipur', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300', 88, 5, 245.800, 400.00)`
      );
      console.log('🏭 Seeded sample Manufacturer profiles.');
    }

    // Seed sample inventory
    const invCheck = await client.query('SELECT * FROM inventory');
    if (invCheck.rows.length === 0) {
      await client.query(
        `INSERT INTO inventory (tag_code, name, category, purity_karat, gross_weight, stone_weight, net_weight, fine_weight, making_charge, status, photo_url)
         VALUES 
         ('ARK-RNG-1001', '22K Antique Royal Signet Ring', 'Ring', '22K (91.6%)', 14.200, 0.200, 14.000, 12.824, 450.00, 'IN_STOCK', 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300'),
         ('ARK-NCK-1002', '22K Gold Choker Necklace', 'Necklace', '22K (91.6%)', 45.200, 3.200, 42.000, 38.472, 500.00, 'IN_STOCK', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300'),
         ('ARK-PND-2005', '22K Royal Solitaire Diamond Pendant', 'Pendant', '22K (91.6%)', 8.500, 0.500, 8.000, 7.328, 600.00, 'IN_STOCK', 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?w=300')`
      );
      console.log('💎 Seeded sample Inventory items.');
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
