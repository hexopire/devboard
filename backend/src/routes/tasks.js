const express = require('express');
const { body, param } = require('express-validator');
const { create, listByProject, getById, update, remove } = require('../controllers/taskController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { roleGuard } = require('../middleware/roleGuard');
const { validate } = require('../middleware/validate');

const router = express.Router();

// Mirrors migrations/005_create_tasks.sql's task_status enum. Kept here
// (not in taskController.js) because it's pure shape validation — no DB
// needed to check "is this string one of three literals." Contrast with
// assigneeId's "must be an actual team member" check, which DOES need a
// query and stays in the controller — see taskController.js for why.
const VALID_STATUSES = ['todo', 'in_progress', 'done'];

const projectIdParam = param('projectId').isInt({ min: 1 }).withMessage('projectId must be a positive integer').toInt();
const idParam = param('id').isInt({ min: 1 }).withMessage('id must be a positive integer').toInt();
const titleBody = body('title').trim().notEmpty().withMessage('title is required');
const optionalTitleBody = body('title').optional().trim().notEmpty().withMessage('title must be a non-empty string');
const descriptionBody = body('description').optional({ nullable: true }).isString().withMessage('description must be a string');
const statusBody = body('status').optional().isIn(VALID_STATUSES).withMessage(`status must be one of: ${VALID_STATUSES.join(', ')}`);
const dueDateBody = body('dueDate').optional({ nullable: true }).isISO8601().withMessage('dueDate must be in YYYY-MM-DD format').isLength({ min: 10, max: 10 }).withMessage('dueDate must be in YYYY-MM-DD format');
const assigneeIdBody = body('assigneeId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('assigneeId must be a positive integer').toInt();

// Section 6 table:
// - "Create/edit task": Admin + Member, Viewer ❌ — roleGuard on create/update.
//   No "(own)" restriction on edit — any team member can edit any task,
//   matching the table exactly (only the delete row has that qualifier).
// - "Delete task": Admin ✅, Member ✅ but "(own)" only, Viewer ❌. roleGuard
//   only narrows by role (blocks viewer); the "only your own task" part needs
//   comparing task.created_by to req.user.id, a per-resource check roleGuard
//   can't express — that ownership check lives in taskController.js's
//   remove(), after the membership guard runs.
// - "View everything in their team": all three roles — no roleGuard on the
//   GET routes, just the membership check already inside the controller.
router.post(
  '/projects/:projectId/tasks',
  authMiddleware,
  roleGuard(['admin', 'member']),
  projectIdParam,
  titleBody,
  descriptionBody,
  statusBody,
  dueDateBody,
  assigneeIdBody,
  validate,
  create
);
router.get('/projects/:projectId/tasks', authMiddleware, projectIdParam, validate, listByProject);
router.get('/tasks/:id', authMiddleware, idParam, validate, getById);
router.patch(
  '/tasks/:id',
  authMiddleware,
  roleGuard(['admin', 'member']),
  idParam,
  optionalTitleBody,
  descriptionBody,
  statusBody,
  dueDateBody,
  assigneeIdBody,
  validate,
  update
);
router.delete('/tasks/:id', authMiddleware, roleGuard(['admin', 'member']), idParam, validate, remove);

module.exports = router;
