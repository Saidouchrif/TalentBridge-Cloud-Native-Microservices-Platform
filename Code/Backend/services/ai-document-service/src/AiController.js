const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.improveText = async (req, res) => {
  try {
    const { text, type } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Le texte est requis pour l\'amélioration.' });
    }

    // On adapte le comportement de l'IA selon le type de document
    let systemPrompt = "Vous êtes un expert en recrutement de haut niveau. Améliorez le texte suivant pour le rendre plus professionnel, percutant et parfait pour une candidature. Corrigez les fautes d'orthographe et optimisez la syntaxe.";
    
    if (type === 'coverLetter') {
      systemPrompt = "Vous êtes un expert RH. Améliorez cette lettre de motivation en la rendant convaincante, bien structurée, et parfaitement adaptée aux standards d'entreprise modernes. Gardez un ton professionnel et enthousiaste.";
    } else if (type === 'skills') {
      systemPrompt = "Vous êtes un recruteur technique. Structurez et valorisez cette liste de compétences pour qu'elle attire immédiatement l'œil sur un CV.";
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Vous pouvez utiliser gpt-4 si votre clé le permet
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      temperature: 0.7,
    });

    res.json({ improvedText: response.choices[0].message.content });
  } catch (error) {
    console.error('Erreur OpenAI:', error.message);
    res.status(500).json({ message: 'Erreur lors de la communication avec l\'IA.' });
  }
};