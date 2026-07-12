const { createTeam, findTeamById, listTeamsForUser } = require('../db/teamQueries');
const { isTeamMember } = require('../db/teamMemberQueries');
const { asyncHandler } = require('../utils/asyncHandler');

// req.user.id comes from authMiddleware (verified JWT), so we trust it as
// the creator — the client never gets to say who "created" the team.
// name/id shape checks now live as express-validator chains in routes/teams.js.
async function create(req, res) {
  const { name } = req.body;
  const team = await createTeam({ name, createdBy: req.user.id });
  return res.status(201).json({ success: true, data: { team } });
}

// Task 17.1's QA pass found this route had NO membership check since Task
// 4.1 built it — before Task 5.2 introduced the membership-guard pattern
// for projects, and this one never got retrofitted. "View everything in
// their team" (Section 6 table) means their team, not any team whose id
// you happen to know.
async function getById(req, res) {
  const { id } = req.params;
  const team = await findTeamById(id);
  if (!team) {
    return res.status(404).json({ success: false, error: 'Team not found' });
  }

  const isMember = await isTeamMember(id, req.user.id);
  if (!isMember) {
    return res.status(403).json({ success: false, error: 'You are not a member of this team' });
  }

  return res.status(200).json({ success: true, data: { team } });
}

// Scoped to req.user.id — "list teams" means "teams I belong to", not
// every team in the system.
async function list(req, res) {
  const teams = await listTeamsForUser(req.user.id);
  return res.status(200).json({ success: true, data: { teams } });
}

module.exports = {
  create: asyncHandler(create),
  getById: asyncHandler(getById),
  list: asyncHandler(list),
};
