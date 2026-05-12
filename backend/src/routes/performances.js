const express = require('express');
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');

const router = express.Router();

router.use(verifyToken);

/*
 * GET /api/performances
 * Returns all performances joined with their production name,
 * ordered by performance date descending.
 */
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT pf.*, pr.productionname, pr.productiontype
       FROM performance pf
       JOIN production pr ON pf.productionid = pr.productionid
       ORDER BY pf.performancedate DESC`
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Failed to fetch performances' });
  }
});

/*
 * POST /api/performances
 * Creates a new performance linked to a production. Manager only.
 * Required fields: performancedate, performancetype ('matinee' or 'evening'), productionid.
 */
router.post('/', requireRole('manager'), async (req, res) => {
  const { performancedate, performancetype, productionid } = req.body;

  if (!performancedate || !performancetype || !productionid) {
    return res.status(400).json({ error: 'performancedate, performancetype, and productionid are required' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO performance (performancedate, performancetype, productionid)
       VALUES ($1,$2,$3) RETURNING *`,
      [performancedate, performancetype, productionid]
    );
    res.status(201).json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Failed to create performance' });
  }
});

/*
 * GET /api/performances/:id/seats
 * Returns all 602 seats with an isavailable boolean for the given performance.
 * A seat is unavailable if a ticket already exists for that seat + performance combination.
 */
router.get('/:id/seats', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT s.*,
              CASE WHEN t.ticketid IS NULL THEN true ELSE false END AS isavailable,
              t.ticketid,
              p.firstname,
              p.lastname
       FROM seat s
       LEFT JOIN ticket t ON t.seatid = s.seatid AND t.performanceid = $1
       LEFT JOIN patron p ON p.patronid = t.patronid
       ORDER BY s.seatcategory, s.seatnumber`,
      [req.params.id]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Failed to fetch seats' });
  }
});

module.exports = router;
