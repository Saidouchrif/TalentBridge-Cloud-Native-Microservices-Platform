const jwt = require("jsonwebtoken");

function jwtSecret() {
  return process.env.JWT_SECRET || process.env.SECRET_KEY;
}

/**
 * Lit le Bearer token, decode le JWT Auth, expose req.auth.user_id (et role si present).
 */
function authenticateJWT(req, res, next) {
  const enTete = req.headers.authorization;
  if (!enTete || !enTete.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentification requise (jeton Bearer manquant)",
    });
  }

  const jeton = enTete.slice(7).trim();
  const secret = jwtSecret();
  const algorithme = process.env.JWT_ALGORITHM || process.env.ALGORITHM || "HS256";

  if (!secret) {
    return res.status(500).json({
      message: "Configuration serveur incomplete",
    });
  }

  try {
    const chargeUtile = jwt.verify(jeton, secret, { algorithms: [algorithme] });
    const identifiantUtilisateur = chargeUtile.user_id;

    if (identifiantUtilisateur === undefined || identifiantUtilisateur === null) {
      return res.status(401).json({
        message: "Jeton invalide",
      });
    }

    req.auth = {
      user_id: Number(identifiantUtilisateur),
      role: chargeUtile.role,
    };
    return next();
  } catch {
    return res.status(401).json({
      message: "Jeton invalide ou expire",
    });
  }
}

module.exports = { authenticateJWT, jwtSecret };
