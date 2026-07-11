const {
  createProject,
  findProjectById,
  listProjectsByTeam,
  updateProject,
  deleteProject,
} = require('../db/projectQueries');
const { findTeamById } = require('../db/teamQueries');
const { isTeamMember } = require('../db/teamMemberQueries');
const { isNonEmptyString, parseId } = require('../utils/validators');

// Role-based auth (e.g. "only a lead can create a project") is still
// deferred to Day 6's roleGuard. This task adds the coarser check the PRD
// calls for first: you must belong to the team at all, regardless of role.

async function create(req, res) {
  const teamId = parseId(req.params.teamId);
  if (teamId === null) {
    return res.status(400).json({ success: false, error: 'teamId must be a positive integer' });
  }

  const { name, description } = req.body;

  if (!isNonEmptyString(name)) {
    return res.status(400).json({ success: false, error: 'name is required' });
  }
  if (description !== undefined && description !== null && typeof description !== 'string') {
    return res.status(400).json({ success: false, error: 'description must be a string' });
  }

  try {
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
  } catch (error) {
    console.error('Error creating project:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function listByTeam(req, res) {
  const teamId = parseId(req.params.teamId);
  if (teamId === null) {
    return res.status(400).json({ success: false, error: 'teamId must be a positive integer' });
  }

  try {
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
  } catch (error) {
    console.error('Error listing projects:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function getById(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ success: false, error: 'id must be a positive integer' });
  }

  try {
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
  } catch (error) {
    console.error('Error fetching project:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function update(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ success: false, error: 'id must be a positive integer' });
  }

  const { name, description } = req.body;
  if (name !== undefined && !isNonEmptyString(name)) {
    return res.status(400).json({ success: false, error: 'name must be a non-empty string' });
  }
  if (description !== undefined && description !== null && typeof description !== 'string') {
    return res.status(400).json({ success: false, error: 'description must be a string' });
  }

  try {
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
  } catch (error) {
    console.error('Error updating project:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function remove(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ success: false, error: 'id must be a positive integer' });
  }

  try {
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
  } catch (error) {
    console.error('Error deleting project:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

module.exports = { create, listByTeam, getById, update, remove };
