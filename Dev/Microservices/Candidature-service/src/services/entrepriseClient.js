const axios = require("axios");

const ENTREPRISE_URL = () =>
  (process.env.ENTREPRISE_SERVICE_URL || "http://entreprise-service:8004").replace(/\/$/, "");

async function obtenirNomEntreprise(userId) {
  const id = Number(userId);
  if (!Number.isInteger(id) || id < 1) return null;

  try {
    const r = await axios.get(`${ENTREPRISE_URL()}/api/entreprise/public/${id}`, {
      timeout: 10000,
      validateStatus: (s) => s < 500,
    });
    if (r.status !== 200 || !r.data) return null;
    const nom = String(r.data.nomEntreprise || "").trim();
    return nom || null;
  } catch {
    return null;
  }
}

module.exports = { obtenirNomEntreprise };

