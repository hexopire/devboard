// Loads .env into process.env before anything else touches config.
require('dotenv').config();

const express = require('express');
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const teamRoutes = require('./routes/teams');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const commentRoutes = require('./routes/comments');

const app = express();

// Parses JSON request bodies into req.body. Needed before any route reads req.body.
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ success: true, data: { message: 'DevBoard backend is running' } });
});

app.use('/api/v1', healthRoutes);
app.use('/api/v1', authRoutes);
app.use('/api/v1', teamRoutes);
app.use('/api/v1', projectRoutes);
app.use('/api/v1', taskRoutes);
app.use('/api/v1', commentRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`DevBoard backend listening on http://localhost:${PORT}`);
});
