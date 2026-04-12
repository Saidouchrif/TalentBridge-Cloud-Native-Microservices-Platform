const Joi = require("joi");
const Competence = require("../models/competence.model");
const { validerCorps, MESSAGE_VALIDATION } = require("../utils/validation");

const schemaCompetence = Joi.object({
  nom: Joi.string().trim().min(1).max(150).required(),
  niveau: Joi.string().trim().min(1).max(100).required(),
});

async function ajouterCompetence(req, res, next) {
  try {
    const resultat = validerCorps(schemaCompetence, req.body);
    if (!resultat.ok) {
      return res.status(400).json({ message: MESSAGE_VALIDATION });
    }

    const ligne = await Competence.create({
      ...resultat.value,
      user_id: req.auth.user_id,
    });
    return res.status(201).json(ligne);
  } catch (erreur) {
    return next(erreur);
  }
}

async function listerCompetences(req, res, next) {
  try {
    const liste = await Competence.findAll({
      where: { user_id: req.auth.user_id },
      order: [["nom", "ASC"]],
    });
    return res.json(liste);
  } catch (erreur) {
    return next(erreur);
  }
}

module.exports = {
  ajouterCompetence,
  listerCompetences,
};
