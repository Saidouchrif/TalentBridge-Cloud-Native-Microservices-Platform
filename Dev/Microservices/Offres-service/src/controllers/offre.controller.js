const Joi = require("joi");
const { Op } = require("sequelize");

const Offre = require("../models/offre.model");
const TYPES_OFFRE = Offre.TYPES_OFFRE;
const STATUTS_OFFRE = Offre.STATUTS_OFFRE;
const { validerCorps, MESSAGE_VALIDATION } = require("../utils/validation");
const { creerErreurHttp } = require("../utils/httpError");
const { notifierNouvelleOffre } = require("../services/notificationClient");
const {
  fermerOffresExpirees,
  clauseCatalogueActif,
  parserPagination,
  parserTri,
} = require("../utils/offreQueries");

const schemaCreation = Joi.object({
  titre: Joi.string().trim().min(1).max(500).required(),
  description: Joi.string().trim().min(1).required(),
  competencesRequises: Joi.string().trim().min(1).required(),
  localisation: Joi.string().trim().min(1).max(300).required(),
  type: Joi.string()
    .valid(...TYPES_OFFRE)
    .required(),
  salaire: Joi.string().trim().max(120).allow("", null).optional(),
  dateExpiration: Joi.date().iso().allow(null).optional(),
  statut: Joi.string()
    .valid(...STATUTS_OFFRE)
    .optional(),
});

const schemaMiseAJour = Joi.object({
  titre: Joi.string().trim().min(1).max(500),
  description: Joi.string().trim().min(1),
  competencesRequises: Joi.string().trim().min(1),
  localisation: Joi.string().trim().min(1).max(300),
  type: Joi.string().valid(...TYPES_OFFRE),
  salaire: Joi.string().trim().max(120).allow("", null),
  dateExpiration: Joi.date().iso().allow(null),
  statut: Joi.string().valid(...STATUTS_OFFRE),
}).min(1);

function parserIdParam(valeur) {
  const id = parseInt(String(valeur), 10);
  if (!Number.isInteger(id) || id < 1) {
    return null;
  }
  return id;
}

function construireFiltresRecherche(query) {
  const conditions = [];

  const q = (query.q || query.keyword || "").toString().trim();
  if (q.length > 0) {
    const motif = `%${q}%`;
    conditions.push({
      [Op.or]: [
        { titre: { [Op.iLike]: motif } },
        { description: { [Op.iLike]: motif } },
      ],
    });
  }

  const type = (query.type || "").toString().trim().toLowerCase();
  if (type && TYPES_OFFRE.includes(type)) {
    conditions.push({ type });
  }

  const localisation = (query.localisation || "").toString().trim();
  if (localisation.length > 0) {
    conditions.push({
      localisation: { [Op.iLike]: `%${localisation}%` },
    });
  }

  const competences = (query.competencesRequises || "").toString().trim();
  if (competences.length > 0) {
    conditions.push({
      competencesRequises: { [Op.iLike]: `%${competences}%` },
    });
  }

  const statutBrut = (query.statut || "").toString().trim().toLowerCase();
  if (statutBrut === "ferm\u00e9" || statutBrut === "ferme") {
    conditions.push({ statut: "ferm\u00e9" });
  } else if (statutBrut === "actif") {
    conditions.push(clauseCatalogueActif());
  } else if (statutBrut.length > 0 && STATUTS_OFFRE.includes(statutBrut)) {
    conditions.push({ statut: statutBrut });
  } else {
    conditions.push(clauseCatalogueActif());
  }

  if (conditions.length === 1) {
    return conditions[0];
  }
  return { [Op.and]: conditions };
}

/**
 * GET /api/offres to list paginated (catalogue : actif, non expire).
 */
async function lister(req, res, next) {
  try {
    await fermerOffresExpirees(Offre);
    const { page, limit, offset } = parserPagination(req.query);
    const order = parserTri(req.query.sort);
    const where = construireFiltresRecherche({
      ...req.query,
      statut: req.query.statut || "actif",
    });

    const { count, rows } = await Offre.findAndCountAll({
      where,
      limit,
      offset,
      order,
    });

    return res.json({
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit) || 0,
      },
    });
  } catch (erreur) {
    return next(erreur);
  }
}

/**
 * GET /api/offres/search to filters combined + keyword + pagination + tri.
 */
async function rechercher(req, res, next) {
  try {
    await fermerOffresExpirees(Offre);
    const { page, limit, offset } = parserPagination(req.query);
    const order = parserTri(req.query.sort);
    const where = construireFiltresRecherche(req.query);

    const { count, rows } = await Offre.findAndCountAll({
      where,
      limit,
      offset,
      order,
    });

    return res.json({
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit) || 0,
      },
    });
  } catch (erreur) {
    return next(erreur);
  }
}

