const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const cheminEnv = path.join(__dirname, "..", ".env");
let variablesEnvFichier = {};
if (fs.existsSync(cheminEnv)) {
  variablesEnvFichier = dotenv.parse(fs.readFileSync(cheminEnv, "utf8"));
}

process.env.JWT_SECRET =
  process.env.JWT_SECRET ||
  variablesEnvFichier.JWT_SECRET ||
  "test_jwt_secret_ci";
process.env.JWT_ALGORITHM =
  process.env.JWT_ALGORITHM ||
  variablesEnvFichier.JWT_ALGORITHM ||
  "HS256";
process.env.MATCHING_SERVICE_TOKEN =
  process.env.MATCHING_SERVICE_TOKEN ||
  variablesEnvFichier.MATCHING_SERVICE_TOKEN ||
  "ci_matching_token";

/**
 * URL des tests : TEST_DATABASE_URL, sinon derivee du .env (hote docker -> 127.0.0.1, base etudiant_test).
 */
function resoudreUrlBaseTests() {
  if (process.env.TEST_DATABASE_URL) {
    return process.env.TEST_DATABASE_URL;
  }

  const repli = "postgresql://test:test@127.0.0.1:5432/etudiant_test";
  const urlApplication =
    variablesEnvFichier.DATABASE_URL || process.env.DATABASE_URL;
  if (!urlApplication) {
    return repli;
  }

  try {
    const u = new URL(urlApplication);
    const hote = u.hostname.toLowerCase();
    if (hote === "postgres" || hote === "postgres_db") {
      u.hostname = "127.0.0.1";
    }
    u.pathname = "/etudiant_test";
    return u.toString();
  } catch {
    return repli;
  }
}

process.env.DATABASE_URL = resoudreUrlBaseTests();

require("../src/models/etudiant.model");
require("../src/models/experience.model");
require("../src/models/formation.model");
require("../src/models/competence.model");
require("../src/models/langue.model");

const sequelize = require("../src/config/db");

function masquerMotDePasseUrl(url) {
  try {
    const u = new URL(url);
    if (u.password) u.password = "****";
    return u.toString();
  } catch {
    return "(URL invalide)";
  }
}

/**
 * Important : creer la base etudiant_test AVANT sequelize.authenticate(),
 * sinon PostgreSQL repond "database does not exist".
 */
async function attendrePostgresEtPreparerBase() {
  const delaiMs = 500;
  const maxTentatives = 60;
  for (let tentative = 0; tentative < maxTentatives; tentative += 1) {
    try {
      await sequelize.assurerBaseExiste();
      await sequelize.authenticate();
      return;
    } catch {
      await new Promise((resolve) => {
        setTimeout(resolve, delaiMs);
      });
    }
  }
  throw new Error(
    "PostgreSQL indisponible pour les tests. Actions : " +
      "(1) Depuis Dev/, lancer : docker compose up -d postgres. " +
      "(2) Verifier le port 5432 et le .env (talentbridge_user / talentbridge_password). " +
      "(3) PowerShell : Remove-Item Env:TEST_DATABASE_URL si valeur obsolete. " +
      "URL : " +
      masquerMotDePasseUrl(process.env.DATABASE_URL)
  );
}

beforeAll(async () => {
  await attendrePostgresEtPreparerBase();
  await sequelize.sync({ force: true });
});
