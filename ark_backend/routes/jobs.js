const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Helper function to calculate live available diamond stock for a specific size and shape
async function getAvailableDiamondStock(client, sizeMm, shape, customShape) {
  const shapeKey = shape === 'Other' ? (customShape || 'Other') : shape;
  const inRes = await client.query(
    `SELECT COALESCE(SUM(COALESCE(d.weight_ct, d.weight, 0)), 0) as received
     FROM material_diamond_items d
     JOIN materials m ON d.material_entry_id = m.id
     WHERE m.direction = 'INWARD' AND d.size_mm = $1 AND (d.shape = $2 OR (d.shape = 'Other' AND d.custom_shape = $2))`,
    [parseFloat(sizeMm), shapeKey]
  );

  const outRes = await client.query(
    `SELECT COALESCE(SUM(COALESCE(d.weight_ct, d.weight, 0)), 0) as issued
     FROM material_diamond_items d
     JOIN materials m ON d.material_entry_id = m.id
     WHERE m.direction = 'OUTWARD' AND d.size_mm = $1 AND (d.shape = $2 OR (d.shape = 'Other' AND d.custom_shape = $2))`,
    [parseFloat(sizeMm), shapeKey]
  );

  const received = parseFloat(inRes.rows[0]?.received || 0);
  const issued = parseFloat(outRes.rows[0]?.issued || 0);
  return Math.max(0, received - issued);
}

// GET all Jobs with independent child diamond & gemstone items
router.get('/', async (req, res) => {
  try {
    const jobsRes = await pool.query('SELECT * FROM jobs ORDER BY created_at DESC');
    const jobs = jobsRes.rows;

    const diamondRes = await pool.query('SELECT id, job_id, COALESCE(weight_ct, weight, 0) as weight_ct, size_mm, shape, custom_shape, created_at FROM job_diamond_items ORDER BY created_at ASC');
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
          .map(d => ({
            id: d.id,
            parentId: d.job_id,
            weight: parseFloat(d.weight_ct || 0),
            weightCt: parseFloat(d.weight_ct || 0),
            sizeMm: parseFloat(d.size_mm || 0),
            size: `${parseFloat(d.size_mm || 0).toFixed(1)} mm`,
            shape: d.shape,
            customShape: d.custom_shape
          })),
        gemstoneItems: gemstoneRes.rows
          .filter(g => g.job_id === j.id)
          .map(g => ({ id: g.id, parentId: g.job_id, weight: parseFloat(g.weight || 0), size: g.size, stoneType: g.stone_type }))
      };
    });

    res.json({ jobs: jobsWithChildren });
  } catch (err) {
    console.error('Error fetching jobs:', err);
    res.status(500).json({ error: err.message, code: err.code });
  }
});

