require('dotenv').config();
require('./Models');

const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const routes = require('./Routes');
const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'Candidature Service Running' });
});

app.use('/api', routes);

sequelize
  .authenticate()
  .then(() => {
    console.log('Connected to PostgreSQL');
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('Models synced');
  })
  .catch((err) => {
    console.error('DB Error:', err.message);
  });

app.listen(PORT, () => {
  console.log(`Candidature Service running on port ${PORT}`);
});
