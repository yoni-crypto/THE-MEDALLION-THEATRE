/*
 * requireRole
 * Returns an Express middleware that checks whether req.user.role matches
 * the required role. Must be used after verifyToken in the middleware chain.
 * Rejects with 403 if the user's role does not match.
 *
 * @param {string} role - The required role ('manager' or 'clerk')
 */
function requireRole(role) {
  return (req, res, next) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
    }
    next();
  };
}

module.exports = { requireRole };
