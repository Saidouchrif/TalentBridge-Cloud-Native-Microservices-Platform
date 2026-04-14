const axios = require("axios");

const baseURL = (process.env.OFFRES_SERVICE_URL || "http://localhost:8002").replace(/\/$/, "");
const serviceToken = process.env.SERVICE_INTERNAL_TOKEN || "";

const client = axios.create({
  baseURL,
  timeout: 10000,
  validateStatus: () => true,
});

/**
 * GET /api/offres/:id — verifie existence et retourne le corps (statut HTTP + data).
 */
async function fetchOffreParId(offreId) {
  const reponse = await client.get(`/api/offres/${offreId}`);
  return {
    status: reponse.status,
    data: reponse.data,
  };
}

/**
 * POST /api/offres/:id/increment-candidatures — compteur offres (jeton inter-services).
 */
async function incrementerCandidatures(offreId) {
  if (!serviceToken) {
    throw new Error("SERVICE_INTERNAL_TOKEN manquant");
  }
  const reponse = await client.post(
    `/api/offres/${offreId}/increment-candidatures`,
    {},
    {
      headers: { "X-Service-Token": serviceToken },
    }
  );
  return {
    status: reponse.status,
    data: reponse.data,
  };
}

module.exports = {
  fetchOffreParId,
  incrementerCandidatures,
  baseURL,
};
