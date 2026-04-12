const jwt = require("jsonwebtoken");
const Etudiant = require("../models/etudiant.model");

const ROLE_ETUDIANT = "etudiant";

/**
 * Verifie le JWT Bearer, remplit req.auth (user_id, role).
 * Aligné sur Auth-User-service : payload attendu user_id, role, exp.
 */
function authentifierEtudiant(req, res, next) {
  const enTete = req.headers.authorization;
  if (!enTete || !enTete.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentification requise (jeton Bearer manquant)",
    });
  }

  const jeton = enTete.slice(7).trim();
  const secret = process.env.JWT_SECRET;
  const algorithme = process.env.JWT_ALGORITHM || "HS256";

  if (!secret) {
    return res.status(500).json({
      message: "Configuration serveur incomplete",
    });
  }

  try {
    const chargeUtile = jwt.verify(jeton, secret, { algorithms: [algorithme] });
    const identifiantUtilisateur = chargeUtile.user_id;
    const role = chargeUtile.role;

    if (
      identifiantUtilisateur === undefined ||
      identifiantUtilisateur === null ||
      role === undefined
    ) {
      return res.status(401).json({
        message: "Jeton invalide",
      });
    }

    if (role !== ROLE_ETUDIANT) {
      return res.status(403).json({
        message: "Accès réservé aux comptes étudiant",
      });
    }

    req.auth = {
      user_id: Number(identifiantUtilisateur),
      role,
    };
    return next();
  } catch {
    return res.status(401).json({
      message: "Jeton invalide ou expiré",
    });
  }
}

/**
 * Refuse l'acces si aucun profil Etudiant n'existe pour ce user_id.
 */
async function exigerProfilComplet(req, res, next) {
  try {
    const profil = await Etudiant.findOne({
      where: { user_id: req.auth.user_id },
    });
    if (!profil) {
      return res.status(403).json({
        message:
          "Vous devez créer et compléter votre profil étudiant avant d'utiliser cette fonctionnalité",
      });
    }
    return next();
  } catch (erreur) {
    return next(erreur);
  }
}

module.exports = {
  authentifierEtudiant,
  exigerProfilComplet,
  ROLE_ETUDIANT,
};
