function validerCorps(schema, corps) {
  const { error, value } = schema.validate(corps, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) {
    return { ok: false, erreur: error };
  }
  return { ok: true, value };
}

const MESSAGE_VALIDATION =
  "Les informations envoyees sont invalides ou incompletes";

module.exports = { validerCorps, MESSAGE_VALIDATION };
