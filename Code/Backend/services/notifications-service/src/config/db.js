// Configuration Sequelize (PostgreSQL) pour le microservice Notifications.
// Pattern identique aux autres services pour cohérence.
require("dotenv").config();

const { Sequelize } = require("sequelize");

// Dialecte DB flexible pour permettre l'exécution des tests même sans PostgreSQL.
// - En production/CI: `DB_DIALECT=postgres`
// - En local dev: si aucune config Postgres n'est fournie, on bascule en SQLite.
const dbDialect =
  process.env.DB_DIALECT ||
  (process.env.NODE_ENV === "test" ? "sqlite" : process.env.DB_NAME ? "postgres" : "sqlite");

let sequelize;

if (dbDialect === "sqlite") {
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: process.env.SQLITE_STORAGE || ":memory:",
    logging: false
  });
} else {
  // En mode PostgreSQL.
  const DB_HOST = process.env.DB_HOST || "localhost";
  const DB_PORT = Number(process.env.DB_PORT || 5432);
  const DB_USER = process.env.DB_USER || "postgres";
  const DB_PASSWORD = process.env.DB_PASSWORD || "postgres";
  const DB_NAME = process.env.DB_NAME || "notifications_db";

  sequelize = new Sequelize(
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    {
      host: DB_HOST,
      port: DB_PORT,
      dialect: "postgres",
      logging: false
    }
  );
}

module.exports = sequelize;
