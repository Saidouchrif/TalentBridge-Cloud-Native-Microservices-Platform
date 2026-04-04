// Helper pour éviter la répétition des try/catch sur les handlers async.
// Toute erreur sera redirigée vers le middleware de gestion d'erreurs d'Express.
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { asyncHandler };

