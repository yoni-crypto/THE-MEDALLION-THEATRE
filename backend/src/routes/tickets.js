const express = require('express');
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');

const router = express.Router();

router.use(verifyToken);

/*
 * POST /api/tickets
 * Reserves a ticket by linking a patron, a performance, and a seat.
 * Returns 409 if the seat is already taken for that performance.
 * Required fields: patronid, performanceid, seatid.
 */
router.post('/', async (req, res) => {
  const { patronid, performanceid, seatid } = req.body;

  if (!patronid || !performanceid || !seatid) {
    return res.status(400).json({ error: 'patronid, performanceid, and seatid are required' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO ticket (patronid, performanceid, seatid)
       VALUES ($1,$2,$3) RETURNING *`,
      [patronid, performanceid, seatid]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Seat already reserved for this performance' });
    }
    res.status(500).json({ error: 'Failed to reserve ticket' });
  }
});

/*
 * DELETE /api/tickets/:id
 * Cancels a ticket by UUID. Manager only.
 */
router.delete('/:id', requireRole('manager'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM ticket WHERE ticketid = $1 RETURNING *',
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Ticket not found' });
    res.json({ message: 'Ticket cancelled', ticket: rows[0] });
  } catch {
    res.status(500).json({ error: 'Failed to cancel ticket' });
  }
});

module.exports = router;
