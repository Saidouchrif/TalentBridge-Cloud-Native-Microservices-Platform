const axios = require("axios");

function baseURL() {
  return (process.env.NOTIFICATION_SERVICE_URL || "").replace(/\/$/, "");
}

function entetesService() {
  const jeton = process.env.NOTIFICATION_INTERNAL_TOKEN || "";
  return {
    "Content-Type": "application/json",
    "X-Service-Token": jeton,
  };
}

/**
 * Declenche emails + notifications etudiants (asynchrone, ne bloque pas la reponse HTTP).
 */
async function notifierNouvelleOffre(corps) {
  const base = baseURL();
  const jeton = process.env.NOTIFICATION_INTERNAL_TOKEN;
  if (!base || !String(jeton).trim()) {
    return { ignore: true };
  }

  try {
    const reponse = await axios.post(`${base}/api/notifications/new-offre`, corps, {
      headers: entetesService(),
      timeout: 180000,
      validateStatus: (s) => s < 500,
    });
    return { statut: reponse.status, ok: reponse.status === 202 };
  } catch {
    return { ok: false };
  }
}

module.exports = { notifierNouvelleOffre };
