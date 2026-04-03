require('dotenv').config();
require('./Models');

const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/db');
const app = express();
const routes = require('./Routes');
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api', routes);


app.get('/health', (req, res) => {
  res.json({ status: 'Auth Service Running' });
});

app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connected to PostgreSQL');
    return sequelize.sync();
  })
  .then(() => {
    console.log('Tables synced');
  })
  .catch((err) => {
    console.error('DB Error:', err.message);
    console.warn('Backend started without DB connection (dev mode).');
  });