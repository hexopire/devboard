const express = require('express');
const { body, param } = require('express-validator');
const { create, listByTeam, getById, update, remove } = require('../controllers/projectController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { roleGuard } = require('../middleware/roleGuard');
const { validate } = require('../middleware/validate');

const router = express.Router();

const teamIdParam = param('teamId').isInt({ min: 1 }).withMessage('teamId must be a positive integer').toInt();
const idParam = param('id').isInt({ min: 1 }).withMessage('id must be a positive integer').toInt();
const nameBody = body('name').trim().notEmpty().withMessage('name is required');
const optionalNameBody = body('name').optional().trim().notEmpty().withMessage('name must be a non-empty string');
const descriptionBody = body('description').optional({ nullable: true }).isString().withMessage('description must be a string');

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
router.post(
  '/teams/:teamId/projects',
  authMiddleware,
  roleGuard(['admin', 'member']),
  teamIdParam,
  nameBody,
  descriptionBody,
  validate,
  create
);
router.get('/teams/:teamId/projects', authMiddleware, teamIdParam, validate, listByTeam);
router.get('/projects/:id', authMiddleware, idParam, validate, getById);
// Task 17.1's QA pass found update/delete had NO role restriction at all —
// only membership — which let a viewer edit or delete any project on
// their team. There's no separate "edit/delete project" row in the
// Section 6 table (and projects have no created_by column, so an
// ownership check like tasks' delete restriction isn't even possible
// here), so this mirrors "Create project in team"'s role gate instead:
// Admin + Member, Viewer blocked.
router.patch(
  '/projects/:id',
  authMiddleware,
  roleGuard(['admin', 'member']),
  idParam,
  optionalNameBody,
  descriptionBody,
  validate,
  update
);
router.delete('/projects/:id', authMiddleware, roleGuard(['admin', 'member']), idParam, validate, remove);

module.exports = router;
