const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET all Jobs with independent child diamond & gemstone items
router.get('/', async (req, res) => {
  try {
    const jobsRes = await pool.query('SELECT * FROM jobs ORDER BY created_at DESC');
    const jobs = jobsRes.rows;

    const diamondRes = await pool.query('SELECT * FROM job_diamond_items ORDER BY created_at ASC');
    const gemstoneRes = await pool.query('SELECT * FROM job_gemstone_items ORDER BY created_at ASC');

    const jobsWithChildren = jobs.map(j => {
      return {
        id: j.id,
        jobNumber: j.job_number,
        timestamp: j.timestamp,
        manufacturerId: j.manufacturer_id,
        manufacturerName: j.manufacturer_name,
        productName: j.product_name,
        goldWeight: parseFloat(j.gold_weight || 0),
        goldPurity: j.gold_purity || '24K',
        status: j.status,
        notes: j.notes,
        photoUrl: j.photo_url,
        photos: j.photo_url ? [j.photo_url] : [],
        diamondItems: diamondRes.rows
          .filter(d => d.job_id === j.id)
          .map(d => ({ id: d.id, parentId: d.job_id, weight: parseFloat(d.weight), size: d.size })),
        gemstoneItems: gemstoneRes.rows
          .filter(g => g.job_id === j.id)
          .map(g => ({ id: g.id, parentId: g.job_id, weight: parseFloat(g.weight), size: g.size, stoneType: g.stone_type }))
      };
    });

    res.json({ jobs: jobsWithChildren });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new Job with independent child diamond & gemstone items
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      jobNumber,
      timestamp,
      manufacturerId,
      manufacturerName,
      productName,
      goldWeight,
      goldPurity,
      notes,
      photoUrl,
      diamondItems = [],
      gemstoneItems = []
    } = req.body;

    await client.query('BEGIN');

    // 1. Insert Parent Job Record
    const jobRes = await client.query(
      `INSERT INTO jobs (job_number, timestamp, manufacturer_id, manufacturer_name, product_name, gold_weight, gold_purity, notes, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        jobNumber || '001',
        timestamp || new Date().toLocaleString('en-IN'),
        manufacturerId || null,
        manufacturerName || 'Artisan Workshop',
        productName || 'Custom Jewellery Order',
        parseFloat(goldWeight || 0),
        goldPurity || '24K',
        notes || '',
        photoUrl || ''
      ]
    );

    const newJob = jobRes.rows[0];

    // 2. Insert Independent Diamond Items linked to this Job
    const savedDiamonds = [];
    if (Array.isArray(diamondItems)) {
      for (const item of diamondItems) {
        if (item.weight || item.size) {
          const dRes = await client.query(
            `INSERT INTO job_diamond_items (job_id, weight, size)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [newJob.id, parseFloat(item.weight || 0), item.size || 'Standard']
          );
          savedDiamonds.push({
            id: dRes.rows[0].id,
            parentId: newJob.id,
            weight: parseFloat(dRes.rows[0].weight),
            size: dRes.rows[0].size
          });
        }
      }
    }

    // 3. Insert Independent Gemstone Items linked to this Job
    const savedGemstones = [];
    if (Array.isArray(gemstoneItems)) {
      for (const item of gemstoneItems) {
        if (item.weight || item.size) {
          const gRes = await client.query(
            `INSERT INTO job_gemstone_items (job_id, weight, size, stone_type)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [newJob.id, parseFloat(item.weight || 0), item.size || 'Standard', item.stoneType || 'Gemstone']
          );
          savedGemstones.push({
            id: gRes.rows[0].id,
            parentId: newJob.id,
            weight: parseFloat(gRes.rows[0].weight),
            size: gRes.rows[0].size,
            stoneType: gRes.rows[0].stone_type
          });
        }
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Job created with independent diamond and gemstone records',
      job: {
        id: newJob.id,
        jobNumber: newJob.job_number,
        timestamp: newJob.timestamp,
        manufacturerId: newJob.manufacturer_id,
        manufacturerName: newJob.manufacturer_name,
        productName: newJob.product_name,
        goldWeight: parseFloat(newJob.gold_weight || 0),
        goldPurity: newJob.gold_purity,
        status: newJob.status,
        notes: newJob.notes,
        photoUrl: newJob.photo_url,
        photos: newJob.photo_url ? [newJob.photo_url] : [],
        diamondItems: savedDiamonds,
        gemstoneItems: savedGemstones
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PUT update existing Job (editing only Gold, Diamond items, Gemstone items, and Notes)
router.put('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { goldWeight, goldPurity, notes, diamondItems = [], gemstoneItems = [] } = req.body;

    await client.query('BEGIN');

    // 1. Update Parent Job Record (Gold & Notes)
    await client.query(
      `UPDATE jobs
       SET gold_weight = $1, gold_purity = $2, notes = $3
       WHERE id = $4`,
      [parseFloat(goldWeight || 0), goldPurity || '24K', notes || '', id]
    );

    // 2. Replace Child Diamond Items
    await client.query('DELETE FROM job_diamond_items WHERE job_id = $1', [id]);
    const updatedDiamonds = [];
    if (Array.isArray(diamondItems)) {
      for (const item of diamondItems) {
        if (item.weight || item.size) {
          const dRes = await client.query(
            `INSERT INTO job_diamond_items (job_id, weight, size)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [id, parseFloat(item.weight || 0), item.size || 'Standard']
          );
          updatedDiamonds.push({
            id: dRes.rows[0].id,
            parentId: id,
            weight: parseFloat(dRes.rows[0].weight),
            size: dRes.rows[0].size
          });
        }
      }
    }

    // 3. Replace Child Gemstone Items
    await client.query('DELETE FROM job_gemstone_items WHERE job_id = $1', [id]);
    const updatedGemstones = [];
    if (Array.isArray(gemstoneItems)) {
      for (const item of gemstoneItems) {
        if (item.weight || item.size) {
          const gRes = await client.query(
            `INSERT INTO job_gemstone_items (job_id, weight, size, stone_type)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [id, parseFloat(item.weight || 0), item.size || 'Standard', item.stoneType || 'Gemstone']
          );
          updatedGemstones.push({
            id: gRes.rows[0].id,
            parentId: id,
            weight: parseFloat(gRes.rows[0].weight),
            size: gRes.rows[0].size,
            stoneType: gRes.rows[0].stone_type
          });
        }
      }
    }

    await client.query('COMMIT');

    res.json({
      message: 'Job updated with child items synchronized',
      jobId: id,
      diamondItems: updatedDiamonds,
      gemstoneItems: updatedGemstones
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
