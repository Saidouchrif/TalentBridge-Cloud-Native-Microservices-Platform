const Joi = require("joi");

const Notification = require("../models/notification.model");
const { validerCorps, MESSAGE_VALIDATION } = require("../utils/validation");
const notificationService = require("../services/notification.service");

const destinataireSchema = Joi.object({
  user_id: Joi.number().integer().min(1).required(),
  email: Joi.string().email().required(),
});

const schemaNouvelleOffre = Joi.object({
  offre_id: Joi.number().integer().min(1).required(),
  titre: Joi.string().trim().min(1).max(500).required(),
  entreprise_user_id: Joi.number().integer().min(1).allow(null).optional(),
  recipients: Joi.array().items(destinataireSchema).optional(),
});

const schemaNouvelleCandidature = Joi.object({
  offre_id: Joi.number().integer().min(1).required(),
  offre_titre: Joi.string().trim().min(1).max(500).required(),
  entreprise_user_id: Joi.number().integer().min(1).required(),
  entreprise_nom: Joi.string().trim().max(300).allow("", null).optional(),
  candidature_id: Joi.number().integer().min(1).required(),
  etudiant_user_id: Joi.number().integer().min(1).required(),
  etudiant_nom: Joi.string().trim().max(300).allow("", null).optional(),
});

const schemaStatutCandidature = Joi.object({
  candidature_id: Joi.number().integer().min(1).required(),
  etudiant_user_id: Joi.number().integer().min(1).required(),
  statut: Joi.string().valid("accepte", "refuse").required(),
  offre_titre: Joi.string().trim().min(1).max(500).required(),
  entreprise_nom: Joi.string().trim().max(300).allow("", null).optional(),
});

function parserId(valeur) {
  const id = parseInt(String(valeur), 10);
  if (!Number.isInteger(id) || id < 1) return null;
  return id;
}

async function listerMes(req, res, next) {
  try {
    const liste = await Notification.findAll({
      where: { user_id: req.auth.user_id },
      order: [["created_at", "DESC"]],
    });

    const donnees = liste.map((n) => ({
      id: n.id,
      message: n.message,
      lu: n.lu,
      type: n.type,
      created_at: n.getDataValue("created_at") || n.createdAt,
    }));

    return res.json(donnees);
  } catch (erreur) {
    console.error("[listerMes] Erreur:", erreur.message);
    return res.status(500).json({
      message: "Impossible de charger les notifications",
    });
  }
}

async function marquerLu(req, res, next) {
  try {
    const id = parserId(req.params.id);
    if (id === null) {
      return res.status(400).json({ message: "Identifiant de notification invalide" });
    }

    const notif = await Notification.findOne({
      where: { id, user_id: req.auth.user_id },
    });

    if (!notif) {
      return res.status(404).json({ message: "Notification introuvable" });
    }

    await notif.update({ lu: true });
    await notif.reload();
    return res.json({
      id: notif.id,
      message: notif.message,
      lu: notif.lu,
      type: notif.type,
      created_at: notif.getDataValue("created_at") || notif.createdAt,
    });
  } catch (erreur) {
    console.error("[marquerLu] Erreur:", erreur.message);
    return res.status(500).json({
      message: "Impossible de marquer la notification comme lue",
    });
  }
}

async function marquerToutLu(req, res, next) {
  try {
    const [count] = await Notification.update(
      { lu: true },
      { where: { user_id: req.auth.user_id, lu: false } },
    );
    return res.json({ message: "Toutes les notifications ont ete marquees comme lues", updated: count });
  } catch (erreur) {
    console.error("[marquerToutLu] Erreur:", erreur.message);
    return res.status(500).json({ message: "Erreur lors de la mise a jour" });
  }
}

async function nouvelleOffre(req, res, next) {
  try {
    const resultat = validerCorps(schemaNouvelleOffre, req.body);
    if (!resultat.ok) {
      return res.status(400).json({ message: MESSAGE_VALIDATION });
    }

    const stats = await notificationService.traiterNouvelleOffre(resultat.value);
    return res.status(202).json({
      message: "Notifications diffusees",
      ...stats,
    });
  } catch (erreur) {
    return next(erreur);
  }
}

async function nouvelleCandidature(req, res, next) {
  try {
    const resultat = validerCorps(schemaNouvelleCandidature, req.body);
    if (!resultat.ok) {
      return res.status(400).json({ message: MESSAGE_VALIDATION });
    }

    const stats = await notificationService.traiterNouvelleCandidature(resultat.value);
    return res.status(202).json({
      message: "Notification candidature traitee",
      ...stats,
    });
  } catch (erreur) {
    return next(erreur);
  }
}

async function miseAJourStatutCandidature(req, res, next) {
  try {
    const resultat = validerCorps(schemaStatutCandidature, req.body);
    if (!resultat.ok) {
      return res.status(400).json({ message: MESSAGE_VALIDATION });
    }

    const stats = await notificationService.traiterChangementStatut(resultat.value);
    return res.status(202).json({
      message: "Notification statut traitee",
      ...stats,
    });
  } catch (erreur) {
    return next(erreur);
  }
}

module.exports = {
  listerMes,
  marquerLu,
  marquerToutLu,
  nouvelleOffre,
  nouvelleCandidature,
  miseAJourStatutCandidature,
};
