const axios = require("axios");

const AUTH_URL = () => (process.env.AUTH_SERVICE_URL || "http://auth-user-service:8000").replace(/\/$/, "");

function entetesService() {
  const token = process.env.NOTIFICATION_INTERNAL_TOKEN || "";
  return { "X-Service-Token": token };
}

async function obtenirUtilisateur(userId) {
  try {
    const r = await axios.get(`${AUTH_URL()}/api/internal/utilisateurs/${userId}`, {
      headers: entetesService(),
      timeout: 10000,
      validateStatus: (s) => s < 500,
    });
    if (r.status === 200 && r.data) return r.data;
    return null;
  } catch {
    return null;
  }
}

function libelleUtilisateur(u) {
  if (!u) return null;
  const parts = [u.prenom, u.nom].filter(Boolean);
  return parts.length ? parts.join(" ").trim() : u.email || null;
}

module.exports = { obtenirUtilisateur, libelleUtilisateur };
