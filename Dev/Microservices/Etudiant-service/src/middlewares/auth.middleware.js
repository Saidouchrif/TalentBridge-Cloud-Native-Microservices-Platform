const jwt = require("jsonwebtoken");
const Etudiant = require("../models/etudiant.model");

const ROLE_ETUDIANT = "etudiant";

function authentifierEtudiant(req, res, next) {
  const enTete = req.headers.authorization;
  if (!enTete || !enTete.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentification requise (jeton Bearer manquant)",
    });
  }

  const jeton = enTete.slice(7).trim();
  const secret =
    process.env.JWT_SECRET || process.env.SECRET_KEY;
  const algorithme =
    process.env.JWT_ALGORITHM || process.env.ALGORITHM || "HS256";

  if (!secret) {
    console.error(
      "[auth] JWT_SECRET et SECRET_KEY sont absents. " +
        "Definissez JWT_SECRET (meme valeur que Auth-User-service SECRET_KEY)."
    );
    return res.status(500).json({
      message: "Configuration serveur incomplete (cle JWT manquante)",
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
        message: "Acces reserve aux comptes etudiant",
      });
    }

    req.auth = {
      user_id: Number(identifiantUtilisateur),
      role,
    };
    return next();
  } catch (err) {
    console.error("[auth] Echec verification JWT:", err.message);
    return res.status(401).json({
      message: "Jeton invalide ou expire",
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
          "Vous devez cr\u00e9er et compl\u00e9ter votre profil \u00e9tudiant avant d'utiliser cette fonctionnalit\u00e9",
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
