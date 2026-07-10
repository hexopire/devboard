const jwt = require('jsonwebtoken');

// Runs before any protected route handler. Reads the Bearer token, verifies
// it against JWT_SECRET, and attaches the decoded payload to req.user so
// downstream handlers can trust req.user.id / req.user.role without
// re-querying the DB. Calling next() with no arguments hands off to the
// next middleware/route; calling res.status(...).json(...) instead short-
// circuits the chain — the route handler never runs.
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role } — set by signToken's payload shape
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

module.exports = { authMiddleware };
