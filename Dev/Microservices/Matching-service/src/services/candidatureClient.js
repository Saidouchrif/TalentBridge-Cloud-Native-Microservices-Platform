const axios = require("axios");

function baseCandidature() {
  return (process.env.CANDIDATURE_SERVICE_URL || "").replace(/\/$/, "");
}

async function listerCandidaturesPourOffre(bearerToken, offreId) {
  const base = baseCandidature();
  if (!base) {
    throw Object.assign(new Error("Service candidature non configure"), {
      statusCode: 503,
    });
  }

  const reponse = await axios.get(`${base}/api/candidatures/offre/${offreId}`, {
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      "Content-Type": "application/json",
    },
    timeout: 20000,
    validateStatus: () => true,
  });

  if (reponse.status === 403) {
    throw Object.assign(new Error("Vous n'avez pas acces a cette offre"), {
      statusCode: 403,
    });
  }
  if (reponse.status === 404) {
    throw Object.assign(new Error("Offre introuvable ou sans acces"), {
      statusCode: 404,
    });
  }
  if (reponse.status !== 200 || !Array.isArray(reponse.data)) {
    throw Object.assign(new Error("Impossible de charger les candidatures"), {
      statusCode: 502,
    });
  }

  return reponse.data;
}

module.exports = {
  listerCandidaturesPourOffre,
};
