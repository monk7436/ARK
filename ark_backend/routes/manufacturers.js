const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET all manufacturer profiles
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM manufacturers ORDER BY created_at DESC');
    res.json({ manufacturers: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new manufacturer profile
router.post('/', async (req, res) => {
  try {
    const { name, office, photoUrl, makingCharge } = req.body;
    if (!name || !office) {
      return res.status(400).json({ error: 'Name and office address are required' });
    }

    const result = await pool.query(
      `INSERT INTO manufacturers (name, office, photo_url, making_charge)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, office, photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300', parseFloat(makingCharge || 450)]
    );

    res.status(201).json({ message: 'Manufacturer profile created', manufacturer: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
