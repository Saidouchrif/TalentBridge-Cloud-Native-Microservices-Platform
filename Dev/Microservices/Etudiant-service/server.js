require("dotenv").config();

const sequelize = require("./src/config/db");
const app = require("./src/app");

const PORT = process.env.PORT || 8001;

async function demarrer() {
  await sequelize.assurerBaseExiste();
  await sequelize.authenticate();
  await sequelize.sync();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Serveur Etudiant-service lancé sur le port ${PORT}`);
  });
}

demarrer().catch((erreur) => {
  console.error("Echec du demarrage :", erreur);
  process.exit(1);
});
