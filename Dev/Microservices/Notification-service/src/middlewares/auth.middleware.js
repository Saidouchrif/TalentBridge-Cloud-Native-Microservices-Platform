const jwt = require("jsonwebtoken");

function jwtSecret() {
  return process.env.JWT_SECRET || process.env.SECRET_KEY;
}

function jwtAlgorithm() {
  return process.env.JWT_ALGORITHM || process.env.ALGORITHM || "HS256";
}

function authenticateJWT(req, res, next) {
  const enTete = req.headers.authorization;
  if (!enTete || !enTete.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentification requise (jeton Bearer manquant)",
    });
  }

  const jeton = enTete.slice(7).trim();
  const secret = jwtSecret();
  const algorithme = jwtAlgorithm();

  if (!secret) {
    console.error(
      "[auth] JWT_SECRET et SECRET_KEY sont absents. " +
        "Definissez SECRET_KEY (meme valeur que Auth-User-service)."
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
        message: "Jeton invalide (payload incomplet)",
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

module.exports = { authenticateJWT, jwtSecret, jwtAlgorithm };
