const Joi = require("joi");
const Experience = require("../models/experience.model");
const { validerCorps, MESSAGE_VALIDATION } = require("../utils/validation");

const schemaDate = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .messages({ "string.pattern.base": "Date au format AAAA-MM-JJ attendue" });

const schemaExperience = Joi.object({
  poste: Joi.string().trim().min(1).max(200).required(),
  entreprise: Joi.string().trim().min(1).max(200).required(),
  dateDebut: schemaDate.required(),
  dateFin: schemaDate.allow(null, ""),
  description: Joi.string().trim().max(5000).allow(null, ""),
});

async function ajouterExperience(req, res, next) {
  try {
    const resultat = validerCorps(schemaExperience, req.body);
    if (!resultat.ok) {
      return res.status(400).json({ message: MESSAGE_VALIDATION });
    }

    const donnees = { ...resultat.value };
    if (donnees.dateFin === "") donnees.dateFin = null;
    if (donnees.description === "") donnees.description = null;

    const ligne = await Experience.create({
      ...donnees,
      user_id: req.auth.user_id,
    });
    return res.status(201).json(ligne);
  } catch (erreur) {
    return next(erreur);
  }
}

async function listerExperiences(req, res, next) {
  try {
    const liste = await Experience.findAll({
      where: { user_id: req.auth.user_id },
      order: [["dateDebut", "DESC"]],
    });
    return res.json(liste);
  } catch (erreur) {
    return next(erreur);
  }
}

async function supprimerExperience(req, res, next) {
  try {
    const identifiant = Number(req.params.id);
    if (!Number.isInteger(identifiant) || identifiant < 1) {
      return res.status(400).json({
        message: "Identifiant d'expérience invalide",
      });
    }

    const supprime = await Experience.destroy({
      where: { id: identifiant, user_id: req.auth.user_id },
    });
    if (!supprime) {
      return res.status(404).json({
        message: "Expérience introuvable",
      });
    }
    return res.status(204).send();
  } catch (erreur) {
    return next(erreur);
  }
}

module.exports = {
  ajouterExperience,
  listerExperiences,
  supprimerExperience,
};
