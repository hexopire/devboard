const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

// Confirms both the server AND the DB connection are alive — a plain
// "server is up" check wouldn't catch a dead/misconfigured DB pool.
router.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, data: { db_time: result.rows[0].now } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Database connection failed' });
  }
});

module.exports = router;
