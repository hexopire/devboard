// Loads .env into process.env before anything else touches config.
require('dotenv').config();

const express = require('express');
const healthRoutes = require('./routes/health');

const app = express();

// Parses JSON request bodies into req.body. Needed before any route reads req.body.
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ success: true, data: { message: 'DevBoard backend is running' } });
});

app.use('/api/v1', healthRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`DevBoard backend listening on http://localhost:${PORT}`);
});
