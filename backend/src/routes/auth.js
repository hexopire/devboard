const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');

const router = express.Router();

const VALID_ROLES = ['admin', 'member', 'viewer'];

// Compare this declarative chain to the hand-rolled version it replaces
// (Task 8.1's authController.js): each .rule() reads like the check it
// performs, and .withMessage() is the exact string the manual `if` used to
// return directly. Same coverage, no imperative if/return blocks to read
// top-to-bottom — but also no visibility into *why* a rule exists without
// jumping to docs, whereas the manual version's comments carried that
// context inline.
router.post(
  '/auth/register',
  body('name').trim().notEmpty().withMessage('name is required'),
  body('email').isEmail().withMessage('a valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('password must be at least 8 characters'),
  body('role').optional().isIn(VALID_ROLES).withMessage(`role must be one of: ${VALID_ROLES.join(', ')}`),
  validate,
  register
);
router.post(
  '/auth/login',
  body('email').trim().notEmpty().withMessage('email and password are required'),
  body('password').notEmpty().withMessage('email and password are required'),
  validate,
  login
);
// authMiddleware runs first — if the token is missing/invalid it responds
// 401 and getMe never runs. If it's valid, req.user is set and getMe runs next.
router.get('/auth/me', authMiddleware, getMe);

module.exports = router;
