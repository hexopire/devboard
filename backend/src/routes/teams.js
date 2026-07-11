const express = require('express');
const { create, getById, list } = require('../controllers/teamController');
const { addMember } = require('../controllers/teamMemberController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { roleGuard } = require('../middleware/roleGuard');

const router = express.Router();

// Section 6 table: "Create team" is Admin-only, Member/Viewer both ❌.
router.post('/teams', authMiddleware, roleGuard(['admin']), create);
router.get('/teams', authMiddleware, list);
router.get('/teams/:id', authMiddleware, getById);
// "Add member" isn't a row in the Section 6 permissions table (that table
// only covers team/project/task actions), so it's left unrestricted here —
// not a Day 6 scope gap, just genuinely out of that table's scope.
router.post('/teams/:id/members', authMiddleware, addMember);

module.exports = router;
