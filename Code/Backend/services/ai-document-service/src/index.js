const express = require('express');
const OpenAI = require('openai');
const cors = require('cors');
<<<<<<< HEAD
const authMiddleware = require('./middlewares/auth');
=======
>>>>>>> b955a41bdc8111f7a93e78bc679344b7d7d789e8
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

<<<<<<< HEAD
app.get('/health', (req, res) => {
  res.json({ status: 'AI Document Service Running', timestamp: new Date().toISOString() });
});

app.post('/api/generate-cv', authMiddleware, async (req, res) => {
  const { userData, jobDesc } = req.body;
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: `Crée un CV professionnel au format Markdown pour ce candidat: ${userData}, optimisé pour le poste: ${jobDesc}` }]
    });
    res.json({ success: true, cv: response.choices[0].message.content });
  } catch (err) {
    console.error('OpenAI error:', err);
    res.status(500).json({ error: 'Failed to generate CV' });
  }
});

app.post('/api/generate-letter', authMiddleware, async (req, res) => {
  const { userData, jobDesc, company } = req.body;
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: `Rédige une lettre de motivation personnalisée en français pour: ${userData}, candidature au poste ${jobDesc} chez ${company}. Format professionnel Markdown.` }]
    });
    res.json({ success: true, letter: response.choices[0].message.content });
  } catch (err) {
    console.error('OpenAI error:', err);
    res.status(500).json({ error: 'Failed to generate letter' });
  }
});

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`AI Document Service running on port ${PORT}`);
});
=======
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
>>>>>>> b955a41bdc8111f7a93e78bc679344b7d7d789e8
