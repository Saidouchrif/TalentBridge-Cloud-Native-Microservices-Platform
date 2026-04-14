const Joi = require("joi");

const Application = require("../models/application.model");
const { validerCorps, MESSAGE_VALIDATION } = require("../utils/validation");
const { creerErreurHttp } = require("../utils/httpError");
const { fetchOffreParId, incrementerCandidatures } = require("../services/offresClient");
const {
  notifierNouvelleCandidature,
  notifierChangementStatutCandidature,
} = require("../services/notificationClient");
const { obtenirUtilisateur, libelleUtilisateur } = require("../services/authClient");

const schemaCreation = Joi.object({
  offre_id: Joi.number().integer().min(1).required(),
  message: Joi.string().trim().max(5000).allow("", null).optional(),
  entreprise_nom: Joi.string().trim().max(300).allow("", null).optional(),
});

const schemaStatut = Joi.object({
  statut: Joi.string().valid("accepte", "refuse").required(),
});

function parserId(valeur) {
  const id = parseInt(String(valeur), 10);
  if (!Number.isInteger(id) || id < 1) return null;
  return id;
}

async function creer(req, res, next) {
  try {
    const body = {
      offre_id: Number(req.body.offre_id),
      message: req.body.message || "",
      entreprise_nom: req.body.entreprise_nom || "",
    };

    const resultat = validerCorps(schemaCreation, body);
    if (!resultat.ok) {
      return res.status(400).json({ message: MESSAGE_VALIDATION });
    }

    const { offre_id, message, entreprise_nom } = resultat.value;

    let offre;
    try {
      const reponseOffre = await fetchOffreParId(offre_id);
      if (reponseOffre.status === 404) {
        return res.status(404).json({ message: "Offre introuvable" });
      }
      if (reponseOffre.status !== 200) {
        return res.status(502).json({ message: "Impossible de valider l'offre" });
      }
      offre = reponseOffre.data;
    } catch (err) {
      console.error("[Candidature] Offres-service unreachable:", err.message);
      return res.status(503).json({ message: "Service offres temporairement indisponible" });
    }

    if (offre.statut !== "actif") {
      return res.status(400).json({ message: "Cette offre n'accepte plus de candidatures" });
    }

    let cv_url = null;
    let lettre_url = null;

    if (req.files) {
      if (req.files.cv && req.files.cv[0]) {
        cv_url = `/storage/candidatures/${req.auth.user_id}/${req.files.cv[0].filename}`;
      }
      if (req.files.lettre && req.files.lettre[0]) {
        lettre_url = `/storage/candidatures/${req.auth.user_id}/${req.files.lettre[0].filename}`;
      }
    }

    const candidature = await Application.create({
      user_id: req.auth.user_id,
      offre_id,
      statut: "en_attente",
      dateCandidature: new Date(),
      message: message && String(message).trim() ? String(message).trim() : null,
      cv_url,
      lettre_url,
    });

    incrementerCandidatures(offre_id).catch((err) => {
      console.error("[Candidature] increment-candidatures failed (non-blocking):", err.message);
    });

    notifierNouvelleCandidature({
      offre_id,
      offre_titre: offre.titre,
      entreprise_user_id: Number(offre.entreprise_id),
      entreprise_nom: entreprise_nom || null,
      candidature_id: candidature.id,
      etudiant_user_id: req.auth.user_id,
    }).catch(() => {});

    return res.status(201).json(candidature);
  } catch (erreur) {
    if (erreur.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ message: "Vous avez deja postule a cette offre" });
    }
    return next(erreur);
  }
}

async function listerMes(req, res, next) {
  try {
    const liste = await Application.findAll({
      where: { user_id: req.auth.user_id },
      order: [["dateCandidature", "DESC"]],
    });

    const enriched = await Promise.all(
      liste.map(async (c) => {
        const plain = c.toJSON();
        try {
          const r = await fetchOffreParId(c.offre_id);
          if (r.status === 200 && r.data) {
            plain.offre_titre = r.data.titre || null;
            plain.entreprise_id = r.data.entreprise_id || null;
          }
        } catch {
          /* offres-service unreachable - leave title null */
        }
        return plain;
      })
    );

    return res.json(enriched);
  } catch (erreur) {
    return next(erreur);
  }
}

