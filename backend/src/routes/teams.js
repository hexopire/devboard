const express = require('express');
const { create, getById, list } = require('../controllers/teamController');
const { addMember } = require('../controllers/teamMemberController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// All team routes require a logged-in user for now. Role-based restriction
// (PRD: "create team" is admin-only) is deferred to Day 6's roleGuard —
// Task 4.1 is scoped to plain CRUD mechanics only.
router.post('/teams', authMiddleware, create);
router.get('/teams', authMiddleware, list);
router.get('/teams/:id', authMiddleware, getById);
// Adding members is also unrestricted for now (PRD: only a team lead should
// add members) — same Day 6 roleGuard deferral as team creation above.
router.post('/teams/:id/members', authMiddleware, addMember);

module.exports = router;
