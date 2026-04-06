const express = require('express');
<<<<<<< HEAD
const cors = require('cors');
const dotenv = require('dotenv');

const applicationRoutes = require('./Routes/ApplicationRoute');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/applications', applicationRoutes);

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Candidature-Service is running on port ${PORT}`);
});
=======
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Connexion Postgres (TCNMP-227: Modèle Application)
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: 'postgres', // Smiyt l-container f docker-compose
    database: 'talentbridge_db',
    password: 'postgres',
    port: 5432,
});

// Table Creation (Simple version for demo)
pool.query(`
    CREATE TABLE IF NOT EXISTS candidatures (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(100),
        job_title VARCHAR(100),
        status VARCHAR(20) DEFAULT 'pending',
        cv_content TEXT,
        letter_content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`);

// TCNMP-228: Endpoint postuler
app.post('/apply', async (req, res) => {
    const { company, title, cv, letter } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO candidatures (company_name, job_title, cv_content, letter_content) VALUES ($1, $2, $3, $4) RETURNING *',
            [company, title, cv, letter]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// TCNMP-229: Gestion statut
app.put('/status/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // pending, reviewed, accepted, rejected
    try {
        const result = await pool.query(
            'UPDATE candidatures SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Historique (TCNMP-245)
app.get('/history', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM candidatures ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(5002, () => console.log('Candidature Service running on 5002'));
>>>>>>> b955a41bdc8111f7a93e78bc679344b7d7d789e8
