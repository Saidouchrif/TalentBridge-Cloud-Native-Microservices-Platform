const Joi = require("joi");
const Formation = require("../models/formation.model");
const { validerCorps, MESSAGE_VALIDATION } = require("../utils/validation");

const schemaDate = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .messages({ "string.pattern.base": "Date au format AAAA-MM-JJ attendue" });

const schemaFormation = Joi.object({
  etablissement: Joi.string().trim().min(1).max(300).required(),
  diplome: Joi.string().trim().min(1).max(300).required(),
  dateDebut: schemaDate.required(),
  dateFin: schemaDate.allow(null, ""),
});

async function ajouterFormation(req, res, next) {
  try {
    const resultat = validerCorps(schemaFormation, req.body);
    if (!resultat.ok) {
      return res.status(400).json({ message: MESSAGE_VALIDATION });
    }

    const donnees = { ...resultat.value };
    if (donnees.dateFin === "") donnees.dateFin = null;

    const ligne = await Formation.create({
      ...donnees,
      user_id: req.auth.user_id,
    });
    return res.status(201).json(ligne);
  } catch (erreur) {
    return next(erreur);
  }
}

async function listerFormations(req, res, next) {
  try {
    const liste = await Formation.findAll({
      where: { user_id: req.auth.user_id },
      order: [["dateDebut", "DESC"]],
    });
    return res.json(liste);
  } catch (erreur) {
    return next(erreur);
  }
}

module.exports = {
  ajouterFormation,
  listerFormations,
};
