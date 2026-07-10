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

module.exports = { addTeamMember };
