// A Pool keeps a set of open TCP connections to Postgres ready to hand out.
// Without pooling, every query would open+auth+close a fresh connection —
// expensive. The pool reuses idle connections across concurrent requests.
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Surface connection-level errors (e.g. DB restarts) instead of letting
// them crash the process silently as unhandled 'error' events.
pool.on('error', (err) => {
  console.error('Unexpected error on idle Postgres client', err);
});

module.exports = pool;
