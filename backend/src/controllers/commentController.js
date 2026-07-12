const { createComment, listCommentsByTask } = require('../db/commentQueries');
const { resolveTaskAndCheckMembership } = require('../utils/membership');
const { asyncHandler } = require('../utils/asyncHandler');

// req.user.id is the comment's author — trusted from the verified JWT, same
// as createdBy on tasks/teams. The client never gets to say who wrote it.
async function create(req, res) {
  const { taskId } = req.params;
  const { body } = req.body;

  const { error } = await resolveTaskAndCheckMembership(taskId, req.user.id);
  if (error) {
    return res.status(error.status).json({ success: false, error: error.message });
  }

  const comment = await createComment({ taskId, userId: req.user.id, body });
  return res.status(201).json({ success: true, data: { comment } });
}

async function listByTask(req, res) {
  const { taskId } = req.params;

  const { error } = await resolveTaskAndCheckMembership(taskId, req.user.id);
  if (error) {
    return res.status(error.status).json({ success: false, error: error.message });
  }

  const comments = await listCommentsByTask(taskId);
  return res.status(200).json({ success: true, data: { comments } });
}

module.exports = {
  create: asyncHandler(create),
  listByTask: asyncHandler(listByTask),
};
