const Joi = require("joi");

const Entreprise = require("../models/entreprise.model");
const { validerCorps, MESSAGE_VALIDATION } = require("../utils/validation");

const siteWebJoi = Joi.string()
  .trim()
  .max(2000)
  .allow("", null)
  .optional()
  .custom((value, helpers) => {
    if (value === null || value === undefined || value === "") {
      return value;
    }
    try {
      const u = new URL(value);
      if (u.protocol !== "http:" && u.protocol !== "https:") {
        return helpers.error("any.invalid");
      }
      return value;
    } catch {
      return helpers.error("any.invalid");
    }
  }, "URL site web (http ou https)");

const schemaCreation = Joi.object({
  nomEntreprise: Joi.string().trim().min(1).max(500).required(),
  secteur: Joi.string().trim().min(1).max(200).required(),
  description: Joi.string().trim().min(1).required(),
  adresse: Joi.string().trim().min(1).max(500).required(),
  ville: Joi.string().trim().min(1).max(200).required(),
  pays: Joi.string().trim().min(1).max(120).required(),
  siteWeb: siteWebJoi,
  logo: Joi.string().trim().max(2000).allow("", null).optional(),
  telephone: Joi.string().trim().max(50).allow("", null).optional(),
});

const schemaMiseAJour = Joi.object({
  nomEntreprise: Joi.string().trim().min(1).max(500),
  secteur: Joi.string().trim().min(1).max(200),
  description: Joi.string().trim().min(1),
  adresse: Joi.string().trim().min(1).max(500),
  ville: Joi.string().trim().min(1).max(200),
  pays: Joi.string().trim().min(1).max(120),
  siteWeb: siteWebJoi,
  logo: Joi.string().trim().max(2000).allow("", null).optional(),
  telephone: Joi.string().trim().max(50).allow("", null).optional(),
}).min(1);

function normaliserChampsOptionnels(valeur) {
  const copie = { ...valeur };
  for (const cle of ["siteWeb", "logo", "telephone"]) {
    if (copie[cle] !== undefined && copie[cle] !== null) {
      const t = String(copie[cle]).trim();
      copie[cle] = t === "" ? null : t;
    }
  }
  return copie;
}

/**
 * POST /api/entreprise/profile
 * typeCompteEntreprise : toujours true cote serveur (ignore toute valeur client / anti-fraude).
 */
async function creerProfil(req, res, next) {
  try {
    const resultat = validerCorps(schemaCreation, req.body);
    if (!resultat.ok) {
      return res.status(400).json({ message: MESSAGE_VALIDATION });
    }

    const existant = await Entreprise.findOne({
      where: { user_id: req.auth.user_id },
    });
    if (existant) {
      return res.status(409).json({
        message: "Un profil entreprise existe deja pour ce compte",
      });
    }

    const donnees = normaliserChampsOptionnels(resultat.value);

    const profil = await Entreprise.create({
      user_id: req.auth.user_id,
      nomEntreprise: donnees.nomEntreprise,
      secteur: donnees.secteur,
      description: donnees.description,
      adresse: donnees.adresse,
      ville: donnees.ville,
      pays: donnees.pays,
      siteWeb: donnees.siteWeb ?? null,
      logo: donnees.logo ?? null,
      telephone: donnees.telephone ?? null,
      typeCompteEntreprise: true,
    });

    return res.status(201).json(profil);
  } catch (erreur) {
    return next(erreur);
  }
}

/**
 * GET /api/entreprise/me
 */
async function lireProfil(req, res, next) {
  try {
    const profil = await Entreprise.findOne({
      where: { user_id: req.auth.user_id },
    });
    if (!profil) {
      return res.status(404).json({
        message: "Profil entreprise introuvable",
      });
    }
    return res.json(profil);
  } catch (erreur) {
    return next(erreur);
  }
}

/**
 * PUT /api/entreprise/me
 */
async function mettreAJour(req, res, next) {
  try {
    const profil = await Entreprise.findOne({
      where: { user_id: req.auth.user_id },
    });
    if (!profil) {
      return res.status(404).json({
        message: "Profil entreprise introuvable",
      });
    }

    const resultat = validerCorps(schemaMiseAJour, req.body);
    if (!resultat.ok) {
      return res.status(400).json({ message: MESSAGE_VALIDATION });
    }

    const patch = normaliserChampsOptionnels(resultat.value);
    patch.typeCompteEntreprise = true;

    await profil.update(patch);
    return res.json(profil);
  } catch (erreur) {
    return next(erreur);
  }
}

async function lireProfilPublic(req, res, next) {
  try {
    const userId = parseInt(String(req.params.userId), 10);
    if (!Number.isInteger(userId) || userId < 1) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }
    const profil = await Entreprise.findOne({
      where: { user_id: userId },
      attributes: ["nomEntreprise", "secteur", "ville", "pays"],
    });
    if (!profil) {
      return res.status(404).json({ message: "Entreprise introuvable" });
    }
    return res.json(profil);
  } catch (erreur) {
    return next(erreur);
  }
}

module.exports = {
  creerProfil,
  lireProfil,
  lireProfilPublic,
  mettreAJour,
};
