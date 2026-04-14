const axios = require("axios");

function baseOffres() {
  return (process.env.OFFRES_SERVICE_URL || "").replace(/\/$/, "");
}

async function listerOffresActives(maxTotal = 500) {
  const base = baseOffres();
  if (!base) {
    throw Object.assign(new Error("Service offres non configure"), { statusCode: 503 });
  }

  const limitePage = 100;
  const toutes = [];
  let page = 1;

  while (toutes.length < maxTotal) {
    const reponse = await axios.get(`${base}/api/offres`, {
      params: {
        statut: "actif",
        limit: limitePage,
        page,
      },
      timeout: 20000,
      validateStatus: (s) => s < 500,
    });

    if (reponse.status !== 200 || !reponse.data) {
      throw Object.assign(new Error("Impossible de charger les offres"), {
        statusCode: 502,
      });
    }

    const lignes = Array.isArray(reponse.data.data) ? reponse.data.data : [];
    toutes.push(...lignes);

    const total = reponse.data.pagination?.total ?? lignes.length;
    if (lignes.length < limitePage || toutes.length >= total) {
      break;
    }
    page += 1;
  }

  return toutes.slice(0, maxTotal);
}

async function obtenirOffreParId(offreId) {
  const base = baseOffres();
  if (!base) {
    throw Object.assign(new Error("Service offres non configure"), { statusCode: 503 });
  }

  const reponse = await axios.get(`${base}/api/offres/${offreId}`, {
    timeout: 15000,
    validateStatus: () => true,
  });

  if (reponse.status === 404) {
    return null;
  }
  if (reponse.status !== 200) {
    throw Object.assign(new Error("Impossible de charger l'offre"), { statusCode: 502 });
  }
  return reponse.data;
}

module.exports = {
  listerOffresActives,
  obtenirOffreParId,
};
