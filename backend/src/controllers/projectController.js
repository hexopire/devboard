const {
  createProject,
  findProjectById,
  listProjectsByTeam,
  updateProject,
  deleteProject,
} = require('../db/projectQueries');
const { findTeamById } = require('../db/teamQueries');
const { isTeamMember } = require('../db/teamMemberQueries');
const { asyncHandler } = require('../utils/asyncHandler');

// Role-based auth (e.g. "only a lead can create a project") is still
// deferred to Day 6's roleGuard. This task adds the coarser check the PRD
// calls for first: you must belong to the team at all, regardless of role.
// Shape checks (teamId/id/name/description) now live as express-validator
// chains in routes/projects.js.

async function create(req, res) {
  const { teamId } = req.params;
  const { name, description } = req.body;

  const team = await findTeamById(teamId);
  if (!team) {
    return res.status(404).json({ success: false, error: 'Team not found' });
  }

  const isMember = await isTeamMember(teamId, req.user.id);
  if (!isMember) {
    return res.status(403).json({ success: false, error: 'You are not a member of this team' });
  }

  const project = await createProject({ teamId, name, description });
  return res.status(201).json({ success: true, data: { project } });
}

async function listByTeam(req, res) {
  const { teamId } = req.params;

  const team = await findTeamById(teamId);
  if (!team) {
    return res.status(404).json({ success: false, error: 'Team not found' });
  }

  const isMember = await isTeamMember(teamId, req.user.id);
  if (!isMember) {
    return res.status(403).json({ success: false, error: 'You are not a member of this team' });
  }

  const projects = await listProjectsByTeam(teamId);
  return res.status(200).json({ success: true, data: { projects } });
}

async function getById(req, res) {
  const { id } = req.params;

  const project = await findProjectById(id);
  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }

  // Membership is checked against the project's own team_id, not a
  // teamId from the URL — this route is flat (/projects/:id), so the
  // team has to be looked up from the resource itself.
  const isMember = await isTeamMember(project.team_id, req.user.id);
  if (!isMember) {
    return res.status(403).json({ success: false, error: 'You are not a member of this team' });
  }

  return res.status(200).json({ success: true, data: { project } });
}

async function update(req, res) {
  const { id } = req.params;
  const { name, description } = req.body;

  const existing = await findProjectById(id);
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }

  const isMember = await isTeamMember(existing.team_id, req.user.id);
  if (!isMember) {
    return res.status(403).json({ success: false, error: 'You are not a member of this team' });
  }

  const project = await updateProject(id, { name, description });
  return res.status(200).json({ success: true, data: { project } });
}

async function remove(req, res) {
  const { id } = req.params;

  const existing = await findProjectById(id);
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }

  const isMember = await isTeamMember(existing.team_id, req.user.id);
  if (!isMember) {
    return res.status(403).json({ success: false, error: 'You are not a member of this team' });
  }

  await deleteProject(id);
  return res.status(200).json({ success: true, data: { message: 'Project deleted' } });
}

module.exports = {
  create: asyncHandler(create),
  listByTeam: asyncHandler(listByTeam),
  getById: asyncHandler(getById),
  update: asyncHandler(update),
  remove: asyncHandler(remove),
};
