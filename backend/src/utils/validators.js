// Small hand-rolled validation helpers, shared across controllers. Day 8's
// point is to feel exactly what these check and what shape the errors take
// BEFORE Task 8.2 swaps this for express-validator — so this stays deliberately
// plain (no schema objects, no chained rule builders).

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

// Route params (req.params.id, etc.) always arrive as strings. Passing a
// non-numeric one straight into a `WHERE id = $1` against an INTEGER column
// makes Postgres throw "invalid input syntax for type integer" (code 22P02)
// — a raw DB error, not a clean 400. Parsing and validating here catches
// that before the query ever runs.
function parseId(value) {
  if (!/^\d+$/.test(String(value))) {
    return null;
  }
  return parseInt(value, 10);
}

// Deliberately loose — checks shape (something@something.something), not
// full RFC 5322 compliance. A learning-project validation pass should catch
// obvious typos, not replace a real email-verification flow.
function isValidEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// YYYY-MM-DD only, matching the <input type="date"> format the frontend
// will send later, and what Postgres's DATE type parses without ambiguity.
function isValidDateString(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

module.exports = { isNonEmptyString, parseId, isValidEmail, isValidDateString };
