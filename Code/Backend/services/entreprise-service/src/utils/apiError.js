// Classe d'erreur utilitaire pour standardiser les réponses REST.
class ApiError extends Error {
  /**
   * @param {number} statusCode Code HTTP à retourner.
   * @param {string} message Message lisible pour le client.
   * @param {object} [details] Détails techniques (optionnel).
   */
  constructor(statusCode, message, details) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

module.exports = { ApiError };