/**
 * GET /api/offres/:id to detail (all status ; expired offer may have been passed in closed).
 */
async function obtenirParId(req, res, next) {
  try {
    await fermerOffresExpirees(Offre);
    const id = parserIdParam(req.params.id);
    if (id === null) {
      return res.status(400).json({ message: "Identifiant d'offre invalide" });
    }

    const offre = await Offre.findByPk(id);
    if (!offre) {
      return res.status(404).json({ message: "Offre introuvable" });
    }

    return res.json(offre);
  } catch (erreur) {
    return next(erreur);
  }
}

/**
 * POST /api/offres to authenticated company.
 */
async function creer(req, res, next) {
  try {
    const resultat = validerCorps(schemaCreation, req.body);
    if (!resultat.ok) {
      return res.status(400).json({ message: MESSAGE_VALIDATION });
    }

    const { salaire, dateExpiration, statut, ...reste } = resultat.value;
    const offre = await Offre.create({
      ...reste,
      salaire: salaire && String(salaire).trim() ? String(salaire).trim() : null,
      dateExpiration: dateExpiration ? new Date(dateExpiration).toISOString().slice(0, 10) : null,
      statut: statut || "actif",
      entreprise_id: req.auth.user_id,
      datePublication: new Date(),
      nombreCandidatures: 0,
    });

    notifierNouvelleOffre({
      offre_id: offre.id,
      titre: offre.titre,
      entreprise_user_id: req.auth.user_id,
    }).catch(() => {});

    return res.status(201).json(offre);
  } catch (erreur) {
    return next(erreur);
  }
}

/**
 * PUT /api/offres/:id to only the offers of the connected company.
 */
async function modifier(req, res, next) {
  try {
    const id = parserIdParam(req.params.id);
    if (id === null) {
      return res.status(400).json({ message: "Identifiant d'offre invalide" });
    }

    const offre = await Offre.findByPk(id);
    if (!offre) {
      return res.status(404).json({ message: "Offre introuvable" });
    }

    if (offre.entreprise_id !== req.auth.user_id) {
      return next(creerErreurHttp(403, "Vous n'avez pas acces a cette ressource"));
    }

    const resultat = validerCorps(schemaMiseAJour, req.body);
    if (!resultat.ok) {
      return res.status(400).json({ message: MESSAGE_VALIDATION });
    }

    const patch = { ...resultat.value };
    if (patch.salaire !== undefined) {
      patch.salaire =
        patch.salaire && String(patch.salaire).trim() ? String(patch.salaire).trim() : null;
    }
    if (patch.dateExpiration !== undefined) {
      patch.dateExpiration = patch.dateExpiration
        ? new Date(patch.dateExpiration).toISOString().slice(0, 10)
        : null;
    }

    await offre.update(patch);
    return res.json(offre);
  } catch (erreur) {
    return next(erreur);
  }
}

/**
 * DELETE /api/offres/:id
 */
async function supprimer(req, res, next) {
  try {
    const id = parserIdParam(req.params.id);
    if (id === null) {
      return res.status(400).json({ message: "Identifiant d'offre invalide" });
    }

    const offre = await Offre.findByPk(id);
    if (!offre) {
      return res.status(404).json({ message: "Offre introuvable" });
    }

    if (offre.entreprise_id !== req.auth.user_id) {
      return next(creerErreurHttp(403, "Vous n'avez pas acces a cette ressource"));
    }

    await offre.destroy();
    return res.status(204).send();
  } catch (erreur) {
    return next(erreur);
  }
}

/**
 * POST /api/offres/:id/increment-candidatures to called by Candidature-service (X-Service-Token).
 */
async function incrementerNombreCandidatures(req, res, next) {
  try {
    const id = parserIdParam(req.params.id);
    if (id === null) {
      return res.status(400).json({ message: "Identifiant d'offre invalide" });
    }

    const offre = await Offre.findByPk(id);
    if (!offre) {
      return res.status(404).json({ message: "Offre introuvable" });
    }

    await offre.increment("nombreCandidatures", { by: 1 });
    await offre.reload();
    return res.status(200).json({
      id: offre.id,
      nombreCandidatures: offre.nombreCandidatures,
    });
  } catch (erreur) {
    return next(erreur);
  }
}

module.exports = {
  lister,
  rechercher,
  obtenirParId,
  creer,
  modifier,
  supprimer,
  incrementerNombreCandidatures,
};
