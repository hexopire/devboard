const { createTeam, findTeamById, listTeams } = require('../db/teamQueries');

// req.user.id comes from authMiddleware (verified JWT), so we trust it as
// the creator — the client never gets to say who "created" the team.
async function create(req, res) {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, error: 'name is required' });
  }

  try {
    const team = await createTeam({ name, createdBy: req.user.id });
    return res.status(201).json({ success: true, data: { team } });
  } catch (error) {
    console.error('Error creating team:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function getById(req, res) {
  const { id } = req.params;

  try {
    const team = await findTeamById(id);
    if (!team) {
      return res.status(404).json({ success: false, error: 'Team not found' });
    }
    return res.status(200).json({ success: true, data: { team } });
  } catch (error) {
    console.error('Error fetching team:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function list(req, res) {
  try {
    const teams = await listTeams();
    return res.status(200).json({ success: true, data: { teams } });
  } catch (error) {
    console.error('Error listing teams:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

module.exports = { create, getById, list };
