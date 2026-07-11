const express = require('express');
const { param, body } = require('express-validator');
const { create, listByTask } = require('../controllers/commentController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');

const router = express.Router();

// Section 6 table: "Comment on task" is Admin ✅ Member ✅ Viewer ✅ — no
// roleGuard here, unlike task create/update/delete. Everyone who's on the
// team can comment; the only gate is the membership check inside the
// controller (same as the GET routes on teams/projects/tasks).
const taskIdParam = param('taskId').isInt({ min: 1 }).withMessage('taskId must be a positive integer').toInt();

router.post(
  '/tasks/:taskId/comments',
  authMiddleware,
  taskIdParam,
  body('body').trim().notEmpty().withMessage('body is required'),
  validate,
  create
);
router.get('/tasks/:taskId/comments', authMiddleware, taskIdParam, validate, listByTask);

module.exports = router;
