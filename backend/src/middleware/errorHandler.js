// A FOUR-argument function is what tells Express "this is error-handling
// middleware," not a regular one — the arity (err, req, res, next) is
// checked, not just the names. Regular middleware/routes only take up to
// three (req, res, next); adding the leading `err` param is the entire
// signal. Express skips every normal app.use()/router.get() when routing
// an error and jumps straight to the first matching 4-arg function — which
// is also why this must be registered LAST in app.js: anything mounted
// after it would never run once an error is already being handled.
//
// Centralizing these Postgres error-code translations here means every
// controller that used to duplicate `if (err.code === '23505') {...}` can
// eventually just `throw` (or call next(err)) and let this one place
// decide the HTTP response — Task 11.2 does that migration across
// controllers using an async-handler wrapper. For now, this only fires for
// errors explicitly passed to next(err), or thrown synchronously.
function errorHandler(err, req, res, next) {
  console.error(err);

  // 23505 = unique_violation (e.g. adding a team member who's already on
  // the team — the composite PK catches this, not an app-level check).
  if (err.code === '23505') {
    return res.status(400).json({ success: false, error: 'This resource already exists' });
  }
  // 23503 = foreign_key_violation (referencing a team/user/task id that
  // doesn't exist).
  if (err.code === '23503') {
    return res.status(404).json({ success: false, error: 'A related resource was not found' });
  }
  // 22P02 = invalid_text_representation (e.g. an invalid task_status enum
  // value reaching the DB despite the express-validator check).
  if (err.code === '22P02') {
    return res.status(400).json({ success: false, error: 'Invalid input value' });
  }

  // Anything else: use err.status if the thrower set one, otherwise treat
  // it as an unexpected server-side failure. Never leak err.message for a
  // raw DB/driver error here — those are logged above for developers, but
  // the client just gets a generic message.
  const status = err.status || 500;
  const message = status === 500 ? 'Internal server error' : err.message;
  return res.status(status).json({ success: false, error: message });
}

module.exports = { errorHandler };
