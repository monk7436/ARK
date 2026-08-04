const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET all material entries
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM materials ORDER BY timestamp DESC');
    res.json({ materials: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new material transaction
router.post('/', async (req, res) => {
  try {
    const { direction, materialType, weight, purity, size, vendorName, manufacturerId, price, totalAmount, productType, photoUrl } = req.body;

    if (!direction || !materialType || !weight || !price) {
      return res.status(400).json({ error: 'Direction, materialType, weight, and price are required' });
    }

    const calcTotal = parseFloat(totalAmount || (weight * price));

    const result = await pool.query(
      `INSERT INTO materials (direction, material_type, weight, purity, size, vendor_name, manufacturer_id, price, total_amount, product_type, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        direction,
        materialType,
        parseFloat(weight),
        materialType === 'gold' ? (purity || '995 (24K)') : null,
        materialType !== 'gold' ? size : null,
        vendorName || 'General Supplier',
        manufacturerId || null,
        parseFloat(price),
        calcTotal,
        direction === 'OUTWARD' ? productType : null,
        photoUrl || 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=300'
      ]
    );

    // Update manufacturer gold balance if outward gold
    if (direction === 'OUTWARD' && manufacturerId) {
      await pool.query(
        `UPDATE manufacturers 
         SET gold_remaining = gold_remaining + $1, jobs_ongoing = jobs_ongoing + 1 
         WHERE id = $2`,
        [materialType === 'gold' ? parseFloat(weight) : 0, manufacturerId]
      );
    }

    res.status(201).json({ message: 'Material entry recorded', material: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
