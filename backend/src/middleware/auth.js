const jwt = require('jsonwebtoken');

/*
 * verifyToken
 * Express middleware that reads the Bearer token from the Authorization header,
 * verifies it against JWT_SECRET, and attaches the decoded payload to req.user.
 * Rejects the request with 401 if the token is missing or invalid.
 */
function verifyToken(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = header.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { verifyToken };
