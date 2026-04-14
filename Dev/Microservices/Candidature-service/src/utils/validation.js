const MESSAGE_VALIDATION = "Les donn\u00e9es envoy\u00e9es sont invalides";

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
