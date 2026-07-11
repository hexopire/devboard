const {
  createTask,
  findTaskById,
  listTasksByProject,
  updateTask,
  deleteTask,
} = require('../db/taskQueries');
const { findProjectById } = require('../db/projectQueries');
const { isTeamMember } = require('../db/teamMemberQueries');

// title/description/status/dueDate/assigneeId SHAPE checks (required,
// string type, one of the enum literals, YYYY-MM-DD format, positive
// integer) now live as express-validator chains in routes/tasks.js.
//
// This one check stays here instead: "is assigneeId an actual member of
// this task's team" needs a DB query and the project's team_id, which
// isn't resolved until resolveProjectAndCheckMembership runs below —
// express-validator COULD do this via an async .custom() validator, but
// that would mean the route file re-deriving project -> team_id itself,
// duplicating logic this controller already has to do anyway for the
// membership guard. Keeping DB-dependent rules next to the query that
// already has the data beats splitting one feature across two files.
async function validateAssignee(assigneeId, teamId) {
  if (assigneeId === undefined || assigneeId === null) {
    return null;
  }
  const assigneeIsMember = await isTeamMember(teamId, assigneeId);
  if (!assigneeIsMember) {
    return 'assigneeId must be a member of this team';
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
  const { projectId } = req.params;
  const { title, description, status, assigneeId, dueDate } = req.body;

  try {
    const { error, project } = await resolveProjectAndCheckMembership(projectId, req.user.id);
    if (error) {
      return res.status(error.status).json({ success: false, error: error.message });
    }

    const assigneeError = await validateAssignee(assigneeId, project.team_id);
    if (assigneeError) {
      return res.status(400).json({ success: false, error: assigneeError });
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
  const { projectId } = req.params;

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
  const { id } = req.params;

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
  const { id } = req.params;
  const { title, description, status, assigneeId, dueDate } = req.body;

  try {
    const existing = await findTaskById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const { error, project } = await resolveProjectAndCheckMembership(existing.project_id, req.user.id);
    if (error) {
      return res.status(error.status).json({ success: false, error: error.message });
    }

    const assigneeError = await validateAssignee(assigneeId, project.team_id);
    if (assigneeError) {
      return res.status(400).json({ success: false, error: assigneeError });
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
  const { id } = req.params;

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
