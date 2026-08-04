const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/ark_db';

const isProduction = connectionString.includes('neon.tech') || connectionString.includes('rds.amazonaws.com') || connectionString.includes('supabase');

const pool = new Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

// Fallback in-memory DB store if database is initializing
const inMemoryStore = {
  users: [
    {
      id: 'usr-1',
      email: 'admin@ark.com',
      passwordHash: '$2a$10$X87S1Qk2p2tQe798LpPzU.Fq8y49sH1wJq2h5zJ2G1y1s1v1w1w1a', // 'admin123'
      name: 'Store Owner',
      role: 'OWNER'
    }
  ],
  materials: [
    {
      id: 'tx-101',
      timestamp: '04/08/2026, 11:30 AM',
      direction: 'INWARD',
      materialType: 'gold',
      weight: 250.000,
      purity: '995 (24K)',
      vendorName: 'MMTC-PAMP Bullion Supplier',
      price: 7200,
      totalAmount: 1800000,
      photoUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=300'
    },
    {
      id: 'tx-102',
      timestamp: '04/08/2026, 12:15 PM',
      direction: 'OUTWARD',
      materialType: 'gold',
      weight: 45.000,
      purity: '995 (24K)',
      vendorName: 'Ramesh Artisan Workshop',
      manufacturerId: 'mfg-1',
      price: 7200,
      totalAmount: 324000,
      productType: 'Necklace',
      photoUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300'
    }
  ],
  manufacturers: [
    {
      id: 'mfg-1',
      name: 'Ramesh Artisan Workshop',
      office: 'Zaveri Bazaar, Mumbai',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
      jobsDone: 42,
      jobsOngoing: 3,
      goldRemaining: 110.500,
      makingCharge: 450
    },
    {
      id: 'mfg-2',
      name: 'Swarn Artistry',
      office: 'Johri Bazaar, Jaipur',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
      jobsDone: 88,
      jobsOngoing: 5,
      goldRemaining: 245.800,
      makingCharge: 400
    }
  ],
  inventory: [
    {
      id: 'inv-1',
      tagCode: 'ARK-RNG-1001',
      name: '22K Antique Royal Signet Ring',
      category: 'Ring',
      purityKarat: '22K (91.6%)',
      grossWeight: 14.200,
      stoneWeight: 0.200,
      netWeight: 14.000,
      fineWeight: 12.824,
      makingCharge: 450,
      status: 'IN_STOCK',
      photoUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300'
    }
  ],
  invoices: []
};

module.exports = {
  pool,
  inMemoryStore
};
