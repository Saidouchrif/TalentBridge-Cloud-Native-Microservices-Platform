require('dotenv').config();
const express = require('express');
const cors = require('cors');

const pool = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'Auth Service Running' });
});

//test de connexion db
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      message: 'Database Connected',
      time: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});