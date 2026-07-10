// Loads .env into process.env before anything else touches config.
require('dotenv').config();

const express = require('express');
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const { authMiddleware } = require('./middleware/authMiddleware');

const app = express();

// Parses JSON request bodies into req.body. Needed before any route reads req.body.
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ success: true, data: { message: 'DevBoard backend is running' } });
});

app.use('/api/v1', healthRoutes);
app.use('/api/v1', authRoutes);

// Temporary route to manually verify authMiddleware for Task 3.2.
// Task 3.3 replaces this with the real GET /auth/me route/controller.
app.get('/api/v1/protected-test', authMiddleware, (req, res) => {
  res.json({ success: true, data: { message: 'You are authenticated', user: req.user } });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`DevBoard backend listening on http://localhost:${PORT}`);
});
