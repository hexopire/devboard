const { validationResult } = require('express-validator');

// express-validator's check chains (body(), param(), etc.) only ATTACH
// validation results to the request — they don't reject anything by
// themselves. This middleware is what actually reads those accumulated
// results and short-circuits with a 400 if any failed. Every route below
// runs its check chains, then this, then the controller — same three-step
// shape as authMiddleware -> roleGuard -> controller.
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // .array()[0] — report one error at a time, matching the manual
    // validation style from Task 8.1 (single `error` string), instead of
    // switching the response envelope shape mid-project.
    return res.status(400).json({ success: false, error: errors.array()[0].msg });
  }
  next();
}

module.exports = { validate };
