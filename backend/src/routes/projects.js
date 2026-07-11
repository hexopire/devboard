const express = require('express');
const { create, listByTeam, getById, update, remove } = require('../controllers/projectController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Nested-under-team routes for create/list, flat routes for single-resource
// get/update/delete — same convention the PRD's REST contract uses.
router.post('/teams/:teamId/projects', authMiddleware, create);
router.get('/teams/:teamId/projects', authMiddleware, listByTeam);
router.get('/projects/:id', authMiddleware, getById);
router.patch('/projects/:id', authMiddleware, update);
router.delete('/projects/:id', authMiddleware, remove);

module.exports = router;
