// Raw SQL queries for the users table. All values go through $1, $2... placeholders
// — pg sends them separately from the SQL text, so the driver never treats user
// input as part of the query structure. String-concatenating values into SQL text
// is what SQL injection exploits; parameterization closes that off entirely.
const pool = require('./pool');

async function createUser({ name, email, passwordHash, role }) {
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at`,
    [name, email, passwordHash, role]
  );
  return result.rows[0];
}

async function findUserById(id) {
  const result = await pool.query(
    `SELECT id, name, email, role, created_at FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

// Includes password_hash — unlike findUserById, this is only ever called from
// server-side auth logic (register's dup check, login's compare step), never
// used to shape an API response directly. Callers must strip password_hash
// before sending any user object back to a client.
async function findUserByEmail(email) {
  const result = await pool.query(
    `SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0] || null;
}

module.exports = { createUser, findUserById, findUserByEmail };
