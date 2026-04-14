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
  "test_jwt_secret_candidature";
process.env.JWT_ALGORITHM =
  process.env.JWT_ALGORITHM ||
  variablesEnvFichier.JWT_ALGORITHM ||
  "HS256";
process.env.SERVICE_INTERNAL_TOKEN =
  process.env.SERVICE_INTERNAL_TOKEN ||
  variablesEnvFichier.SERVICE_INTERNAL_TOKEN ||
  "ci_service_token";

jest.mock("../src/services/offresClient", () => ({
  fetchOffreParId: jest.fn(async (id) => ({
    status: 200,
    data: {
      id,
      statut: "actif",
      entreprise_id: 900,
      titre: "Offre mock",
      competencesRequises: "JavaScript",
      localisation: "Paris",
    },
  })),
  incrementerCandidatures: jest.fn(async () => ({
    status: 200,
    data: { nombreCandidatures: 1 },
  })),
}));

function resoudreUrlBaseTests() {
  if (process.env.TEST_DATABASE_URL) {
    return process.env.TEST_DATABASE_URL;
  }
  const repli = "postgresql://test:test@127.0.0.1:5432/application_test";
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
    u.pathname = "/application_test";
    return u.toString();
  } catch {
    return repli;
  }
}

process.env.DATABASE_URL = resoudreUrlBaseTests();

require("../src/models/application.model");

const sequelize = require("../src/config/db");

beforeAll(async () => {
  await sequelize.assurerBaseExiste();
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
});
