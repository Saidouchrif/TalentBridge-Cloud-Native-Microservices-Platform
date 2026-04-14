/**
 * Appels inter-services (Offres, Candidature) : header X-Service-Token.
 */
function verifyServiceToken(req, res, next) {
  const attendu =
    process.env.NOTIFICATION_INTERNAL_TOKEN ||
    process.env.SERVICE_INTERNAL_TOKEN ||
    "";

  if (!String(attendu).trim()) {
    return res.status(503).json({
      message: "Configuration inter-services incomplete",
    });
  }

  const token = req.headers["x-service-token"];
  if (!token || token !== attendu) {
    return res.status(401).json({
      message: "Jeton de service invalide",
    });
  }

  return next();
}

module.exports = { verifyServiceToken };