async function verifierCandidature(req, res, next) {
  try {
    const offreId = parserId(req.params.offre_id);
    if (offreId === null) {
      return res.status(400).json({ message: "Identifiant d'offre invalide" });
    }
    const existing = await Application.findOne({
      where: { user_id: req.auth.user_id, offre_id: offreId },
    });
    return res.json({ applied: Boolean(existing), candidature: existing || null });
  } catch (erreur) {
    return next(erreur);
  }
}

async function listerParOffre(req, res, next) {
  try {
    const offreId = parserId(req.params.offre_id);
    if (offreId === null) {
      return res.status(400).json({ message: "Identifiant d'offre invalide" });
    }

    let reponseOffre;
    try {
      reponseOffre = await fetchOffreParId(offreId);
    } catch {
      return res.status(503).json({ message: "Service offres temporairement indisponible" });
    }

    if (reponseOffre.status === 404) {
      return res.status(404).json({ message: "Offre introuvable" });
    }
    if (reponseOffre.status !== 200) {
      return res.status(502).json({ message: "Impossible de valider l'offre" });
    }

    const offre = reponseOffre.data;
    if (Number(offre.entreprise_id) !== req.auth.user_id) {
      return next(creerErreurHttp(403, "Vous n'avez pas acces a cette ressource"));
    }

    const liste = await Application.findAll({
      where: { offre_id: offreId },
      order: [["dateCandidature", "DESC"]],
    });

    const token = req.headers.authorization ? req.headers.authorization.replace("Bearer ", "") : null;
    const enriched = await Promise.all(
      liste.map(async (c) => {
        const plain = c.toJSON();
        plain.offre_titre = offre.titre || null;
        try {
          const u = await obtenirUtilisateur(c.user_id, token);
          plain.candidat_nom = libelleUtilisateur(u);
          plain.candidat_email = u?.email || null;
        } catch {
          plain.candidat_nom = null;
          plain.candidat_email = null;
        }
        return plain;
      })
    );

    return res.json(enriched);
  } catch (erreur) {
    return next(erreur);
  }
}

async function mettreAJourStatut(req, res, next) {
  try {
    const id = parserId(req.params.id);
    if (id === null) {
      return res.status(400).json({ message: "Identifiant de candidature invalide" });
    }

    const resultat = validerCorps(schemaStatut, req.body);
    if (!resultat.ok) {
      return res.status(400).json({ message: MESSAGE_VALIDATION });
    }
    const { statut: nouveauStatut } = resultat.value;

    const candidature = await Application.findByPk(id);
    if (!candidature) {
      return res.status(404).json({ message: "Candidature introuvable" });
    }

    if (candidature.statut !== "en_attente") {
      return res.status(400).json({ message: "Cette candidature a deja ete traitee" });
    }

    let reponseOffre;
    try {
      reponseOffre = await fetchOffreParId(candidature.offre_id);
    } catch {
      return res.status(503).json({ message: "Service offres temporairement indisponible" });
    }

    if (reponseOffre.status !== 200) {
      return res.status(404).json({ message: "Offre introuvable" });
    }

    const offre = reponseOffre.data;
    if (Number(offre.entreprise_id) !== req.auth.user_id) {
      return next(creerErreurHttp(403, "Vous n'avez pas acces a cette ressource"));
    }

    await candidature.update({ statut: nouveauStatut });

    let entrepriseNom = null;
    try {
      const eu = await obtenirUtilisateur(req.auth.user_id);
      entrepriseNom = eu?.nom || eu?.prenom || null;
    } catch { /* non-blocking */ }

    notifierChangementStatutCandidature({
      candidature_id: candidature.id,
      etudiant_user_id: candidature.user_id,
      statut: nouveauStatut,
      offre_titre: offre.titre,
      entreprise_nom: entrepriseNom,
    }).catch(() => {});

    return res.json(candidature);
  } catch (erreur) {
    return next(erreur);
  }
}

module.exports = {
  creer,
  listerMes,
  listerParOffre,
  mettreAJourStatut,
  verifierCandidature,
};
