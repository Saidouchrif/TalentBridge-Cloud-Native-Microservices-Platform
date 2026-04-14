const fs = require("fs");
const path = require("path");
const Joi = require("joi");
const Etudiant = require("../models/etudiant.model");
const { validerCorps, MESSAGE_VALIDATION } = require("../utils/validation");

const schemaCreationProfil = Joi.object({
  universite: Joi.string().trim().min(1).max(500).required(),
  niveau: Joi.string().trim().min(1).max(200).required(),
  cv: Joi.string().trim().max(2000).allow("").optional(),
  localisation: Joi.string().trim().min(1).max(300).required(),
});

const schemaMiseAJourProfil = Joi.object({
  universite: Joi.string().trim().min(1).max(500),
  niveau: Joi.string().trim().min(1).max(200),
  cv: Joi.string().trim().min(1).max(2000),
  localisation: Joi.string().trim().min(1).max(300),
}).min(1);

async function creerProfil(req, res, next) {
  try {
    const dejaExistant = await Etudiant.findOne({
      where: { user_id: req.auth.user_id },
    });
    if (dejaExistant) {
      return res.status(409).json({
        message: "Un profil existe deja pour cet utilisateur",
      });
    }

    const resultat = validerCorps(schemaCreationProfil, req.body);
    if (!resultat.ok) {
      return res.status(400).json({ message: MESSAGE_VALIDATION });
    }

    const enregistrement = await Etudiant.create({
      user_id: req.auth.user_id,
      ...resultat.value,
      cv: resultat.value.cv?.trim() ? resultat.value.cv.trim() : "",
    });
    return res.status(201).json(enregistrement);
  } catch (erreur) {
    if (erreur.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "Un profil existe deja pour cet utilisateur",
      });
    }
    return next(erreur);
  }
}

async function lireMonProfil(req, res, next) {
  try {
    const profil = await Etudiant.findOne({
      where: { user_id: req.auth.user_id },
    });
    if (!profil) {
      return res.status(404).json({
        message: "Profil etudiant introuvable",
      });
    }
    return res.json(profil);
  } catch (erreur) {
    return next(erreur);
  }
}

async function mettreAJourMonProfil(req, res, next) {
  try {
    const profil = await Etudiant.findOne({
      where: { user_id: req.auth.user_id },
    });
    if (!profil) {
      return res.status(404).json({
        message: "Profil etudiant introuvable",
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

/**
 * POST /api/etudiant/upload-cv
 * Files stored in storage/cv/{nom}_{prenom}/cv.{ext}
 */
async function uploaderCv(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Aucun fichier fourni. Envoyez un PDF, DOC ou DOCX.",
      });
    }

    const profil = await Etudiant.findOne({
      where: { user_id: req.auth.user_id },
    });
    if (!profil) {
      return res.status(404).json({
        message: "Profil etudiant introuvable",
      });
    }

    if (profil.cv) {
      const oldFile = path.join(
        __dirname,
        "..",
        "..",
        profil.cv.replace(/^\//, "")
      );
      if (fs.existsSync(oldFile)) {
        fs.unlinkSync(oldFile);
      }
    }

    const folder = req._cvFolder || req.auth.user_id;
    const cvPath = `/storage/cv/${folder}/${req.file.filename}`;
    await profil.update({ cv: cvPath });

    return res.json({
      message: "CV televerse avec succes",
      cv_url: cvPath,
    });
  } catch (erreur) {
    return next(erreur);
  }
}

module.exports = {
  creerProfil,
  lireMonProfil,
  mettreAJourMonProfil,
  uploaderCv,
};
