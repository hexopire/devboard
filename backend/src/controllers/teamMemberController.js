const { addTeamMember, isTeamMember, listMembersByTeam } = require('../db/teamMemberQueries');
const { asyncHandler } = require('../utils/asyncHandler');

// id/userId/role shape checks now live as express-validator chains in
// routes/teams.js — this controller trusts req.params.id and req.body are
// already well-formed by the time it runs.
//
// The 23505 (duplicate membership) / 23503 (bad team/user id) translation
// that used to live here as a manual try/catch moved to errorHandler.js —
// asyncHandler forwards any thrown/rejected error there automatically. The
// trade-off: errorHandler's messages are generic ("This resource already
// exists") instead of this route's specific "User is already a member of
// this team." Centralizing means one place to update if the mapping ever
// changes, at the cost of that per-route wording.
async function addMember(req, res) {
  const { id: teamId } = req.params;
  const { userId, role } = req.body;
  const roleInTeam = role || 'member';

  const membership = await addTeamMember({ teamId, userId, role: roleInTeam });
  return res.status(201).json({ success: true, data: { membership } });
}

// Not in the Section 6 table (same as addMember above) — gated by
// membership only, matching every other GET on a team-scoped resource
// (projects, tasks): you must belong to the team to see who else does.
async function listByTeam(req, res) {
  const { id: teamId } = req.params;

  const isMember = await isTeamMember(teamId, req.user.id);
  if (!isMember) {
    return res.status(403).json({ success: false, error: 'You are not a member of this team' });
  }

  const members = await listMembersByTeam(teamId);
  return res.status(200).json({ success: true, data: { members } });
}

module.exports = { addMember: asyncHandler(addMember), listByTeam: asyncHandler(listByTeam) };
