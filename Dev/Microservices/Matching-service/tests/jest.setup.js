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
  "test_jwt_secret_matching";
process.env.JWT_ALGORITHM =
  process.env.JWT_ALGORITHM ||
  variablesEnvFichier.JWT_ALGORITHM ||
  "HS256";
process.env.MATCHING_SERVICE_TOKEN =
  process.env.MATCHING_SERVICE_TOKEN ||
  variablesEnvFichier.MATCHING_SERVICE_TOKEN ||
  "ci_matching_token";

jest.mock("../src/services/etudiantClient", () => ({
  chargerProfilEtudiantConnecte: jest.fn().mockResolvedValue({
    localisation: "Paris",
    competences: [{ nom: "JavaScript", niveau: "avance" }],
    experiences: [{ dateDebut: "2022-01-01", dateFin: "2023-01-01" }],
  }),
  chargerProfilPourMatching: jest.fn().mockResolvedValue({
    localisation: "Paris",
    competences: [{ nom: "JavaScript", niveau: "avance" }],
    experiences: [],
  }),
}));

jest.mock("../src/services/offresClient", () => ({
  listerOffresActives: jest.fn().mockResolvedValue([
    {
      id: 1,
      competencesRequises: "JavaScript React",
      localisation: "Paris",
      statut: "actif",
    },
    {
      id: 2,
      competencesRequises: "Python",
      localisation: "Lyon",
      statut: "actif",
    },
  ]),
  obtenirOffreParId: jest.fn().mockResolvedValue({
    id: 99,
    entreprise_id: 50,
    titre: "Poste test",
    competencesRequises: "JavaScript",
    localisation: "Paris",
  }),
}));

jest.mock("../src/services/candidatureClient", () => ({
  listerCandidaturesPourOffre: jest.fn().mockResolvedValue([
    { user_id: 33, message: "Expert JS", cv: "javascript react node" },
  ]),
}));

function resoudreUrlBaseTests() {
  if (process.env.TEST_DATABASE_URL) {
    return process.env.TEST_DATABASE_URL;
  }
  const repli = "postgresql://test:test@127.0.0.1:5432/matching_test";
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
    u.pathname = "/matching_test";
    return u.toString();
  } catch {
    return repli;
  }
}

process.env.DATABASE_URL = resoudreUrlBaseTests();

require("../src/models/matching.model");

const sequelize = require("../src/config/db");

beforeAll(async () => {
  await sequelize.assurerBaseExiste();
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
});