// POST create new Job with automatic Material OUT for Gold and Diamonds
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

    // 1. Validate Diamond Stock Requirements only if diamonds are included
    for (const item of diamondItems) {
      const itemWeight = parseFloat(item.weight || item.weightCt || 0);
      const itemSize = parseFloat(item.sizeMm || item.size || 2.5);
      const itemShape = item.shape || 'Round';
      const itemCustomShape = item.shape === 'Other' ? item.customShape : null;

      if (itemWeight > 0) {
        const available = await getAvailableDiamondStock(client, itemSize, itemShape, itemCustomShape);
        if (available < itemWeight) {
          const short = itemWeight - available;
          await client.query('ROLLBACK');
          return res.status(400).json({
            error: 'INSUFFICIENT_DIAMOND_STOCK',
            message: `Insufficient Diamond Stock for ${itemSize.toFixed(1)} mm ${itemShape}. Required: ${itemWeight.toFixed(2)} ct | Available: ${available.toFixed(2)} ct | Short: ${short.toFixed(2)} ct`,
            sizeMm: itemSize,
            shape: itemShape,
            required: itemWeight,
            available: available,
            short: short
          });
        }
      }
    }

    // 2. Insert Parent Job Record
    const jobRes = await client.query(
      `INSERT INTO jobs (job_number, timestamp, manufacturer_id, manufacturer_name, product_name, gold_weight, gold_purity, notes, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        jobNumber || '001',
        timestamp || new Date().toLocaleString('en-IN'),
        manufacturerId || null,
        manufacturerName || 'Karigar Workshop',
        productName || 'Custom Jewellery Order',
        parseFloat(goldWeight || 0),
        goldPurity || '24K',
        notes || '',
        photoUrl || ''
      ]
    );

    const newJob = jobRes.rows[0];
    const parsedGoldWeight = parseFloat(goldWeight || 0);

    // 3. AUTOMATIC MATERIAL OUT FOR GOLD: If gold was issued, generate linked OUTWARD entry in materials vault
    if (parsedGoldWeight > 0) {
      await client.query(
        `INSERT INTO materials (direction, material_type, weight, purity, vendor_name, manufacturer_id, job_id, notes, photo_url)
         VALUES ('OUTWARD', 'gold', $1, $2, $3, $4, $5, $6, $7)`,
        [
          parsedGoldWeight,
          goldPurity || '24K',
          manufacturerName || 'Karigar Workshop',
          manufacturerId || null,
          newJob.id,
          `Auto Gold OUT for Job #${newJob.job_number} (${newJob.product_name})`,
          photoUrl || ''
        ]
      );
    }

    // 4. Insert Structured Diamond Items linked to this Job
    const savedDiamonds = [];
    let totalDiamondWeight = 0;
    if (Array.isArray(diamondItems)) {
      for (const item of diamondItems) {
        const itemWeight = parseFloat(item.weight || item.weightCt || 0);
        const itemSize = parseFloat(item.sizeMm || item.size || 2.5);
        const itemShape = item.shape || 'Round';
        const itemCustomShape = item.shape === 'Other' ? item.customShape : null;

        if (itemWeight > 0) {
          const dRes = await client.query(
            `INSERT INTO job_diamond_items (job_id, weight_ct, size_mm, shape, custom_shape)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [newJob.id, itemWeight, itemSize, itemShape, itemCustomShape]
          );
          savedDiamonds.push({
            id: dRes.rows[0].id,
            parentId: newJob.id,
            weight: parseFloat(dRes.rows[0].weight_ct),
            weightCt: parseFloat(dRes.rows[0].weight_ct),
            sizeMm: parseFloat(dRes.rows[0].size_mm),
            size: `${parseFloat(dRes.rows[0].size_mm).toFixed(1)} mm`,
            shape: dRes.rows[0].shape,
            customShape: dRes.rows[0].custom_shape
          });
          totalDiamondWeight += itemWeight;
        }
      }
    }

    // 5. AUTOMATIC MATERIAL OUT FOR DIAMONDS: Generate linked Material OUT record for consumed Diamonds
    if (savedDiamonds.length > 0) {
      const matOutRes = await client.query(
        `INSERT INTO materials (direction, material_type, weight, vendor_name, manufacturer_id, job_id, price, total_amount, notes, photo_url)
         VALUES ('OUTWARD', 'diamond', $1, $2, $3, $4, 45000, $5, $6, $7)
         RETURNING id`,
        [
          totalDiamondWeight,
          manufacturerName || 'Auto Issued from Vault',
          manufacturerId || null,
          newJob.id,
          totalDiamondWeight * 45000,
          `Auto Material OUT for Job #${newJob.job_number} (${newJob.product_name})`,
          photoUrl || ''
        ]
      );
      const matOutId = matOutRes.rows[0].id;

      for (const d of savedDiamonds) {
        await client.query(
          `INSERT INTO material_diamond_items (material_entry_id, weight_ct, size_mm, shape, custom_shape)
           VALUES ($1, $2, $3, $4, $5)`,
          [matOutId, d.weightCt, d.sizeMm, d.shape, d.customShape]
        );
      }
    }

    // 6. Insert Gemstone Items
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
      message: 'Job created and material stock recorded automatically',
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
    console.error('Error creating job:', err);
    res.status(500).json({ error: err.message, code: err.code });
  } finally {
    client.release();
  }
});

