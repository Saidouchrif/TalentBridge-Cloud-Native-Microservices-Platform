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
  variablesEnvFichier.SECRET_KEY ||
  "test_jwt_secret_notification";
process.env.SECRET_KEY = process.env.JWT_SECRET;
process.env.JWT_ALGORITHM =
  process.env.JWT_ALGORITHM ||
  variablesEnvFichier.JWT_ALGORITHM ||
  variablesEnvFichier.ALGORITHM ||
  "HS256";
process.env.NOTIFICATION_INTERNAL_TOKEN =
  process.env.NOTIFICATION_INTERNAL_TOKEN ||
  variablesEnvFichier.NOTIFICATION_INTERNAL_TOKEN ||
  "ci_notify_token";

jest.mock("../src/services/mailer", () => ({
  envoyerEmail: jest.fn().mockResolvedValue({ ok: true }),
  htmlNouvelleOffre: jest.fn().mockReturnValue("<p>offre</p>"),
  htmlOffreCreee: jest.fn().mockReturnValue("<p>offre creee</p>"),
  htmlNouvelleCandidatureEntreprise: jest.fn().mockReturnValue("<p>candidature entreprise</p>"),
  htmlCandidatureEnvoyee: jest.fn().mockReturnValue("<p>candidature etudiant</p>"),
  htmlStatutCandidature: jest.fn().mockReturnValue("<p>statut candidature</p>"),
}));

jest.mock("../src/services/authClient", () => ({
  listerUtilisateurs: jest.fn().mockResolvedValue([
    { id: 1, email: "etudiant@test.com", role: "etudiant", prenom: "A", nom: "B" },
  ]),
  obtenirUtilisateur: jest.fn().mockResolvedValue({
    email: "entreprise@test.com",
    prenom: "Pat",
    nom: "Ron",
  }),
  filtrerEtudiantsAvecEmail: jest.fn((utilisateurs) =>
    (utilisateurs || [])
      .filter(
        (u) => u && String(u.role).toLowerCase() === "etudiant" && u.email
      )
      .map((u) => ({
        user_id: Number(u.id),
        email: String(u.email).trim(),
      }))
  ),
  libelleUtilisateur: jest.fn(() => "Etudiant test"),
}));

function resoudreUrlBaseTests() {
  if (process.env.TEST_DATABASE_URL) {
    return process.env.TEST_DATABASE_URL;
  }
  const repli = "postgresql://test:test@127.0.0.1:5432/notification_test";
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
    u.pathname = "/notification_test";
    return u.toString();
  } catch {
    return repli;
  }
}

process.env.DATABASE_URL = resoudreUrlBaseTests();

require("../src/models/notification.model");

const sequelize = require("../src/config/db");

beforeAll(async () => {
  await sequelize.assurerBaseExiste();
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
});
