// Petites fonctions utilitaires pour la validation.

/**
 * Vérifie qu'une valeur n'est ni nulle ni une chaîne vide.
 * @param {string} field Nom du champ (pour message d'erreur).
 * @param {any} value Valeur à tester.
 */
function assertRequired(field, value) {
  if (value === undefined || value === null) {
    const err = new Error(`Le champ "${field}" est requis.`);
    err.statusCode = 400;
    throw err;
  }

  if (typeof value === "string" && value.trim().length === 0) {
    const err = new Error(`Le champ "${field}" ne peut pas être vide.`);
    err.statusCode = 400;
    throw err;
  }
}

module.exports = { assertRequired };

