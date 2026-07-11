const { addTeamMember } = require('../db/teamMemberQueries');

// id/userId/role shape checks now live as express-validator chains in
// routes/teams.js — this controller trusts req.params.id and req.body are
// already well-formed by the time it runs.
async function addMember(req, res) {
  const { id: teamId } = req.params;
  const { userId, role } = req.body;
  const roleInTeam = role || 'member';

  try {
    const membership = await addTeamMember({ teamId, userId, role: roleInTeam });
    return res.status(201).json({ success: true, data: { membership } });
  } catch (error) {
    // 23505 = unique_violation. The composite PRIMARY KEY (team_id, user_id)
    // is what fires this — it's both the natural key and the uniqueness
    // constraint, so a second add-attempt hits the PK, not a separate index.
    if (error.code === '23505') {
      return res.status(400).json({ success: false, error: 'User is already a member of this team' });
    }
    // 23503 = foreign_key_violation — teamId or userId doesn't exist.
    if (error.code === '23503') {
      return res.status(404).json({ success: false, error: 'Team or user not found' });
    }
    console.error('Error adding team member:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

module.exports = { addMember };
