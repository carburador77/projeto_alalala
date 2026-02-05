const express = require('express');
const db = require('./db');

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'backend' });
});

app.get('/health/db', async (req, res) => {
  try {
    await db.raw('select 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
