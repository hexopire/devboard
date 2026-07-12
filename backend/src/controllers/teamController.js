const { createTeam, findTeamById, listTeamsForUser } = require('../db/teamQueries');
const { asyncHandler } = require('../utils/asyncHandler');

// req.user.id comes from authMiddleware (verified JWT), so we trust it as
// the creator — the client never gets to say who "created" the team.
// name/id shape checks now live as express-validator chains in routes/teams.js.
async function create(req, res) {
  const { name } = req.body;
  const team = await createTeam({ name, createdBy: req.user.id });
  return res.status(201).json({ success: true, data: { team } });
}

async function getById(req, res) {
  const { id } = req.params;
  const team = await findTeamById(id);
  if (!team) {
    return res.status(404).json({ success: false, error: 'Team not found' });
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
