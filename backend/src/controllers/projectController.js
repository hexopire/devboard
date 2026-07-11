const {
  createProject,
  findProjectById,
  listProjectsByTeam,
  updateProject,
  deleteProject,
} = require('../db/projectQueries');
const { findTeamById } = require('../db/teamQueries');

// Membership/role checks are deferred to Task 5.2 (basic membership guard)
// and Day 6 (role-based roleGuard) — this task is scoped to plain nested
// CRUD mechanics: any authenticated user can hit these routes for now.

async function create(req, res) {
  const { teamId } = req.params;
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, error: 'name is required' });
  }

  try {
    const team = await findTeamById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, error: 'Team not found' });
    }

    const project = await createProject({ teamId, name, description });
    return res.status(201).json({ success: true, data: { project } });
  } catch (error) {
    console.error('Error creating project:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function listByTeam(req, res) {
  const { teamId } = req.params;

  try {
    const team = await findTeamById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, error: 'Team not found' });
    }

    const projects = await listProjectsByTeam(teamId);
    return res.status(200).json({ success: true, data: { projects } });
  } catch (error) {
    console.error('Error listing projects:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function getById(req, res) {
  const { id } = req.params;

  try {
    const project = await findProjectById(id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    return res.status(200).json({ success: true, data: { project } });
  } catch (error) {
    console.error('Error fetching project:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function update(req, res) {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const existing = await findProjectById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const project = await updateProject(id, { name, description });
    return res.status(200).json({ success: true, data: { project } });
  } catch (error) {
    console.error('Error updating project:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function remove(req, res) {
  const { id } = req.params;

  try {
    const deleted = await deleteProject(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    return res.status(200).json({ success: true, data: { message: 'Project deleted' } });
  } catch (error) {
    console.error('Error deleting project:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

module.exports = { create, listByTeam, getById, update, remove };
