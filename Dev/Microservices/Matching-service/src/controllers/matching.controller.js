const matchingService = require("../services/matching.service");

function extraireBearer(req) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith("Bearer ")) {
    return null;
  }
  return h.slice(7).trim();
}

function parserOffreId(valeur) {
  const id = parseInt(String(valeur), 10);
  if (!Number.isInteger(id) || id < 1) {
    return null;
  }
  return id;
}

async function offresPourEtudiant(req, res, next) {
  try {
    const bearer = extraireBearer(req);
    if (!bearer) {
      return res.status(401).json({
        message: "Authentification requise (jeton Bearer manquant)",
      });
    }

    const resultat = await matchingService.recommanderOffresPourEtudiant(
      bearer,
      req.auth.user_id
    );
    return res.json(resultat);
  } catch (erreur) {
    return next(erreur);
  }
}

async function candidatsPourOffre(req, res, next) {
  try {
    const bearer = extraireBearer(req);
    if (!bearer) {
      return res.status(401).json({
        message: "Authentification requise (jeton Bearer manquant)",
      });
    }

    const offreId = parserOffreId(req.params.offre_id);
    if (offreId === null) {
      return res.status(400).json({ message: "Identifiant d'offre invalide" });
    }

    const resultat = await matchingService.recommanderCandidatsPourOffre(
      bearer,
      req.auth.user_id,
      offreId
    );
    return res.json(resultat);
  } catch (erreur) {
    return next(erreur);
  }
}

module.exports = {
  offresPourEtudiant,
  candidatsPourOffre,
};
