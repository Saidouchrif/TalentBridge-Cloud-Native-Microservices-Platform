// Point d'entrée serveur: connexion à la DB + sync Sequelize + écoute HTTP.
require("dotenv").config();

const { sequelize } = require("./Models");
const { app } = require("./app");

const PORT = process.env.PORT || 5003;

async function startServer() {
  // Retry simple: en docker-compose, PostgreSQL peut être en cours de démarrage.
  const maxAttempts = 15;
  const waitMs = 2000;

  let lastError = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await sequelize.authenticate();
      console.log("Connexion PostgreSQL OK (notifications-service).");
      lastError = null;
      break;
    } catch (err) {
      lastError = err;
      console.warn(
        `Tentative ${attempt}/${maxAttempts} - connexion PostgreSQL impossible:`,
        err.message
      );
      await new Promise((r) => setTimeout(r, waitMs));
    }
  }

  if (lastError) {
    throw lastError;
  }

  // Sync simple: pour ce projet pédagogique, on crée les tables automatiquement.
  // En production, il est recommandé d'utiliser des migrations.
  await sequelize.sync();

  app.listen(PORT, () => {
    console.log(`Notifications Service écoute sur le port ${PORT}`);
  });
}

// Démarrage uniquement si le fichier est exécuté directement.
if (require.main === module) {
  startServer().catch((err) => {
    console.error("Démarrage impossible (notifications-service):", err);
    process.exit(1);
  });
}

module.exports = { startServer };
