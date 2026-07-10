const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
// authMiddleware runs first — if the token is missing/invalid it responds
// 401 and getMe never runs. If it's valid, req.user is set and getMe runs next.
router.get('/auth/me', authMiddleware, getMe);

module.exports = router;
