const express = require('express');
const { create, listByTeam, getById, update, remove } = require('../controllers/projectController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { roleGuard } = require('../middleware/roleGuard');

const router = express.Router();

// Nested-under-team routes for create/list, flat routes for single-resource
// get/update/delete — same convention the PRD's REST contract uses.
//
// Section 6 table: "Create project in team" is Admin ✅, Member ✅ (if team
// lead), Viewer ❌. roleGuard only reads the global users.role, so it can
// exclude Viewer, but it can't express "Member only if team lead" — that's
// team_members.role_in_team, a different field this middleware never looks
// at. So right now: admin/member both pass roleGuard, viewer is blocked, and
// the lead-only restriction on members is NOT enforced. Flagging this as a
// known gap rather than silently treating "applied roleGuard" as "fully
// matches the table."
router.post('/teams/:teamId/projects', authMiddleware, roleGuard(['admin', 'member']), create);
router.get('/teams/:teamId/projects', authMiddleware, listByTeam);
router.get('/projects/:id', authMiddleware, getById);
router.patch('/projects/:id', authMiddleware, update);
router.delete('/projects/:id', authMiddleware, remove);

module.exports = router;
