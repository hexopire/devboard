const express = require('express');
const { body, param } = require('express-validator');
const { create, getById, list } = require('../controllers/teamController');
const { addMember } = require('../controllers/teamMemberController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { roleGuard } = require('../middleware/roleGuard');
const { validate } = require('../middleware/validate');

const router = express.Router();

const TEAM_MEMBER_ROLES = ['lead', 'member'];

// Section 6 table: "Create team" is Admin-only, Member/Viewer both ❌.
router.post(
  '/teams',
  authMiddleware,
  roleGuard(['admin']),
  body('name').trim().notEmpty().withMessage('name is required'),
  validate,
  create
);
router.get('/teams', authMiddleware, list);
router.get(
  '/teams/:id',
  authMiddleware,
  param('id').isInt({ min: 1 }).withMessage('id must be a positive integer').toInt(),
  validate,
  getById
);
// "Add member" isn't a row in the Section 6 permissions table (that table
// only covers team/project/task actions), so it's left unrestricted here —
// not a Day 6 scope gap, just genuinely out of that table's scope.
router.post(
  '/teams/:id/members',
  authMiddleware,
  param('id').isInt({ min: 1 }).withMessage('id must be a positive integer').toInt(),
  body('userId').isInt({ min: 1 }).withMessage('userId is required and must be a positive integer').toInt(),
  body('role').optional().isIn(TEAM_MEMBER_ROLES).withMessage(`role must be one of: ${TEAM_MEMBER_ROLES.join(', ')}`),
  validate,
  addMember
);

module.exports = router;
