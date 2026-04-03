require('dotenv').config();
require('./Models'); // charge et associe tous les modèles

const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const routes = require('./Routes');

const app = express();
const PORT = process.env.PORT || 5002;

// ─── Middlewares ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Routes API ───────────────────────────────────────────────────────────────
app.use('/api', routes);

// ─── Healthcheck ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'candidature-service',
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

// ─── Démarrage ────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[candidature-service] ✅ Running on port ${PORT}`);
});

sequelize
  .authenticate()
  .then(() => {
    console.log('[candidature-service] ✅ Connected to PostgreSQL');
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('[candidature-service] ✅ Tables synced');
  })
  .catch((err) => {
    console.error('[candidature-service] ⚠️  DB Error:', err.message);
    console.warn('[candidature-service] Started without DB connection (dev mode).');
  });
