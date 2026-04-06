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

exports.generateDocument = async (req, res) => {
  try {
    const { type, userData, jobDesc } = req.body;

    if (!type || !userData) {
      return res.status(400).json({ message: 'Le type et les données utilisateur sont requis.' });
    }

    let systemPrompt = "Vous êtes un assistant IA expert en recrutement.";
    let prompt = "";

    // Différents prompts selon le type de génération demandé (TCNMP-240, TCNMP-241, TCNMP-242)
    if (type === 'cv') {
      systemPrompt = "Vous êtes un expert en rédaction de CV. Générez un CV structuré (Expériences, Compétences, Formations) clair et professionnel.";
      prompt = `Générez un CV pour le profil suivant : ${userData}. Description du poste visé : ${jobDesc || 'Non spécifiée'}.`;
    } else if (type === 'coverLetter') {
      systemPrompt = "Vous êtes un expert en recrutement. Rédigez une lettre de motivation personnalisée, convaincante et professionnelle.";
      prompt = `Rédigez une lettre de motivation. Profil du candidat : ${userData}. Description de l'offre : ${jobDesc}.`;
    } else if (type === 'email') {
      systemPrompt = "Vous êtes un expert en communication professionnelle. Rédigez un email d'accompagnement de candidature court, poli et percutant.";
      prompt = `Rédigez un email de candidature très concis pour ce profil : ${userData}, visant ce poste : ${jobDesc}.`;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    res.json({ generatedText: response.choices[0].message.content });
  } catch (error) {
    console.error('Erreur OpenAI Generation:', error.message);
    res.status(500).json({ message: 'Erreur lors de la génération avec l\'IA.' });
  }
};