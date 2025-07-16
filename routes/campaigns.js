const express = require('express');
const router = express.Router();
const db = require('../db');

// POST: Create a new campaign invite
router.post('/', async (req, res) => {
  try {
    const { brandEmail, influencerEmail, influencerName, message } = req.body;
    const date = new Date();

    const sql = `
      INSERT INTO campaigns (brandEmail, influencerEmail, influencerName, message, date)
      VALUES (?, ?, ?, ?, ?)`;

    await db.query(sql, [brandEmail, influencerEmail, influencerName, message, date]);
    res.json({ message: 'Campaign invite sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Fetch campaigns by brand or influencer email
router.get('/', async (req, res) => {
  try {
    const { brandEmail, influencerEmail } = req.query;
    let sql = '';
    let value = '';

    if (brandEmail) {
      sql = `SELECT * FROM campaigns WHERE brandEmail = ?`;
      value = brandEmail;
    } else if (influencerEmail) {
      sql = `SELECT * FROM campaigns WHERE influencerEmail = ?`;
      value = influencerEmail;
    } else {
      return res.status(400).json({ message: 'Email required' });
    }

    const [rows] = await db.query(sql, [value]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Remove a campaign by ID
router.delete('/:id', async (req, res) => {
  try {
    const sql = `DELETE FROM campaigns WHERE id = ?`;
    await db.query(sql, [req.params.id]);
    res.json({ message: 'Invite deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT: Update campaign status by ID
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const campaignId = req.params.id;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const sql = `UPDATE campaigns SET status = ? WHERE id = ?`;
    await db.query(sql, [status, campaignId]);

    res.json({ message: 'Status updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;