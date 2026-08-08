const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET all material entries with their child diamond and gemstone items
router.get('/', async (req, res) => {
  try {
    const matResult = await pool.query('SELECT * FROM materials ORDER BY timestamp DESC');
    const materials = matResult.rows;

    // Fetch child diamond & gemstone items for all material entries
    const diamondResult = await pool.query('SELECT * FROM material_diamond_items ORDER BY created_at ASC');
    const gemstoneResult = await pool.query('SELECT * FROM material_gemstone_items ORDER BY created_at ASC');

    const materialsWithChildren = materials.map(m => {
      return {
        ...m,
        id: m.id,
        direction: m.direction,
        materialType: m.material_type,
        goldWeight: parseFloat(m.gold_weight || 0),
        goldPurity: m.gold_purity || '24K',
        vendorName: m.vendor_name,
        manufacturerId: m.manufacturer_id,
        jobId: m.job_id,
        price: parseFloat(m.price || 0),
        totalAmount: parseFloat(m.total_amount || 0),
        photoUrl: m.photo_url,
        notes: m.notes,
        diamondItems: diamondResult.rows
          .filter(d => d.material_entry_id === m.id)
          .map(d => ({
            id: d.id,
            parentId: d.material_entry_id,
            weight: parseFloat(d.weight_ct || 0),
            weightCt: parseFloat(d.weight_ct || 0),
            sizeMm: parseFloat(d.size_mm || 0),
            size: `${parseFloat(d.size_mm || 0).toFixed(1)} mm`,
            shape: d.shape,
            customShape: d.custom_shape
          })),
        gemstoneItems: gemstoneResult.rows
          .filter(g => g.material_entry_id === m.id)
          .map(g => ({ id: g.id, parentId: g.material_entry_id, weight: parseFloat(g.weight || 0), size: g.size, stoneType: g.stone_type }))
      };
    });

    res.json({ materials: materialsWithChildren });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET real-time structured diamond stock grouped by Size (mm) and Shape
router.get('/diamond-stock', async (req, res) => {
  try {
    // Inward Diamonds
    const inRes = await pool.query(`
      SELECT d.size_mm, d.shape, d.custom_shape, SUM(d.weight_ct) as total_received
      FROM material_diamond_items d
      JOIN materials m ON d.material_entry_id = m.id
      WHERE m.direction = 'INWARD'
      GROUP BY d.size_mm, d.shape, d.custom_shape
    `);

    // Outward Diamonds (Manual and Job-Generated)
    const outRes = await pool.query(`
      SELECT d.size_mm, d.shape, d.custom_shape, SUM(d.weight_ct) as total_issued
      FROM material_diamond_items d
      JOIN materials m ON d.material_entry_id = m.id
      WHERE m.direction = 'OUTWARD'
      GROUP BY d.size_mm, d.shape, d.custom_shape
    `);

    const stockMap = {};

    inRes.rows.forEach(r => {
      const sizeKey = parseFloat(r.size_mm).toFixed(1);
      const shapeKey = r.shape === 'Other' ? (r.custom_shape || 'Other') : r.shape;
      if (!stockMap[sizeKey]) stockMap[sizeKey] = {};
      stockMap[sizeKey][shapeKey] = {
        sizeMm: parseFloat(r.size_mm),
        shape: shapeKey,
        totalReceived: parseFloat(r.total_received || 0),
        totalIssued: 0,
        available: parseFloat(r.total_received || 0)
      };
    });

    outRes.rows.forEach(r => {
      const sizeKey = parseFloat(r.size_mm).toFixed(1);
      const shapeKey = r.shape === 'Other' ? (r.custom_shape || 'Other') : r.shape;
      if (!stockMap[sizeKey]) stockMap[sizeKey] = {};
      if (!stockMap[sizeKey][shapeKey]) {
        stockMap[sizeKey][shapeKey] = {
          sizeMm: parseFloat(r.size_mm),
          shape: shapeKey,
          totalReceived: 0,
          totalIssued: 0,
          available: 0
        };
      }
      const issued = parseFloat(r.total_issued || 0);
      stockMap[sizeKey][shapeKey].totalIssued += issued;
      stockMap[sizeKey][shapeKey].available = stockMap[sizeKey][shapeKey].totalReceived - stockMap[sizeKey][shapeKey].totalIssued;
    });

    res.json({ diamondStock: stockMap });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new material transaction with structured diamond child items
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const { 
      direction, 
      materialType, 
      weight, 
      purity, 
      vendorName, 
      manufacturerId, 
      price, 
      totalAmount, 
      notes, 
      photoUrl,
      diamondItems = [],
      gemstoneItems = []
    } = req.body;

    if (!direction || !materialType) {
      return res.status(400).json({ error: 'Direction and materialType are required' });
    }

    await client.query('BEGIN');

    // 1. Insert Parent Material Entry
    const calcTotal = parseFloat(totalAmount || (weight * price) || 0);
    const parentRes = await client.query(
      `INSERT INTO materials (direction, material_type, gold_weight, gold_purity, vendor_name, manufacturer_id, price, total_amount, notes, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        direction,
        materialType,
        materialType === 'gold' ? parseFloat(weight || 0) : 0,
        materialType === 'gold' ? (purity || '24K') : null,
        vendorName || 'General Supplier',
        manufacturerId || null,
        parseFloat(price || 0),
        calcTotal,
        notes || '',
        photoUrl || ''
      ]
    );

    const newMaterial = parentRes.rows[0];

    // 2. Insert Structured Diamond Child Records
    const savedDiamondItems = [];
    if (materialType === 'diamond' && Array.isArray(diamondItems)) {
      for (const item of diamondItems) {
        const itemWeight = parseFloat(item.weight || item.weightCt || 0);
        const itemSize = parseFloat(item.sizeMm || item.size || 2.5);
        const itemShape = item.shape || 'Round';
        const itemCustomShape = item.customShape || null;

        if (itemWeight > 0) {
          const dRes = await client.query(
            `INSERT INTO material_diamond_items (material_entry_id, weight_ct, size_mm, shape, custom_shape)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [newMaterial.id, itemWeight, itemSize, itemShape, itemCustomShape]
          );
          savedDiamondItems.push({
            id: dRes.rows[0].id,
            parentId: newMaterial.id,
            weight: parseFloat(dRes.rows[0].weight_ct),
            weightCt: parseFloat(dRes.rows[0].weight_ct),
            sizeMm: parseFloat(dRes.rows[0].size_mm),
            size: `${parseFloat(dRes.rows[0].size_mm).toFixed(1)} mm`,
            shape: dRes.rows[0].shape,
            customShape: dRes.rows[0].custom_shape
          });
        }
      }
    }

    // 3. Insert Independent Gemstone Child Records
    const savedGemstoneItems = [];
    if (materialType === 'gemstone' && Array.isArray(gemstoneItems)) {
      for (const item of gemstoneItems) {
        if (item.weight || item.size) {
          const gRes = await client.query(
            `INSERT INTO material_gemstone_items (material_entry_id, weight, size, stone_type)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [newMaterial.id, parseFloat(item.weight || 0), item.size || 'Standard', item.stoneType || 'Gemstone']
          );
          savedGemstoneItems.push({
            id: gRes.rows[0].id,
            parentId: newMaterial.id,
            weight: parseFloat(gRes.rows[0].weight),
            size: gRes.rows[0].size,
            stoneType: gRes.rows[0].stone_type
          });
        }
      }
    }

    // Update manufacturer gold balance if outward gold
    if (direction === 'OUTWARD' && manufacturerId && materialType === 'gold') {
      await client.query(
        `UPDATE manufacturers 
         SET gold_remaining = gold_remaining + $1, jobs_ongoing = jobs_ongoing + 1 
         WHERE id = $2`,
        [parseFloat(weight || 0), manufacturerId]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Material entry recorded with structured items',
      material: {
        ...newMaterial,
        id: newMaterial.id,
        diamondItems: savedDiamondItems,
        gemstoneItems: savedGemstoneItems
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
