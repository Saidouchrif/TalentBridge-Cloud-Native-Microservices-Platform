const axios = require("axios");

const baseURL = () => (process.env.AUTH_SERVICE_URL || "").replace(/\/$/, "");

function entetesService() {
  const token = process.env.NOTIFICATION_INTERNAL_TOKEN || process.env.AUTH_SERVICE_ADMIN_TOKEN || "";
  return { "X-Service-Token": token };
}

async function listerUtilisateurs() {
  const base = baseURL();
  const headers = entetesService();
  if (!base || !headers["X-Service-Token"]) return null;

  try {
    const reponse = await axios.get(`${base}/api/internal/utilisateurs`, {
      headers,
      timeout: 15000,
      validateStatus: (s) => s < 500,
    });
    if (reponse.status !== 200 || !Array.isArray(reponse.data)) return null;
    return reponse.data;
  } catch {
    return null;
  }
}

async function obtenirUtilisateur(userId) {
  const base = baseURL();
  const headers = entetesService();
  if (!base || !headers["X-Service-Token"]) return null;

  try {
    const reponse = await axios.get(`${base}/api/internal/utilisateurs/${userId}`, {
      headers,
      timeout: 15000,
      validateStatus: (s) => s < 500,
    });
    if (reponse.status !== 200 || !reponse.data) return null;
    return reponse.data;
  } catch {
    return null;
  }
}

function filtrerEtudiantsAvecEmail(utilisateurs) {
  return utilisateurs
    .filter((u) => u && String(u.role).toLowerCase() === "etudiant" && u.email)
    .map((u) => ({
      user_id: Number(u.id),
      email: String(u.email).trim(),
    }));
}

function libelleUtilisateur(u) {
  if (!u) return "Candidat";
  const p = [u.prenom, u.nom].filter(Boolean).join(" ").trim();
  return p || u.email || "Candidat";
}

module.exports = {
  listerUtilisateurs,
  obtenirUtilisateur,
  filtrerEtudiantsAvecEmail,
  libelleUtilisateur,
};
