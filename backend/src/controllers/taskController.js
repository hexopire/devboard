const {
  createTask,
  findTaskById,
  listTasksByProject,
  updateTask,
  deleteTask,
} = require('../db/taskQueries');
const { isTeamMember } = require('../db/teamMemberQueries');
const { resolveProjectAndCheckMembership } = require('../utils/membership');
const { asyncHandler } = require('../utils/asyncHandler');

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

// No try/catch below — asyncHandler (applied at module.exports) forwards
// any rejection to errorHandler.js, which already handles 22P02 (invalid
// task_status enum value) generically. The old per-function 22P02 catch
// here (returning "Invalid status value") is gone; errorHandler's "Invalid
// input value" covers it now, same trade-off as teamMemberController.js.

async function create(req, res) {
  const { projectId } = req.params;
  const { title, description, status, assigneeId, dueDate } = req.body;

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
}

async function listByProject(req, res) {
  const { projectId } = req.params;

  const { error } = await resolveProjectAndCheckMembership(projectId, req.user.id);
  if (error) {
    return res.status(error.status).json({ success: false, error: error.message });
  }

  const tasks = await listTasksByProject(projectId);
  return res.status(200).json({ success: true, data: { tasks } });
}

async function getById(req, res) {
  const { id } = req.params;

  const task = await findTaskById(id);
  if (!task) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }

  const { error } = await resolveProjectAndCheckMembership(task.project_id, req.user.id);
  if (error) {
    return res.status(error.status).json({ success: false, error: error.message });
  }

  return res.status(200).json({ success: true, data: { task } });
}

async function update(req, res) {
  const { id } = req.params;
  const { title, description, status, assigneeId, dueDate } = req.body;

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
}

async function remove(req, res) {
  const { id } = req.params;

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
}

module.exports = {
  create: asyncHandler(create),
  listByProject: asyncHandler(listByProject),
  getById: asyncHandler(getById),
  update: asyncHandler(update),
  remove: asyncHandler(remove),
};
