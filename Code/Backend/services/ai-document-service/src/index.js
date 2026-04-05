const express = require('express');
const OpenAI = require('openai');
const cors = require('cors');
const authMiddleware = require('./middlewares/auth');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
