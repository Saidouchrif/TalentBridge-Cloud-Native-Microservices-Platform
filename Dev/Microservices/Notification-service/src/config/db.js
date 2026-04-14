const { Sequelize } = require("sequelize");
const { Client } = require("pg");

async function assurerBaseExiste() {
  const urlComplete = process.env.DATABASE_URL;
  if (!urlComplete) {
    throw new Error("DATABASE_URL est obligatoire");
  }

  const url = new URL(urlComplete);
  const nomBase = decodeURIComponent(url.pathname.replace(/^\//, "").split("?")[0]);
  if (!nomBase) {
    throw new Error("DATABASE_URL doit contenir un nom de base");
  }

  url.pathname = "/postgres";
  const urlMaintenance = url.toString();

  const client = new Client({ connectionString: urlMaintenance });
  await client.connect();
  try {
    const { rows } = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [nomBase]
    );
    if (rows.length === 0) {
      const nomIdentifiant = nomBase.replace(/"/g, '""');
      await client.query(`CREATE DATABASE "${nomIdentifiant}"`);
    }
  } finally {
    await client.end();
  }
}

const sequelize = new Sequelize(process.env.DATABASE_URL || "", {
  dialect: "postgres",
  logging: false,
  define: {
    underscored: false,
  },
});

sequelize.assurerBaseExiste = assurerBaseExiste;

module.exports = sequelize;
