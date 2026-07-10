// Raw SQL queries for the teams table. Same parameterization approach as
// userQueries.js — values go through $1, $2... placeholders so pg sends
// them separately from the SQL text (no injection risk).
const pool = require('./pool');

async function createTeam({ name, createdBy }) {
  const result = await pool.query(
    `INSERT INTO teams (name, created_by)
     VALUES ($1, $2)
     RETURNING id, name, created_by, created_at`,
    [name, createdBy]
  );
  return result.rows[0];
}

async function findTeamById(id) {
  const result = await pool.query(
    `SELECT id, name, created_by, created_at FROM teams WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

// Plain "all teams" listing for now. Task 4.3 replaces/adds a JOIN-based
// query that scopes this to only the teams a given user belongs to.
async function listTeams() {
  const result = await pool.query(
    `SELECT id, name, created_by, created_at FROM teams ORDER BY created_at DESC`
  );
  return result.rows;
}

module.exports = { createTeam, findTeamById, listTeams };
