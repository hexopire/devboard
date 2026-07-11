const {
  createTask,
  findTaskById,
  listTasksByProject,
  updateTask,
  deleteTask,
} = require('../db/taskQueries');
const { findProjectById } = require('../db/projectQueries');
const { isTeamMember } = require('../db/teamMemberQueries');
const { isNonEmptyString, parseId, isValidDateString } = require('../utils/validators');

// Mirrors the Postgres task_status enum (migrations/005_create_tasks.sql).
// Checking against this list here means a bad status is caught with a clear
// app-level 400 before ever reaching the DB, instead of relying only on the
// 22P02 catch below (which still stays, as a safety net for anything that
// slips past this check).
const VALID_STATUSES = ['todo', 'in_progress', 'done'];

// Assignee must be a member of the task's own team — assigning a task to
// someone with no membership row would produce a task nobody on the team
// can attribute to a real teammate. Reuses the same isTeamMember check the
// membership guard already relies on, just against a different user id
// (the candidate assignee, not req.user).
async function validateTaskFields({ status, assigneeId }, teamId) {
  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return `status must be one of: ${VALID_STATUSES.join(', ')}`;
  }
  if (assigneeId !== undefined && assigneeId !== null) {
    const assigneeIsMember = await isTeamMember(teamId, assigneeId);
    if (!assigneeIsMember) {
      return 'assigneeId must be a member of this team';
    }
  }
  return null;
}

// Same membership-guard shape as projectController (Task 5.2): a task's
// team isn't on the task row directly — it's one hop further out, via
// task -> project -> team_id. Resolving that chain is what
// resolveProjectAndCheckMembership does, so every handler below shares it
// instead of repeating the two-query lookup five times.
async function resolveProjectAndCheckMembership(projectId, userId) {
  const project = await findProjectById(projectId);
  if (!project) {
    return { error: { status: 404, message: 'Project not found' } };
  }
  const isMember = await isTeamMember(project.team_id, userId);
  if (!isMember) {
    return { error: { status: 403, message: 'You are not a member of this team' } };
  }
  return { project };
}

async function create(req, res) {
  const projectId = parseId(req.params.projectId);
  if (projectId === null) {
    return res.status(400).json({ success: false, error: 'projectId must be a positive integer' });
  }

  const { title, description, status, assigneeId, dueDate } = req.body;

  if (!isNonEmptyString(title)) {
    return res.status(400).json({ success: false, error: 'title is required' });
  }
  if (description !== undefined && description !== null && typeof description !== 'string') {
    return res.status(400).json({ success: false, error: 'description must be a string' });
  }
  if (dueDate !== undefined && dueDate !== null && !isValidDateString(dueDate)) {
    return res.status(400).json({ success: false, error: 'dueDate must be in YYYY-MM-DD format' });
  }

  try {
    const { error, project } = await resolveProjectAndCheckMembership(projectId, req.user.id);
    if (error) {
      return res.status(error.status).json({ success: false, error: error.message });
    }

    const validationError = await validateTaskFields({ status, assigneeId }, project.team_id);
    if (validationError) {
      return res.status(400).json({ success: false, error: validationError });
    }

    const task = await createTask({
      projectId,
      title,
      description,
      status,
      assigneeId,
      createdBy: req.user.id,
      dueDate,
    });
    return res.status(201).json({ success: true, data: { task } });
  } catch (dbError) {
    // 22P02 = invalid_text_representation — thrown when `status` isn't one
    // of the task_status enum values. Task 7.2 adds proper enum validation
    // (and transition rules); this is just enough to avoid leaking a raw
    // Postgres error as a 500 in the meantime.
    if (dbError.code === '22P02') {
      return res.status(400).json({ success: false, error: 'Invalid status value' });
    }
    console.error('Error creating task:', dbError);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function listByProject(req, res) {
  const projectId = parseId(req.params.projectId);
  if (projectId === null) {
    return res.status(400).json({ success: false, error: 'projectId must be a positive integer' });
  }

  try {
    const { error } = await resolveProjectAndCheckMembership(projectId, req.user.id);
    if (error) {
      return res.status(error.status).json({ success: false, error: error.message });
    }

    const tasks = await listTasksByProject(projectId);
    return res.status(200).json({ success: true, data: { tasks } });
  } catch (dbError) {
    console.error('Error listing tasks:', dbError);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function getById(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ success: false, error: 'id must be a positive integer' });
  }

  try {
    const task = await findTaskById(id);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const { error } = await resolveProjectAndCheckMembership(task.project_id, req.user.id);
    if (error) {
      return res.status(error.status).json({ success: false, error: error.message });
    }

    return res.status(200).json({ success: true, data: { task } });
  } catch (dbError) {
    console.error('Error fetching task:', dbError);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function update(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ success: false, error: 'id must be a positive integer' });
  }

  const { title, description, status, assigneeId, dueDate } = req.body;
  if (title !== undefined && !isNonEmptyString(title)) {
    return res.status(400).json({ success: false, error: 'title must be a non-empty string' });
  }
  if (description !== undefined && description !== null && typeof description !== 'string') {
    return res.status(400).json({ success: false, error: 'description must be a string' });
  }
  if (dueDate !== undefined && dueDate !== null && !isValidDateString(dueDate)) {
    return res.status(400).json({ success: false, error: 'dueDate must be in YYYY-MM-DD format' });
  }

  try {
    const existing = await findTaskById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const { error, project } = await resolveProjectAndCheckMembership(existing.project_id, req.user.id);
    if (error) {
      return res.status(error.status).json({ success: false, error: error.message });
    }

    const validationError = await validateTaskFields({ status, assigneeId }, project.team_id);
    if (validationError) {
      return res.status(400).json({ success: false, error: validationError });
    }

    const task = await updateTask(id, { title, description, status, assigneeId, dueDate });
    return res.status(200).json({ success: true, data: { task } });
  } catch (dbError) {
    if (dbError.code === '22P02') {
      return res.status(400).json({ success: false, error: 'Invalid status value' });
    }
    console.error('Error updating task:', dbError);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function remove(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ success: false, error: 'id must be a positive integer' });
  }

  try {
    const existing = await findTaskById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const { error } = await resolveProjectAndCheckMembership(existing.project_id, req.user.id);
    if (error) {
      return res.status(error.status).json({ success: false, error: error.message });
    }

    await deleteTask(id);
    return res.status(200).json({ success: true, data: { message: 'Task deleted' } });
  } catch (dbError) {
    console.error('Error deleting task:', dbError);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

module.exports = { create, listByProject, getById, update, remove };
