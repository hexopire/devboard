// A middleware FACTORY, not a middleware itself — roleGuard(['admin']) is
// called once per route to produce the actual (req, res, next) function,
// closing over whichever roles that specific route allows. This is why it's
// usable as router.post('/teams', authMiddleware, roleGuard(['admin']), create)
// — each route gets its own closure with its own allowedRoles list, instead
// of one hardcoded middleware per role combination.
//
// Must run AFTER authMiddleware — it reads req.user.role, which authMiddleware
// is what attaches from the verified JWT payload.
function roleGuard(allowedRoles) {
  return function (req, res, next) {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'You do not have permission to perform this action' });
    }
    next();
  };
}

module.exports = { roleGuard };
