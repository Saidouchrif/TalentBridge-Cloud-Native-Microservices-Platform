const jwt = require("jsonwebtoken");

const ROLE_ETUDIANT = "etudiant";
const ROLE_ENTREPRISE = "entreprise";

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
      message: "Jeton invalide ou expir\u00e9",
    });
  }
}

function requireEtudiant(req, res, next) {
  if (req.auth?.role !== ROLE_ETUDIANT) {
    return res.status(403).json({
      message: "Cette action est r\u00e9serv\u00e9e aux comptes \u00e9tudiant",
    });
  }
  return next();
}

function requireEntreprise(req, res, next) {
  if (req.auth?.role !== ROLE_ENTREPRISE) {
    return res.status(403).json({
      message: "Cette action est r\u00e9serv\u00e9e aux comptes entreprise",
    });
  }
  return next();
}

module.exports = {
  authenticateJWT,
  requireEtudiant,
  requireEntreprise,
  ROLE_ETUDIANT,
  ROLE_ENTREPRISE,
};
