const axios = require("axios");

function baseEtudiant() {
  return (process.env.STUDENT_SERVICE_URL || "").replace(/\/$/, "");
}

function enteteBearer(jeton) {
  return {
    Authorization: `Bearer ${jeton}`,
    "Content-Type": "application/json",
  };
}

function enteteService() {
  const t = process.env.MATCHING_SERVICE_TOKEN || "";
  return {
    "X-Service-Token": t,
    "Content-Type": "application/json",
  };
}

async function chargerProfilEtudiantConnecte(bearerToken) {
  const base = baseEtudiant();
  if (!base) {
    throw Object.assign(new Error("Service etudiant non configure"), {
      statusCode: 503,
    });
  }

  const headers = enteteBearer(bearerToken);
  const timeout = 15000;

  const [profil, competences, experiences] = await Promise.all([
    axios.get(`${base}/api/etudiant/me`, { headers, timeout, validateStatus: () => true }),
    axios.get(`${base}/api/etudiant/competence`, { headers, timeout, validateStatus: () => true }),
    axios.get(`${base}/api/etudiant/experience`, { headers, timeout, validateStatus: () => true }),
  ]);

  if (profil.status === 404) {
    throw Object.assign(new Error("Profil etudiant introuvable"), { statusCode: 404 });
  }
  if (profil.status !== 200) {
    throw Object.assign(new Error("Impossible de charger le profil etudiant"), {
      statusCode: 502,
    });
  }

  const compOk = competences.status === 200 && Array.isArray(competences.data);
  const expOk = experiences.status === 200 && Array.isArray(experiences.data);

  return {
    localisation: profil.data.localisation,
    competences: compOk
      ? competences.data.map((c) => ({ nom: c.nom, niveau: c.niveau }))
      : [],
    experiences: expOk
      ? experiences.data.map((e) => ({
          dateDebut: e.dateDebut,
          dateFin: e.dateFin,
        }))
      : [],
  };
}

/**
 * Profil agrege pour un user_id (appel inter-service securise par X-Service-Token).
 */
async function chargerProfilPourMatching(userId) {
  const base = baseEtudiant();
  const token = process.env.MATCHING_SERVICE_TOKEN;
  if (!base || !String(token || "").trim()) {
    return null;
  }

  try {
    const reponse = await axios.get(
      `${base}/api/etudiant/service/users/${userId}/matching-profile`,
      {
        headers: enteteService(),
        timeout: 15000,
        validateStatus: (s) => s < 500,
      }
    );
    if (reponse.status !== 200 || !reponse.data) {
      return null;
    }
    return {
      localisation: reponse.data.localisation,
      competences: Array.isArray(reponse.data.competences) ? reponse.data.competences : [],
      experiences: Array.isArray(reponse.data.experiences) ? reponse.data.experiences : [],
    };
  } catch {
    return null;
  }
}

module.exports = {
  chargerProfilEtudiantConnecte,
  chargerProfilPourMatching,
};
