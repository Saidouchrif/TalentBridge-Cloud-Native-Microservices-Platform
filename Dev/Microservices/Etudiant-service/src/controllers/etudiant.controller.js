const Joi = require("joi");
const Etudiant = require("../models/etudiant.model");
const { validerCorps, MESSAGE_VALIDATION } = require("../utils/validation");

const schemaCreationProfil = Joi.object({
  universite: Joi.string().trim().min(1).max(500).required(),
  niveau: Joi.string().trim().min(1).max(200).required(),
  cv: Joi.string().trim().min(1).max(2000).required(),
  localisation: Joi.string().trim().min(1).max(300).required(),
});

const schemaMiseAJourProfil = Joi.object({
  universite: Joi.string().trim().min(1).max(500),
  niveau: Joi.string().trim().min(1).max(200),
  cv: Joi.string().trim().min(1).max(2000),
  localisation: Joi.string().trim().min(1).max(300),
}).min(1);

/**
 * POST /api/etudiant/profile — premier remplissage du profil.
 */
async function creerProfil(req, res, next) {
  try {
    const dejaExistant = await Etudiant.findOne({
      where: { user_id: req.auth.user_id },
    });
    if (dejaExistant) {
      return res.status(409).json({
        message: "Un profil existe déjà pour cet utilisateur",
      });
    }

    const resultat = validerCorps(schemaCreationProfil, req.body);
    if (!resultat.ok) {
      return res.status(400).json({ message: MESSAGE_VALIDATION });
    }

    const enregistrement = await Etudiant.create({
      user_id: req.auth.user_id,
      ...resultat.value,
    });
    return res.status(201).json(enregistrement);
  } catch (erreur) {
    if (erreur.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "Un profil existe déjà pour cet utilisateur",
      });
    }
    return next(erreur);
  }
}

/**
 * GET /api/etudiant/me — lecture du profil courant.
 */
async function lireMonProfil(req, res, next) {
  try {
    const profil = await Etudiant.findOne({
      where: { user_id: req.auth.user_id },
    });
    if (!profil) {
      return res.status(404).json({
        message: "Profil étudiant introuvable",
      });
    }
    return res.json(profil);
  } catch (erreur) {
    return next(erreur);
  }
}

/**
 * PUT /api/etudiant/me — mise à jour partielle du profil.
 */
async function mettreAJourMonProfil(req, res, next) {
  try {
    const profil = await Etudiant.findOne({
      where: { user_id: req.auth.user_id },
    });
    if (!profil) {
      return res.status(404).json({
        message: "Profil étudiant introuvable",
      });
    }

    const resultat = validerCorps(schemaMiseAJourProfil, req.body);
    if (!resultat.ok) {
      return res.status(400).json({ message: MESSAGE_VALIDATION });
    }

    await profil.update(resultat.value);
    return res.json(profil);
  } catch (erreur) {
    return next(erreur);
  }
}

module.exports = {
  creerProfil,
  lireMonProfil,
  mettreAJourMonProfil,
};
