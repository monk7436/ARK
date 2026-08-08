const { pool } = require('./db');

async function syncExistingJobsGold() {
  const client = await pool.connect();
  try {
    console.log('🔄 Checking existing jobs for missing Gold OUTWARD material records...');
    await client.query('BEGIN');

    const jobsRes = await client.query('SELECT * FROM jobs');
    console.log(`Found ${jobsRes.rows.length} jobs in PostgreSQL.`);

    for (const job of jobsRes.rows) {
      const goldWeight = parseFloat(job.gold_weight || 0);
      if (goldWeight > 0) {
        // Check if an OUTWARD gold record exists for this job_id
        const checkRes = await client.query(
          "SELECT * FROM materials WHERE job_id = $1 AND material_type = 'gold' AND direction = 'OUTWARD'",
          [job.id]
        );

        if (checkRes.rows.length === 0) {
          console.log(`Creating missing Gold OUTWARD entry for Job #${job.job_number} (${job.product_name}) - ${goldWeight}g (${job.gold_purity})...`);
          await client.query(
            `INSERT INTO materials (direction, material_type, weight, purity, vendor_name, manufacturer_id, job_id, notes, photo_url)
             VALUES ('OUTWARD', 'gold', $1, $2, $3, $4, $5, $6, $7)`,
            [
              goldWeight,
              job.gold_purity || '24K',
              job.manufacturer_name || 'Karigar Workshop',
              job.manufacturer_id || null,
              job.id,
              `Auto Gold OUT for Job #${job.job_number} (${job.product_name})`,
              job.photo_url || ''
            ]
          );
        } else {
          console.log(`Job #${job.job_number} already has Gold OUTWARD entry.`);
        }
      }
    }

    await client.query('COMMIT');
    console.log('✅ Gold OUTWARD records successfully synced in PostgreSQL database!');

    // Print summary of materials
    const matSummary = await client.query("SELECT direction, material_type, SUM(weight) as total_wt, COUNT(*) as count FROM materials GROUP BY direction, material_type");
    console.log('\nMaterials Vault Summary in PostgreSQL:', matSummary.rows);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Sync error:', err);
  } finally {
    client.release();
    pool.end();
  }
}

syncExistingJobsGold();
