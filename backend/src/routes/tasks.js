const express = require('express');
const { create, listByProject, getById, update, remove } = require('../controllers/taskController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { roleGuard } = require('../middleware/roleGuard');

const router = express.Router();

// Section 6 table:
// - "Create/edit task": Admin + Member, Viewer ❌ — roleGuard on create/update.
// - "Delete task": Admin ✅, Member ✅ but "(own)" only, Viewer ❌. roleGuard
//   can't express "only your own task" (that needs comparing task.created_by
//   to req.user.id, a per-resource check, not a role check) — same kind of
//   gap as the "member only if team lead" note on project creation (Task 6.2).
//   Flagging it rather than silently allowing any member to delete any task.
// - "View everything in their team": all three roles — no roleGuard on the
//   GET routes, just the membership check already inside the controller.
router.post('/projects/:projectId/tasks', authMiddleware, roleGuard(['admin', 'member']), create);
router.get('/projects/:projectId/tasks', authMiddleware, listByProject);
router.get('/tasks/:id', authMiddleware, getById);
router.patch('/tasks/:id', authMiddleware, roleGuard(['admin', 'member']), update);
router.delete('/tasks/:id', authMiddleware, roleGuard(['admin', 'member']), remove);

module.exports = router;
