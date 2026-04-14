/**
 * Authentification service-a-service (Candidature-service -> Offres-service).
 * Header : X-Service-Token doit correspondre a SERVICE_INTERNAL_TOKEN.
 */
function verifyServiceToken(req, res, next) {
  const secret = process.env.SERVICE_INTERNAL_TOKEN;
  if (!secret || !String(secret).trim()) {
    return res.status(503).json({
      message: "Configuration inter-services incomplete",
    });
  }

  const token = req.headers["x-service-token"];
  if (!token || token !== secret) {
    return res.status(401).json({
      message: "Jeton de service invalide",
    });
  }

  return next();
}

module.exports = { verifyServiceToken };
