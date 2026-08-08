const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/ark_db';

const isProduction = connectionString.includes('neon.tech') || connectionString.includes('rds.amazonaws.com') || connectionString.includes('supabase');

const pool = new Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('[POSTGRESQL POOL ERROR]', err.message);
});

module.exports = {
  pool
};
