const Joi = require("joi");
const Langue = require("../models/langue.model");
const { validerCorps, MESSAGE_VALIDATION } = require("../utils/validation");

const schemaLangue = Joi.object({
  nom: Joi.string().trim().min(1).max(100).required(),
  niveau: Joi.string().trim().min(1).max(100).required(),
});

async function ajouterLangue(req, res, next) {
  try {
    const resultat = validerCorps(schemaLangue, req.body);
    if (!resultat.ok) {
      return res.status(400).json({ message: MESSAGE_VALIDATION });
    }

    const ligne = await Langue.create({
      ...resultat.value,
      user_id: req.auth.user_id,
    });
    return res.status(201).json(ligne);
  } catch (erreur) {
    return next(erreur);
  }
}

async function listerLangues(req, res, next) {
  try {
    const liste = await Langue.findAll({
      where: { user_id: req.auth.user_id },
      order: [["nom", "ASC"]],
    });
    return res.json(liste);
  } catch (erreur) {
    return next(erreur);
  }
}

module.exports = {
  ajouterLangue,
  listerLangues,
};
