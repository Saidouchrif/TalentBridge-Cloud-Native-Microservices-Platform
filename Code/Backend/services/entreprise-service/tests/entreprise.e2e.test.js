const request = require("supertest");
const jwt = require("jsonwebtoken");

// IMPORTANT: on configure les variables d'environnement AVANT de charger Sequelize.
process.env.PORT = process.env.PORT || 5002;
process.env.NODE_ENV = process.env.NODE_ENV || "test";
process.env.DB_DIALECT = process.env.DB_DIALECT || "sqlite";
process.env.JWT_SECRET = process.env.JWT_SECRET || "supersecret";
process.env.DB_HOST = process.env.DB_HOST || "localhost";
process.env.DB_PORT = process.env.DB_PORT || "5432";
process.env.DB_USER = process.env.DB_USER || "postgres";
process.env.DB_PASSWORD = process.env.DB_PASSWORD || "postgres";
process.env.DB_NAME = process.env.DB_NAME || "entreprise_db_test";

const { app } = require("../src/app");
const { sequelize } = require("../src/Models");

function signToken({ id, email }) {
  return jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: "1d" });
}

describe("entreprise-service - API Entreprise/Offres/Candidatures", () => {
  let enterpriseToken;
  let studentToken;
  let enterpriseId;
  let offerId;
  let applicationId;

  beforeAll(async () => {
    // On recrée la base à zéro pour garantir la reproductibilité.
    await sequelize.sync({ force: true });
    enterpriseToken = signToken({ id: 1, email: "entreprise@demo.com" });
    studentToken = signToken({ id: 2, email: "etudiant@demo.com" });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test("CRUD entreprise + création d'offre + candidature + mise à jour statut", async () => {
    // 1) Création entreprise
    const enterpriseRes = await request(app)
      .post("/api/entreprises")
      .set("Authorization", `Bearer ${enterpriseToken}`)
      .send({
        name: "Mundiapolis Demo",
        sector: "EdTech",
        description: "Entreprise de démonstration",
        addressLine1: "1 rue de test",
        city: "Paris"
      })
      .expect(201);

    enterpriseId = enterpriseRes.body.enterprise.id;
    expect(enterpriseId).toBeTruthy();

    // 2) Création offre
    const offerRes = await request(app)
      .post(`/api/entreprises/${enterpriseId}/offers`)
      .set("Authorization", `Bearer ${enterpriseToken}`)
      .send({
        title: "Stage Développement",
        description: "Construisez des microservices !",
        requiredSkills: ["nodejs", "react"],
        location: "Paris",
        status: "published"
      })
      .expect(201);

    offerId = offerRes.body.offer.id;
    expect(offerId).toBeTruthy();

    // 3) Lecture publique offres
    const publicOffersRes = await request(app)
      .get("/api/offers?status=published")
      .expect(200);

    expect(publicOffersRes.body.offers.length).toBeGreaterThan(0);

    // 4) Candidature étudiant
    const appRes = await request(app)
      .post(`/api/offers/${offerId}/applications`)
      .set("Authorization", `Bearer ${studentToken}`)
      .send({})
      .expect(201);

    applicationId = appRes.body.application.id;
    expect(applicationId).toBeTruthy();

    // 5) Lecture des candidatures côté entreprise
    const appsForEnterpriseRes = await request(app)
      .get(`/api/entreprises/${enterpriseId}/applications`)
      .set("Authorization", `Bearer ${enterpriseToken}`)
      .expect(200);

    expect(appsForEnterpriseRes.body.applications.length).toBe(1);

    // 6) Mise à jour statut
    const updateRes = await request(app)
      .patch(`/api/entreprises/${enterpriseId}/applications/${applicationId}`)
      .set("Authorization", `Bearer ${enterpriseToken}`)
      .send({ status: "accepted" })
      .expect(200);

    expect(updateRes.body.application.status).toBe("accepted");
  });
});

