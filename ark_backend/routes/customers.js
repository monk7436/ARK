const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET all customer profiles with assigned items & invoices
router.get('/', async (req, res) => {
  try {
    const custResult = await pool.query('SELECT * FROM customers ORDER BY created_at DESC');
    const customers = custResult.rows;

    // Attach assigned items & invoices for each customer
    for (let c of customers) {
      const itemsRes = await pool.query('SELECT * FROM inventory WHERE assigned_customer_id = $1', [c.id]);
      const invRes = await pool.query('SELECT * FROM invoices WHERE customer_id = $1 ORDER BY created_at DESC', [c.id]);
      c.assignedItems = itemsRes.rows;
      c.invoices = invRes.rows;
    }

    res.json({ customers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new customer profile
router.post('/', async (req, res) => {
  try {
    const { name, companyName, phone, gstin, address } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone number are required' });
    }

    const result = await pool.query(
      `INSERT INTO customers (name, company_name, phone, gstin, address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, companyName || name, phone, gstin || 'UNREGISTERED', address || '']
    );

    const newCust = result.rows[0];
    newCust.assignedItems = [];
    newCust.invoices = [];

    res.status(201).json({ message: 'Customer created', customer: newCust });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Assign product to customer & generate invoice
router.post('/assign', async (req, res) => {
  try {
    const { customerId, itemId, goldRate, oldGoldDeduction } = req.body;
    if (!customerId || !itemId) {
      return res.status(400).json({ error: 'customerId and itemId are required' });
    }

    // 1. Get Item Details
    const itemRes = await pool.query('SELECT * FROM inventory WHERE id = $1', [itemId]);
    if (itemRes.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    const item = itemRes.rows[0];

    // 2. Get Customer Details
    const custRes = await pool.query('SELECT * FROM customers WHERE id = $1', [customerId]);
    if (custRes.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    const customer = custRes.rows[0];

    // 3. Mark Item as ASSIGNED
    await pool.query(
      `UPDATE inventory SET status = 'ASSIGNED', assigned_customer_id = $1 WHERE id = $2`,
      [customerId, itemId]
    );

    // 4. Calculate Financials
    const rate = parseFloat(goldRate || 6850);
    const metalVal = item.net_weight * rate;
    const makingVal = item.net_weight * item.making_charge;
    const itemTotal = metalVal + makingVal;
    const deduction = parseFloat(oldGoldDeduction || 0);
    const taxable = Math.max(0, itemTotal - deduction);
    const tax = taxable * 0.03; // 3% GST
    const finalPayable = Math.round(taxable + tax);

    const invoiceNo = 'ARK-INV-' + Math.floor(1000 + Math.random() * 9000);

    // 5. Insert Invoice Record
    const invResult = await pool.query(
      `INSERT INTO invoices (invoice_number, customer_id, customer_name, gstin, customer_address, phone, item_tag, item_name, net_weight, gold_rate_applied, subtotal, old_gold_deduction, final_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        invoiceNo,
        customerId,
        customer.company_name || customer.name,
        customer.gstin,
        customer.address,
        customer.phone,
        item.tag_code,
        item.name,
        item.net_weight,
        rate,
        itemTotal,
        deduction,
        finalPayable
      ]
    );

    res.json({
      message: 'Product assigned & invoice generated successfully',
      invoice: invResult.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
