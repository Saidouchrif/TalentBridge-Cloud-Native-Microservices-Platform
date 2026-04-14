const Document = require("../models/document.model");

function parserId(valeur) {
  const id = parseInt(String(valeur), 10);
  if (!Number.isInteger(id) || id < 1) {
    return null;
  }
  return id;
}

async function listerMes(req, res, next) {
  try {
    const liste = await Document.findAll({
      where: { user_id: req.auth.user_id },
      order: [["dateGeneration", "DESC"]],
      attributes: ["id", "type", "contenu", "dateGeneration", "user_id"],
    });
    return res.json(liste);
  } catch (erreur) {
    return next(erreur);
  }
}

async function supprimer(req, res, next) {
  try {
    const id = parserId(req.params.id);
    if (id === null) {
      return res.status(400).json({ message: "Identifiant de document invalide" });
    }

    const doc = await Document.findOne({
      where: { id, user_id: req.auth.user_id },
    });

    if (!doc) {
      return res.status(404).json({ message: "Document introuvable" });
    }

    await doc.destroy();
    return res.status(204).send();
  } catch (erreur) {
    return next(erreur);
  }
}

module.exports = {
  listerMes,
  supprimer,
};
