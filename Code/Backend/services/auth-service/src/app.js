require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
require('./Models');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'Auth Service Running' });
});

const PORT = process.env.PORT || 5001;

sequelize.authenticate()
  .then(() => {
    console.log('✅ Connected to PostgreSQL');
    return sequelize.sync();
  })
  .then(() => {
    console.log('✅ Tables synced');
    app.listen(PORT, () => {
      console.log(`Auth Service running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ DB Error:', err);
  });