const { createComment, listCommentsByTask } = require('../db/commentQueries');
const { findTaskById } = require('../db/taskQueries');
const { findProjectById } = require('../db/projectQueries');
const { isTeamMember } = require('../db/teamMemberQueries');

// Third FK hop: a comment's team is comment -> task -> project -> team_id.
// Same shape as taskController's resolveProjectAndCheckMembership, just one
// level further out — task first, then project, then the membership check.
async function resolveTaskAndCheckMembership(taskId, userId) {
  const task = await findTaskById(taskId);
  if (!task) {
    return { error: { status: 404, message: 'Task not found' } };
  }
  const project = await findProjectById(task.project_id);
  const isMember = await isTeamMember(project.team_id, userId);
  if (!isMember) {
    return { error: { status: 403, message: 'You are not a member of this team' } };
  }
  return { task };
}

// req.user.id is the comment's author — trusted from the verified JWT, same
// as createdBy on tasks/teams. The client never gets to say who wrote it.
async function create(req, res) {
  const { taskId } = req.params;
  const { body } = req.body;

  try {
    const { error } = await resolveTaskAndCheckMembership(taskId, req.user.id);
    if (error) {
      return res.status(error.status).json({ success: false, error: error.message });
    }

    const comment = await createComment({ taskId, userId: req.user.id, body });
    return res.status(201).json({ success: true, data: { comment } });
  } catch (dbError) {
    console.error('Error creating comment:', dbError);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function listByTask(req, res) {
  const { taskId } = req.params;

  try {
    const { error } = await resolveTaskAndCheckMembership(taskId, req.user.id);
    if (error) {
      return res.status(error.status).json({ success: false, error: error.message });
    }

    const comments = await listCommentsByTask(taskId);
    return res.status(200).json({ success: true, data: { comments } });
  } catch (dbError) {
    console.error('Error listing comments:', dbError);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

module.exports = { create, listByTask };
