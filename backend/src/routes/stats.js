const express = require('express');
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);

/*
 * GET /api/stats
 * Returns aggregate counts used on the dashboard home page:
 * total patrons, total productions, total performances,
 * tickets sold today, and total tickets sold overall.
 */
router.get('/', async (req, res) => {
  try {
    const [patrons, productions, performances, ticketsToday, ticketsTotal] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM patron'),
      pool.query('SELECT COUNT(*) FROM production'),
      pool.query('SELECT COUNT(*) FROM performance'),
      pool.query(`SELECT COUNT(*) FROM ticket WHERE ticketid::text IN (
        SELECT ticketid::text FROM ticket
      ) AND DATE(
        (SELECT performancedate FROM performance WHERE performanceid = ticket.performanceid)
      ) = CURRENT_DATE`),
      pool.query('SELECT COUNT(*) FROM ticket'),
    ]);

    res.json({
      totalPatrons: parseInt(patrons.rows[0].count),
      totalProductions: parseInt(productions.rows[0].count),
      totalPerformances: parseInt(performances.rows[0].count),
      ticketsSoldToday: parseInt(ticketsToday.rows[0].count),
      ticketsSoldTotal: parseInt(ticketsTotal.rows[0].count),
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
