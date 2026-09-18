const express = require('express');
const { all } = require('../database/db');

const router = express.Router();

// GET /api/offences - List all offences
router.get('/', async (req, res) => {
  try {
    const rows = await all('SELECT * FROM offences ORDER BY law_code, section');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/offences/search?q=query - Search offences
router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);

  try {
    const query = `%${q}%`;
    const rows = await all(
      `SELECT * FROM offences 
       WHERE offence_name LIKE ? OR section LIKE ? OR law_code LIKE ?
       ORDER BY law_code, section`,
      [query, query, query]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
