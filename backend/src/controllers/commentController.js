const { createComment, listCommentsByTask } = require('../db/commentQueries');
const { resolveTaskAndCheckMembership } = require('../utils/membership');

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
