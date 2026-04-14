const Joi = require("joi");

const Document = require("../models/document.model");
const { validerCorps, MESSAGE_VALIDATION } = require("../utils/validation");
const aiService = require("../services/ai.service");

const schemaContexte = Joi.object({
  nom: Joi.string().trim().max(120).allow("", null).optional(),
  prenom: Joi.string().trim().max(120).allow("", null).optional(),
  email: Joi.string().trim().max(255).allow("", null).optional(),
  telephone: Joi.string().trim().max(40).allow("", null).optional(),
  ville: Joi.string().trim().max(120).allow("", null).optional(),
  titreSouhaite: Joi.string().trim().max(200).allow("", null).optional(),
  resumeProfil: Joi.string().trim().max(4000).allow("", null).optional(),
  competences: Joi.alternatives()
    .try(Joi.array().items(Joi.string().trim().max(200)), Joi.string().trim().max(8000))
    .optional(),
  experiences: Joi.alternatives()
    .try(Joi.array().items(Joi.object().unknown(true)), Joi.string().trim().max(16000))
    .optional(),
  formations: Joi.alternatives()
    .try(Joi.array().items(Joi.object().unknown(true)), Joi.string().trim().max(8000))
    .optional(),
  langues: Joi.alternatives()
    .try(Joi.array().items(Joi.string().trim().max(80)), Joi.string().trim().max(500))
    .optional(),
  centresInteret: Joi.string().trim().max(2000).allow("", null).optional(),
}).unknown(true);

const schemaLettre = schemaContexte.keys({
  entreprise: Joi.string().trim().max(300).allow("", null).optional(),
  offre_titre: Joi.string().trim().max(500).allow("", null).optional(),
  offre_description: Joi.string().trim().max(32000).allow("", null).optional(),
  messageMotivation: Joi.string().trim().max(8000).allow("", null).optional(),
});

const schemaEmail = schemaLettre.keys({
  destinataire: Joi.string().trim().max(255).allow("", null).optional(),
});

const schemaAdaptOffre = Joi.object({
  contenu: Joi.string().trim().min(1).max(120000).required(),
  offre: Joi.object({
    titre: Joi.string().trim().max(500).allow("", null).optional(),
    description: Joi.string().trim().max(32000).allow("", null).optional(),
    competencesRequises: Joi.string().trim().max(16000).allow("", null).optional(),
    localisation: Joi.string().trim().max(300).allow("", null).optional(),
    type: Joi.string().trim().max(50).allow("", null).optional(),
  })
    .unknown(true)
    .required(),
}).unknown(false);

async function genererEtEnregistrer(req, res, next, type, prompt) {
  try {
    const contenu = await aiService.generateContent(prompt);
    const doc = await Document.create({
      type,
      contenu,
      dateGeneration: new Date(),
      user_id: req.auth.user_id,
    });

    return res.status(201).json({
      id: doc.id,
      type: doc.type,
      contenu: doc.contenu,
      dateGeneration: doc.dateGeneration,
    });
  } catch (erreur) {
    return next(erreur);
  }
}

async function generateCv(req, res, next) {
  try {
    const resultat = validerCorps(schemaContexte, req.body);
    if (!resultat.ok) {
      return res.status(400).json({ message: MESSAGE_VALIDATION });
    }
    const prompt = aiService.construirePromptCv(resultat.value);
    return genererEtEnregistrer(req, res, next, "cv", prompt);
  } catch (erreur) {
    return next(erreur);
  }
}

async function generateLettre(req, res, next) {
  try {
    const resultat = validerCorps(schemaLettre, req.body);
    if (!resultat.ok) {
      return res.status(400).json({ message: MESSAGE_VALIDATION });
    }
    const prompt = aiService.construirePromptLettre(resultat.value);
    return genererEtEnregistrer(req, res, next, "lettre", prompt);
  } catch (erreur) {
    return next(erreur);
  }
}

async function generateEmail(req, res, next) {
  try {
    const resultat = validerCorps(schemaEmail, req.body);
    if (!resultat.ok) {
      return res.status(400).json({ message: MESSAGE_VALIDATION });
    }
    const prompt = aiService.construirePromptEmail(resultat.value);
    return genererEtEnregistrer(req, res, next, "email", prompt);
  } catch (erreur) {
    return next(erreur);
  }
}

/**
 * Contenu adapte a une offre : enregistre comme type "lettre" (document redige / adapte).
 */
async function adaptOffre(req, res, next) {
  try {
    const resultat = validerCorps(schemaAdaptOffre, req.body);
    if (!resultat.ok) {
      return res.status(400).json({ message: MESSAGE_VALIDATION });
    }
    const prompt = aiService.construirePromptAdaptOffre(resultat.value);
    return genererEtEnregistrer(req, res, next, "lettre", prompt);
  } catch (erreur) {
    return next(erreur);
  }
}

module.exports = {
  generateCv,
  generateLettre,
  generateEmail,
  adaptOffre,
};
