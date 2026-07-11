// Raw SQL queries for the teams table. Same parameterization approach as
// userQueries.js — values go through $1, $2... placeholders so pg sends
// them separately from the SQL text (no injection risk).
const pool = require('./pool');

// Creating a team must also make the creator a member (as 'lead') — otherwise
// Task 4.3's "list teams for this user" JOIN would never show a team to the
// person who just created it. Both inserts run on one checked-out client
// inside BEGIN/COMMIT so they succeed or fail together: if the team_members
// insert fails, ROLLBACK undoes the teams insert too, instead of leaving an
// orphaned team with no lead.
async function createTeam({ name, createdBy }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const teamResult = await client.query(
      `INSERT INTO teams (name, created_by)
       VALUES ($1, $2)
       RETURNING id, name, created_by, created_at`,
      [name, createdBy]
    );
    const team = teamResult.rows[0];

    await client.query(
      `INSERT INTO team_members (team_id, user_id, role_in_team)
       VALUES ($1, $2, 'lead')`,
      [team.id, createdBy]
    );

    await client.query('COMMIT');
    return team;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function findTeamById(id) {
  const result = await pool.query(
    `SELECT id, name, created_by, created_at FROM teams WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

// JOINs teams to team_members so we only return teams this specific user
// belongs to (as lead or member) — a plain "SELECT * FROM teams" can't
// express that scoping on its own, since teams has no user_id column.
// Also pulls role_in_team across the join: useful for the UI to show
// "you're a lead here" vs "you're a member here" without a second query.
async function listTeamsForUser(userId) {
  const result = await pool.query(
    `SELECT t.id, t.name, t.created_by, t.created_at, tm.role_in_team
     FROM teams t
     JOIN team_members tm ON tm.team_id = t.id
     WHERE tm.user_id = $1
     ORDER BY t.created_at DESC`,
    [userId]
  );
  return result.rows;
}

module.exports = { createTeam, findTeamById, listTeamsForUser };
