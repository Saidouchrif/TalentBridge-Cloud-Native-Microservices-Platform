const MESSAGE_VALIDATION = "Les données envoyées sont invalides";

/**
 * Valide un corps JSON avec Joi. Ne renvoie jamais de details techniques au client.
 * @returns {{ ok: true, value: object } | { ok: false }}
 */
function validerCorps(schema, corps) {
  const { error, value } = schema.validate(corps, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) {
    return { ok: false };
  }
  return { ok: true, value };
}

module.exports = {
  validerCorps,
  MESSAGE_VALIDATION,
};
