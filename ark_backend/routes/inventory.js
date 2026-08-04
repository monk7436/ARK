const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET all inventory items
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory ORDER BY created_at DESC');
    res.json({ inventory: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new tagged inventory item
router.post('/', async (req, res) => {
  try {
    const { name, category, purityKarat, grossWeight, stoneWeight, makingCharge, photoUrl } = req.body;
    if (!name || !grossWeight) {
      return res.status(400).json({ error: 'Name and gross weight are required' });
    }

    const gross = parseFloat(grossWeight);
    const stone = parseFloat(stoneWeight || 0);
    const net = gross - stone;
    const fine = net * 0.916; // 22K default

    const result = await pool.query(
      `INSERT INTO inventory (tag_code, name, category, purity_karat, gross_weight, stone_weight, net_weight, fine_weight, making_charge, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        'ARK-TAG-' + Math.floor(1000 + Math.random() * 9000),
        name,
        category || 'Ring',
        purityKarat || '22K (91.6%)',
        gross,
        stone,
        parseFloat(net.toFixed(3)),
        parseFloat(fine.toFixed(3)),
        parseFloat(makingCharge || 450),
        photoUrl || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300'
      ]
    );

    res.status(201).json({ message: 'Inventory item tagged', item: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
