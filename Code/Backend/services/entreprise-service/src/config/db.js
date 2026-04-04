// Configuration Sequelize (PostgreSQL) pour le microservice Entreprise.
// Le même pattern est utilisé dans `auth-service` pour rester cohérent.
require("dotenv").config();

const { Sequelize } = require("sequelize");

// Dialecte DB flexible pour permettre l'exécution des tests même sans PostgreSQL.
// - En production/CI: `DB_DIALECT=postgres`
// - En local dev: si aucune config Postgres n'est fournie, on bascule automatiquement en SQLite.
const dbDialect =
  process.env.DB_DIALECT ||
  // Heuristique : si DB_NAME n'est pas renseigné, on suppose qu'on n'a pas de Postgres local.
  (process.env.DB_NAME ? "postgres" : "sqlite");

let sequelize;

if (dbDialect === "sqlite") {
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: process.env.SQLITE_STORAGE || ":memory:",
    logging: false
  });
} else {
  // En mode PostgreSQL, on exige une configuration minimale.
  // Si certaines variables manquent, Sequelize affichera une erreur de connexion.
  const DB_HOST = process.env.DB_HOST || "localhost";
  const DB_PORT = Number(process.env.DB_PORT || 5432);
  const DB_USER = process.env.DB_USER || "postgres";
  const DB_PASSWORD = process.env.DB_PASSWORD || "postgres";
  const DB_NAME = process.env.DB_NAME || "postgres";

  sequelize = new Sequelize(
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    {
      host: DB_HOST,
      port: DB_PORT,
      dialect: "postgres",
      logging: false
      // En pédagogie on utilise `sequelize.sync()` au démarrage.
    }
  );
}

module.exports = sequelize;

