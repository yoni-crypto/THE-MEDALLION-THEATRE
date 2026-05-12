const express = require('express');
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);

/*
 * GET /api/reports/performance/:id
 * Returns a full seat availability report for a given performance.
 * Includes total seats (602), seats sold, seats available, total revenue,
 * and a list of sold seats with patron details.
 */
router.get('/performance/:id', async (req, res) => {
  try {
    const { rows: seats } = await pool.query(
      `SELECT s.seatid, s.seatnumber, s.seatcategory, s.price,
              CASE WHEN t.ticketid IS NULL THEN true ELSE false END AS isavailable,
              t.ticketid,
              p.firstname,
              p.lastname,
              p.patronid
       FROM seat s
       LEFT JOIN ticket t ON t.seatid = s.seatid AND t.performanceid = $1
       LEFT JOIN patron p ON p.patronid = t.patronid
       ORDER BY s.seatcategory, s.seatnumber`,
      [req.params.id]
    );

    const sold = seats.filter(s => !s.isavailable);
    const available = seats.filter(s => s.isavailable);
    const revenue = sold.reduce((sum, s) => sum + parseFloat(s.price), 0);

    res.json({
      totalSeats: seats.length,
      seatsSold: sold.length,
      seatsAvailable: available.length,
      totalRevenue: revenue.toFixed(2),
      soldSeats: sold,
    });
  } catch {
    res.status(500).json({ error: 'Failed to generate performance report' });
  }
});

/*
 * GET /api/reports/patron/search?name=
 * Finds a patron by full or partial name, then returns all their tickets
 * with performance and seat details.
 */
router.get('/patron/search', async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: 'name query param is required' });

  try {
    const { rows: patrons } = await pool.query(
      `SELECT * FROM patron
       WHERE LOWER(CONCAT(firstname, ' ', lastname)) LIKE $1
          OR LOWER(firstname) LIKE $1
          OR LOWER(lastname) LIKE $1
          OR CAST(patronid AS TEXT) LIKE $1`,
      [`%${name.toLowerCase()}%`]
    );

    if (!patrons.length) return res.json([]);

    const results = await Promise.all(
      patrons.map(async (patron) => {
        const { rows: tickets } = await pool.query(
          `SELECT t.ticketid, s.seatnumber, s.seatcategory, s.price,
                  pf.performancedate, pf.performancetype, pr.productionname
           FROM ticket t
           JOIN seat s ON s.seatid = t.seatid
           JOIN performance pf ON pf.performanceid = t.performanceid
           JOIN production pr ON pr.productionid = pf.productionid
           WHERE t.patronid = $1
           ORDER BY pf.performancedate DESC`,
          [patron.patronid]
        );
        return { patron, tickets };
      })
    );

    res.json(results);
  } catch {
    res.status(500).json({ error: 'Failed to search patron tickets' });
  }
});

/*
 * GET /api/reports/patron/:id
 * Returns all tickets purchased by a specific patron identified by UUID,
 * including performance date, type, production name, seat number, category, and price.
 */
router.get('/patron/:id', async (req, res) => {
  try {
    const { rows: patron } = await pool.query(
      'SELECT * FROM patron WHERE patronid = $1',
      [req.params.id]
    );
    if (!patron[0]) return res.status(404).json({ error: 'Patron not found' });

    const { rows: tickets } = await pool.query(
      `SELECT t.ticketid, s.seatnumber, s.seatcategory, s.price,
              pf.performancedate, pf.performancetype, pr.productionname
       FROM ticket t
       JOIN seat s ON s.seatid = t.seatid
       JOIN performance pf ON pf.performanceid = t.performanceid
       JOIN production pr ON pr.productionid = pf.productionid
       WHERE t.patronid = $1
       ORDER BY pf.performancedate DESC`,
      [req.params.id]
    );

    res.json({ patron: patron[0], tickets });
  } catch {
    res.status(500).json({ error: 'Failed to fetch patron report' });
  }
});

module.exports = router;
