const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');

const router = express.Router();

router.use(verifyToken);
router.use(requireRole('manager'));

/*
 * GET /api/users
 * Returns all user accounts. Never returns passwordhash.
 * Manager only.
 */
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT userid, username, role FROM users ORDER BY role, username'
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/*
 * POST /api/users
 * Creates a new staff account with a bcrypt-hashed password.
 * Required fields: username, password, role ('clerk' or 'manager').
 * Manager only.
 */
router.post('/', async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: 'username, password, and role are required' });
  }

  if (!['clerk', 'manager'].includes(role)) {
    return res.status(400).json({ error: 'role must be clerk or manager' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (username, passwordhash, role) VALUES ($1, $2, $3) RETURNING userid, username, role',
      [username, hash, role]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

/*
 * DELETE /api/users/:id
 * Deletes a staff account by UUID.
 * Prevents a manager from deleting their own account.
 * Manager only.
 */
router.delete('/:id', async (req, res) => {
  if (req.params.id === req.user.userid) {
    return res.status(400).json({ error: 'You cannot delete your own account' });
  }

  try {
    const { rows } = await pool.query(
      'DELETE FROM users WHERE userid = $1 RETURNING userid',
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
