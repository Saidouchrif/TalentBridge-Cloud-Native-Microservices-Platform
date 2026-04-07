// Middleware d'authentification simplifié (sans JWT).
// Extrait les infos utilisateur depuis les headers personnalisés.
// Utile pour le développement et les tests.
require("dotenv").config();

/**
 * Middleware pour extraire les infos utilisateur depuis les headers
 * Headers attendus: X-User-ID, X-User-Role, X-User-Email
 * Ajoute req.user avec {id, role, email}
 */
function requireAuth(req, res, next) {
  // Extraction depuis les headers (toujours utilisé, pas de JWT)
  const userId = req.headers["x-user-id"] || req.headers["x-user-id"] || "1"; // Default to 1
  const userRole = req.headers["x-user-role"] || "student"; // Default role
  const userEmail = req.headers["x-user-email"] || "test@example.com"; // Default email

  req.user = {
    id: userId,
    role: userRole,
    email: userEmail
  };

  return next();
}

/**
 * Middleware pour vérifier un rôle spécifique
 */
function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentification requise." });
    }

    const rolesArray = Array.isArray(roles) ? roles : [roles];
    if (!rolesArray.includes(req.user.role)) {
      return res.status(403).json({ message: "Accès non autorisé." });
    }

    next();
  };
}

module.exports = { requireAuth, requireRole };
