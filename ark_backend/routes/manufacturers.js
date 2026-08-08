const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET all manufacturer profiles (strictly from database, no fake records)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM manufacturers ORDER BY created_at DESC');
    const mapped = result.rows.map(m => ({
      id: m.id,
      name: m.name,
      office: m.office,
      photoUrl: m.photo_url || '',
      makingCharge: parseFloat(m.making_charge || 450),
      goldRemaining: parseFloat(m.gold_remaining || 0),
      jobsOngoing: parseInt(m.jobs_ongoing || 0, 10),
      jobsDone: parseInt(m.jobs_done || 0, 10),
      createdAt: m.created_at
    }));
    res.json({ manufacturers: mapped });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new manufacturer profile (no auto-filled fake images)
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
      [name.trim(), office.trim(), photoUrl ? photoUrl.trim() : null, parseFloat(makingCharge || 450)]
    );

    const m = result.rows[0];
    res.status(201).json({
      message: 'Manufacturer profile created',
      manufacturer: {
        id: m.id,
        name: m.name,
        office: m.office,
        photoUrl: m.photo_url || '',
        makingCharge: parseFloat(m.making_charge || 450),
        goldRemaining: 0,
        jobsOngoing: 0,
        jobsDone: 0,
        createdAt: m.created_at
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
