const express = require('express');
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');

const router = express.Router();

router.use(verifyToken);

/*
 * GET /api/productions
 * Returns all productions ordered by name.
 */
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM production ORDER BY productionname'
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Failed to fetch productions' });
  }
});

/*
 * POST /api/productions
 * Creates a new production. Manager only.
 * Required fields: productionname, productiontype.
 */
router.post('/', requireRole('manager'), async (req, res) => {
  const { productionname, productiontype } = req.body;

  if (!productionname || !productiontype) {
    return res.status(400).json({ error: 'productionname and productiontype are required' });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO production (productionname, productiontype) VALUES ($1,$2) RETURNING *',
      [productionname, productiontype]
    );
    res.status(201).json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Failed to create production' });
  }
});

/*
 * PUT /api/productions/:id
 * Updates an existing production by UUID. Manager only.
 */
router.put('/:id', requireRole('manager'), async (req, res) => {
  const { productionname, productiontype } = req.body;

  if (!productionname || !productiontype) {
    return res.status(400).json({ error: 'productionname and productiontype are required' });
  }

  try {
    const { rows } = await pool.query(
      'UPDATE production SET productionname=$1, productiontype=$2 WHERE productionid=$3 RETURNING *',
      [productionname, productiontype, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Production not found' });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Failed to update production' });
  }
});

module.exports = router;
