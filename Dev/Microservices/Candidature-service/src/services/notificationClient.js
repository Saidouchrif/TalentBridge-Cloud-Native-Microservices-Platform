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

async function notifierNouvelleCandidature(corps) {
  const base = baseURL();
  const jeton = process.env.NOTIFICATION_INTERNAL_TOKEN;
  if (!base || !String(jeton).trim()) {
    return { ignore: true };
  }
  try {
    const reponse = await axios.post(`${base}/api/notifications/new-candidature`, corps, {
      headers: entetesService(),
      timeout: 60000,
      validateStatus: (s) => s < 500,
    });
    return { statut: reponse.status, ok: reponse.status === 202 };
  } catch {
    return { ok: false };
  }
}

async function notifierChangementStatutCandidature(corps) {
  const base = baseURL();
  const jeton = process.env.NOTIFICATION_INTERNAL_TOKEN;
  if (!base || !String(jeton).trim()) {
    return { ignore: true };
  }
  try {
    const reponse = await axios.post(`${base}/api/notifications/status-update`, corps, {
      headers: entetesService(),
      timeout: 60000,
      validateStatus: (s) => s < 500,
    });
    return { statut: reponse.status, ok: reponse.status === 202 };
  } catch {
    return { ok: false };
  }
}

module.exports = {
  notifierNouvelleCandidature,
  notifierChangementStatutCandidature,
};
