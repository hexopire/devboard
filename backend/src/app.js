// Loads .env into process.env before anything else touches config.
require('dotenv').config();

const express = require('express');

const app = express();

// Parses JSON request bodies into req.body. Needed before any route reads req.body.
app.use(express.json());

// Temporary root route just to confirm the server is alive.
// The real /api/v1/health route (with DB check) is built in Task 1.4.
app.get('/', (req, res) => {
  res.json({ success: true, data: { message: 'DevBoard backend is running' } });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`DevBoard backend listening on http://localhost:${PORT}`);
});
