// Middleware d'authentification pour tests (sans JWT).
// Pour les tests rapides, on attribue un ID utilisateur par défaut.
require("dotenv").config();

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function requireAuth(req, res, next) {
  // Pour les tests, on simule un utilisateur avec un ID par défaut
  req.user = {
    id: "test-user-id",
    email: "test@example.com"
  };

  return next();
}

module.exports = { requireAuth };
