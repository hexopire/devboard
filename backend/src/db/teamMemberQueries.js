// Raw SQL for the team_members join table (the User <-> Team many-to-many).
const pool = require('./pool');

async function addTeamMember({ teamId, userId, role }) {
  const result = await pool.query(
    `INSERT INTO team_members (team_id, user_id, role_in_team)
     VALUES ($1, $2, $3)
     RETURNING team_id, user_id, role_in_team, joined_at`,
    [teamId, userId, role]
  );
  return result.rows[0];
}

// Existence check for the membership authorization guard — 1 if (teamId,
// userId) is a row in team_members, 0 otherwise. Composite PK means this is
// a direct index lookup, not a scan.
async function isTeamMember(teamId, userId) {
  const result = await pool.query(
    `SELECT 1 FROM team_members WHERE team_id = $1 AND user_id = $2`,
    [teamId, userId]
  );
  return result.rowCount > 0;
}

// Joins users in to surface name/email alongside role_in_team — the
// frontend's assignee dropdown (Task 15.2) needs a human-readable label,
// not just a bare user_id.
async function listMembersByTeam(teamId) {
  const result = await pool.query(
    `SELECT u.id, u.name, u.email, tm.role_in_team, tm.joined_at
     FROM team_members tm
     JOIN users u ON u.id = tm.user_id
     WHERE tm.team_id = $1
     ORDER BY tm.joined_at ASC`,
    [teamId]
  );
  return result.rows;
}

module.exports = { addTeamMember, isTeamMember, listMembersByTeam };
