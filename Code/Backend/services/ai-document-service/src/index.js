const express = require('express');
const OpenAI = require('openai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// TCNMP-240: Génération CV
app.post('/generate-cv', async (req, res) => {
    const { userData, jobDesc } = req.body;
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: `Crée un CV pour: ${userData} correspondant à ce poste: ${jobDesc}` }]
        });
        res.json({ text: response.choices[0].message.content });
    } catch (err) { res.status(500).send(err.message); }
});

// TCNMP-241: Génération Lettre
app.post('/generate-letter', async (req, res) => {
    const { userData, jobDesc } = req.body;
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: `Rédige une lettre de motivation pour ce poste: ${jobDesc}. Info candidat: ${userData}` }]
        });
        res.json({ text: response.choices[0].message.content });
    } catch (err) { res.status(500).send(err.message); }
});

app.listen(5003, () => console.log('AI Service running on 5003'));