// PUT update existing Job (atomic reconciliation: restore old stock, validate new requirements, apply new deductions)
router.put('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { goldWeight, goldPurity, notes, diamondItems = [], gemstoneItems = [] } = req.body;

    await client.query('BEGIN');

    // 1. Temporarily remove previous auto Material OUT (both Gold and Diamond) for this Job to restore available stock
    await client.query('DELETE FROM materials WHERE job_id = $1 AND direction = \'OUTWARD\'', [id]);

    // 2. Validate new Diamond Stock Requirements against restored stock
    for (const item of diamondItems) {
      const itemWeight = parseFloat(item.weight || item.weightCt || 0);
      const itemSize = parseFloat(item.sizeMm || item.size || 2.5);
      const itemShape = item.shape || 'Round';
      const itemCustomShape = item.shape === 'Other' ? item.customShape : null;

      if (itemWeight > 0) {
        const available = await getAvailableDiamondStock(client, itemSize, itemShape, itemCustomShape);
        if (available < itemWeight) {
          const short = itemWeight - available;
          await client.query('ROLLBACK');
          return res.status(400).json({
            error: 'INSUFFICIENT_DIAMOND_STOCK',
            message: `Insufficient Diamond Stock on Job edit for ${itemSize.toFixed(1)} mm ${itemShape}. Required: ${itemWeight.toFixed(2)} ct | Available: ${available.toFixed(2)} ct | Short: ${short.toFixed(2)} ct`,
            sizeMm: itemSize,
            shape: itemShape,
            required: itemWeight,
            available: available,
            short: short
          });
        }
      }
    }

    // 3. Update Parent Job Record
    const jobRes = await client.query(
      `UPDATE jobs
       SET gold_weight = $1, gold_purity = $2, notes = $3
       WHERE id = $4
       RETURNING *`,
      [parseFloat(goldWeight || 0), goldPurity || '24K', notes || '', id]
    );
    const updatedJob = jobRes.rows[0];
    const parsedGoldWeight = parseFloat(goldWeight || 0);

    // 4. Re-generate automatic Material OUT for Gold if gold weight > 0
    if (parsedGoldWeight > 0) {
      await client.query(
        `INSERT INTO materials (direction, material_type, weight, purity, vendor_name, manufacturer_id, job_id, notes)
         VALUES ('OUTWARD', 'gold', $1, $2, $3, $4, $5, $6)`,
        [
          parsedGoldWeight,
          goldPurity || '24K',
          updatedJob.manufacturer_name || 'Karigar Workshop',
          updatedJob.manufacturer_id || null,
          id,
          `Auto Gold OUT for Job #${updatedJob.job_number} (${updatedJob.product_name})`
        ]
      );
    }

    // 5. Replace Child Diamond Items
    await client.query('DELETE FROM job_diamond_items WHERE job_id = $1', [id]);
    const updatedDiamonds = [];
    let totalDiamondWeight = 0;
    if (Array.isArray(diamondItems)) {
      for (const item of diamondItems) {
        const itemWeight = parseFloat(item.weight || item.weightCt || 0);
        const itemSize = parseFloat(item.sizeMm || item.size || 2.5);
        const itemShape = item.shape || 'Round';
        const itemCustomShape = item.shape === 'Other' ? item.customShape : null;

        if (itemWeight > 0) {
          const dRes = await client.query(
            `INSERT INTO job_diamond_items (job_id, weight_ct, size_mm, shape, custom_shape)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [id, itemWeight, itemSize, itemShape, itemCustomShape]
          );
          updatedDiamonds.push({
            id: dRes.rows[0].id,
            parentId: id,
            weight: parseFloat(dRes.rows[0].weight_ct),
            weightCt: parseFloat(dRes.rows[0].weight_ct),
            sizeMm: parseFloat(dRes.rows[0].size_mm),
            size: `${parseFloat(dRes.rows[0].size_mm).toFixed(1)} mm`,
            shape: dRes.rows[0].shape,
            customShape: dRes.rows[0].custom_shape
          });
          totalDiamondWeight += itemWeight;
        }
      }
    }

    // 6. Re-generate new Material OUT for the updated diamond items
    if (updatedDiamonds.length > 0) {
      const matOutRes = await client.query(
        `INSERT INTO materials (direction, material_type, weight, vendor_name, manufacturer_id, job_id, price, total_amount, notes)
         VALUES ('OUTWARD', 'diamond', $1, $2, $3, $4, 45000, $5, $6)
         RETURNING id`,
        [
          totalDiamondWeight,
          updatedJob.manufacturer_name || 'Auto Issued from Vault',
          updatedJob.manufacturer_id || null,
          id,
          totalDiamondWeight * 45000,
          `Auto Material OUT for Job #${updatedJob.job_number} (${updatedJob.product_name})`
        ]
      );
      const matOutId = matOutRes.rows[0].id;

      for (const d of updatedDiamonds) {
        await client.query(
          `INSERT INTO material_diamond_items (material_entry_id, weight_ct, size_mm, shape, custom_shape)
           VALUES ($1, $2, $3, $4, $5)`,
          [matOutId, d.weightCt, d.sizeMm, d.shape, d.customShape]
        );
      }
    }

    // 7. Replace Child Gemstone Items
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
      message: 'Job and material stock reconciled successfully',
      jobId: id,
      diamondItems: updatedDiamonds,
      gemstoneItems: updatedGemstones
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating job:', err);
    res.status(500).json({ error: err.message, code: err.code });
  } finally {
    client.release();
  }
});

// DELETE Job (reverses all consumed gold and diamond stock automatically)
router.delete('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    await client.query('BEGIN');
    await client.query('DELETE FROM materials WHERE job_id = $1', [id]);
    await client.query('DELETE FROM jobs WHERE id = $1', [id]);
    await client.query('COMMIT');
    res.json({ message: 'Job deleted and material stock returned to vault' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error deleting job:', err);
    res.status(500).json({ error: err.message, code: err.code });
  } finally {
    client.release();
  }
});

module.exports = router;
