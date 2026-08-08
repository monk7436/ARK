const { pool } = require('./db');

async function cleanManufacturers() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Update Jitu bhai photo_url to NULL so initials "JB" are rendered
    await client.query("UPDATE manufacturers SET photo_url = NULL WHERE name ILIKE '%Jitu%'");

    // 2. Find Jitu bhai ID if exists
    const jituRes = await client.query("SELECT id FROM manufacturers WHERE name ILIKE '%Jitu%'");
    const jituId = jituRes.rows[0]?.id;

    if (jituId) {
      await client.query(
        "UPDATE jobs SET manufacturer_id = $1, manufacturer_name = 'Jitu bhai' WHERE manufacturer_name ILIKE '%Ramesh%' OR manufacturer_name ILIKE '%Swarn%'",
        [jituId]
      );
      await client.query(
        "UPDATE materials SET manufacturer_id = $1 WHERE manufacturer_id IN (SELECT id FROM manufacturers WHERE name ILIKE '%Ramesh%' OR name ILIKE '%Swarn%')",
        [jituId]
      );
    }

    // 3. Delete hardcoded Ramesh Artisan Workshop and Swarn Artistry from database
    await client.query("DELETE FROM manufacturers WHERE name ILIKE '%Ramesh%' OR name ILIKE '%Swarn%'");

    await client.query('COMMIT');
    console.log('✅ Successfully removed Ramesh Artisan Workshop and Swarn Artistry from PostgreSQL.');
    console.log('✅ Set Jitu bhai photo_url to NULL so JB initials are rendered.');

    const remaining = await client.query('SELECT id, name, office, photo_url FROM manufacturers');
    console.log('Current Manufacturers in Database:', remaining.rows);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error cleaning manufacturers:', err);
  } finally {
    client.release();
    pool.end();
  }
}

cleanManufacturers();
