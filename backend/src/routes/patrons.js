const express = require('express');
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);

/*
 * GET /api/patrons
 * Returns all patrons ordered by last name.
 */
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM patron ORDER BY lastname, firstname'
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Failed to fetch patrons' });
  }
});

/*
 * GET /api/patrons/search?q=
 * Searches patrons by first name, last name, or patronid.
 * The query is case-insensitive and matches partial strings.
 */
router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);

  try {
    const { rows } = await pool.query(
      `SELECT * FROM patron
       WHERE LOWER(firstname) LIKE $1
          OR LOWER(lastname) LIKE $1
          OR LOWER(CONCAT(firstname, ' ', lastname)) LIKE $1
          OR CAST(patronid AS TEXT) LIKE $1
       ORDER BY lastname, firstname`,
      [`%${q.toLowerCase()}%`]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Search failed' });
  }
});

/*
 * GET /api/patrons/:id
 * Returns a single patron by their UUID.
 */
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM patron WHERE patronid = $1',
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Patron not found' });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Failed to fetch patron' });
  }
});

/*
 * POST /api/patrons
 * Creates a new patron record.
 * Required fields: firstname, lastname, email.
 */
router.post('/', async (req, res) => {
  const { firstname, lastname, streetaddress, city, state, zipcode, phonenumber, email } = req.body;

  if (!firstname || !lastname || !email) {
    return res.status(400).json({ error: 'firstname, lastname, and email are required' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO patron (firstname, lastname, streetaddress, city, state, zipcode, phonenumber, email)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [firstname, lastname, streetaddress, city, state, zipcode, phonenumber, email]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A patron with this email already exists' });
    }
    res.status(500).json({ error: 'Failed to create patron' });
  }
});

/*
 * PUT /api/patrons/:id
 * Updates an existing patron's information by UUID.
 */
router.put('/:id', async (req, res) => {
  const { firstname, lastname, streetaddress, city, state, zipcode, phonenumber, email } = req.body;

  if (!firstname || !lastname || !email) {
    return res.status(400).json({ error: 'firstname, lastname, and email are required' });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE patron SET firstname=$1, lastname=$2, streetaddress=$3, city=$4,
       state=$5, zipcode=$6, phonenumber=$7, email=$8
       WHERE patronid=$9 RETURNING *`,
      [firstname, lastname, streetaddress, city, state, zipcode, phonenumber, email, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Patron not found' });
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A patron with this email already exists' });
    }
    res.status(500).json({ error: 'Failed to update patron' });
  }
});

module.exports = router;
