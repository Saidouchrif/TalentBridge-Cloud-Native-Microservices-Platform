// Validation des champs requis
/**
 * @param {string} fieldName
 * @param {any} value
 */
function assertRequired(fieldName, value) {
  if (value === undefined || value === null || value === "") {
    const err = new Error(`Le champ '${fieldName}' est requis.`);
    err.statusCode = 400;
    throw err;
  }
}

module.exports = { assertRequired };
