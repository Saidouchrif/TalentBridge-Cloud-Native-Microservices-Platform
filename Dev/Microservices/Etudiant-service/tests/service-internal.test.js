const request = require("supertest");
const app = require("../src/app");
const Etudiant = require("../src/models/etudiant.model");
const Competence = require("../src/models/competence.model");

describe("Etudiant - route service matching", () => {
  it("401 sans X-Service-Token", async () => {
    const res = await request(app).get(
      "/api/etudiant/service/users/1/matching-profile"
    );
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message");
  });

  it("401 jeton incorrect", async () => {
    const res = await request(app)
      .get("/api/etudiant/service/users/1/matching-profile")
      .set("X-Service-Token", "mauvais");
    expect(res.status).toBe(401);
  });

  it("404 utilisateur sans profil", async () => {
    const res = await request(app)
      .get("/api/etudiant/service/users/99998/matching-profile")
      .set("X-Service-Token", process.env.MATCHING_SERVICE_TOKEN);
    expect(res.status).toBe(404);
  });

  it("200 profil + competences", async () => {
    const uid = 99999;
    await Etudiant.create({
      user_id: uid,
      universite: "Universite CI",
      niveau: "M2",
      cv: "",
      localisation: "Nantes",
    });
    await Competence.create({
      user_id: uid,
      nom: "PostgreSQL",
      niveau: "intermediaire",
    });
    const res = await request(app)
      .get(`/api/etudiant/service/users/${uid}/matching-profile`)
      .set("X-Service-Token", process.env.MATCHING_SERVICE_TOKEN);
    expect(res.status).toBe(200);
    expect(res.body.user_id).toBe(uid);
    expect(res.body.localisation).toBe("Nantes");
    expect(Array.isArray(res.body.competences)).toBe(true);
    expect(res.body.competences.length).toBeGreaterThanOrEqual(1);
  });
});
