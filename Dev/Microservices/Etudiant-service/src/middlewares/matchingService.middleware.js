/**
 * Acces restreint au Matching-service (header X-Service-Token).
 */
function verifierJetonMatching(req, res, next) {
  const attendu = (process.env.MATCHING_SERVICE_TOKEN || "").trim();
  const recu = req.headers["x-service-token"];

  if (!attendu) {
    return res.status(503).json({
      message: "Endpoint inter-service non configure",
    });
  }
  if (!recu || recu !== attendu) {
    return res.status(401).json({
      message: "Jeton de service invalide",
    });
  }
  return next();
}

module.exports = { verifierJetonMatching };
