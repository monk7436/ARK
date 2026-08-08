const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET all live dashboard statistics calculated directly from PostgreSQL
router.get('/stats', async (req, res) => {
  try {
    // 1. Material Balances
    const goldInRes = await pool.query(
      "SELECT COALESCE(SUM(gold_weight), 0) as total FROM materials WHERE material_type = 'gold' AND direction = 'INWARD'"
    );
    const goldOutRes = await pool.query(
      "SELECT COALESCE(SUM(gold_weight), 0) as total FROM materials WHERE material_type = 'gold' AND direction = 'OUTWARD'"
    );

    const diamondInRes = await pool.query(
      "SELECT COALESCE(SUM(d.weight_ct), 0) as total FROM material_diamond_items d JOIN materials m ON d.material_entry_id = m.id WHERE m.direction = 'INWARD'"
    );
    const diamondOutRes = await pool.query(
      "SELECT COALESCE(SUM(d.weight_ct), 0) as total FROM material_diamond_items d JOIN materials m ON d.material_entry_id = m.id WHERE m.direction = 'OUTWARD'"
    );

    const gemstoneInRes = await pool.query(
      "SELECT COALESCE(SUM(g.weight), 0) as total FROM material_gemstone_items g JOIN materials m ON g.material_entry_id = m.id WHERE m.direction = 'INWARD'"
    );
    const gemstoneOutRes = await pool.query(
      "SELECT COALESCE(SUM(g.weight), 0) as total FROM material_gemstone_items g JOIN materials m ON g.material_entry_id = m.id WHERE m.direction = 'OUTWARD'"
    );

    // 2. Counts
    const mfgCountRes = await pool.query('SELECT COUNT(*) as count FROM manufacturers');
    const custCountRes = await pool.query('SELECT COUNT(*) as count FROM customers');
    const jobCountRes = await pool.query('SELECT COUNT(*) as count, COUNT(*) FILTER (WHERE status != \'Completed\') as active_count FROM jobs');
    const invCountRes = await pool.query('SELECT COUNT(*) as count, COALESCE(SUM(net_weight), 0) as total_net_weight FROM inventory WHERE status = \'IN_STOCK\'');
    const matCountRes = await pool.query('SELECT COUNT(*) as count FROM materials');

    // 3. Recent Transactions (Actual records only)
    const recentMatRes = await pool.query('SELECT * FROM materials ORDER BY timestamp DESC LIMIT 8');
    const recentJobsRes = await pool.query('SELECT * FROM jobs ORDER BY created_at DESC LIMIT 5');

    const goldIn = parseFloat(goldInRes.rows[0]?.total || 0);
    const goldOut = parseFloat(goldOutRes.rows[0]?.total || 0);

    const diamondIn = parseFloat(diamondInRes.rows[0]?.total || 0);
    const diamondOut = parseFloat(diamondOutRes.rows[0]?.total || 0);

    const gemstoneIn = parseFloat(gemstoneInRes.rows[0]?.total || 0);
    const gemstoneOut = parseFloat(gemstoneOutRes.rows[0]?.total || 0);

    res.json({
      liveRates: {
        gold24K: 7200,
        gold22K: 6850,
        silver: 88
      },
      counts: {
        materials: parseInt(matCountRes.rows[0]?.count || 0),
        jobs: parseInt(jobCountRes.rows[0]?.count || 0),
        activeJobs: parseInt(jobCountRes.rows[0]?.active_count || 0),
        manufacturers: parseInt(mfgCountRes.rows[0]?.count || 0),
        customers: parseInt(custCountRes.rows[0]?.count || 0),
        inventory: parseInt(invCountRes.rows[0]?.count || 0),
        inventoryNetWeight: parseFloat(invCountRes.rows[0]?.total_net_weight || 0)
      },
      balances: {
        goldIn,
        goldOut,
        goldRemaining: Math.max(0, goldIn - goldOut),
        diamondIn,
        diamondOut,
        diamondAvailable: Math.max(0, diamondIn - diamondOut),
        gemstoneIn,
        gemstoneOut,
        gemstoneAvailable: Math.max(0, gemstoneIn - gemstoneOut)
      },
      recentMaterials: recentMatRes.rows,
      recentJobs: recentJobsRes.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET recent actual business transactions
router.get('/transactions/recent', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM materials ORDER BY timestamp DESC LIMIT 20');
    res.json({ transactions: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
