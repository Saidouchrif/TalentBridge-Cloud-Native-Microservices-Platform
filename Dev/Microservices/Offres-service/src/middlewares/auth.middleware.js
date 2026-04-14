const jwt = require("jsonwebtoken");

const ROLE_ENTREPRISE = "entreprise";
const ROLE_ETUDIANT = "etudiant";

/**
 * Verifie le JWT Bearer, remplit req.auth { user_id, role }.
 * Aligne sur Auth-User-service : user_id, role, exp.
 */
function authenticateJWT(req, res, next) {
  const enTete = req.headers.authorization;
  if (!enTete || !enTete.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentification requise (jeton Bearer manquant)",
    });
  }

  const jeton = enTete.slice(7).trim();
  const secret = process.env.JWT_SECRET || process.env.SECRET_KEY;
  const algorithme =
    process.env.JWT_ALGORITHM || process.env.ALGORITHM || "HS256";

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

    req.auth = {
      user_id: Number(identifiantUtilisateur),
      role,
    };
    return next();
  } catch {
    return res.status(401).json({
      message: "Jeton invalide ou expirù",
    });
  }
}

/** Creation / modification / suppression d'offres : comptes entreprise uniquement. */
function requireEntreprise(req, res, next) {
  if (req.auth?.role !== ROLE_ENTREPRISE) {
    return res.status(403).json({
      message: "Cette action est rùservùe aux comptes entreprise",
    });
  }
  return next();
}

module.exports = {
  authenticateJWT,
  requireEntreprise,
  ROLE_ENTREPRISE,
  ROLE_ETUDIANT,
};
