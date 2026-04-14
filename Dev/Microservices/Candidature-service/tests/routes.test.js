const request = require("supertest");
const app = require("../src/app");
const Application = require("../src/models/application.model");
const { creerJetonEtudiant, creerJetonEntreprise } = require("./helpers");
const offresClient = require("../src/services/offresClient");

describe("Candidature-service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /sante", () => {
    it("200", async () => {
      const res = await request(app).get("/sante");
      expect(res.status).toBe(200);
      expect(res.body.service).toBe("candidature-service");
    });
  });

  describe("POST /api/candidatures", () => {
    it("401 sans JWT", async () => {
      const res = await request(app)
        .post("/api/candidatures")
        .send({ offre_id: 1 });
      expect(res.status).toBe(401);
    });

    it("403 entreprise", async () => {
      const res = await request(app)
        .post("/api/candidatures")
        .set("Authorization", `Bearer ${creerJetonEntreprise(1)}`)
        .send({ offre_id: 1 });
      expect(res.status).toBe(403);
    });

    it("400 corps invalide", async () => {
      const res = await request(app)
        .post("/api/candidatures")
        .set("Authorization", `Bearer ${creerJetonEtudiant(10)}`)
        .send({});
      expect(res.status).toBe(400);
    });

    it("201 candidature creee", async () => {
      const res = await request(app)
        .post("/api/candidatures")
        .set("Authorization", `Bearer ${creerJetonEtudiant(11)}`)
        .send({ offre_id: 42, message: "Motivation", cv: "https://cv.test/x" });
      expect(res.status).toBe(201);
      expect(res.body.offre_id).toBe(42);
      expect(res.body.user_id).toBe(11);
      expect(offresClient.incrementerCandidatures).toHaveBeenCalled();
    });
  });

  describe("GET /api/candidatures/me", () => {
    it("200 liste", async () => {
      await Application.create({
        user_id: 12,
        offre_id: 1,
        statut: "en_attente",
        dateCandidature: new Date(),
        message: "x",
        cv: null,
      });
      const res = await request(app)
        .get("/api/candidatures/me")
        .set("Authorization", `Bearer ${creerJetonEtudiant(12)}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("GET /api/candidatures/offre/:offre_id", () => {
    it("403 etudiant", async () => {
      const res = await request(app)
        .get("/api/candidatures/offre/1")
        .set("Authorization", `Bearer ${creerJetonEtudiant(13)}`);
      expect(res.status).toBe(403);
    });

    it("200 liste pour entreprise proprietaire", async () => {
      offresClient.fetchOffreParId.mockResolvedValue({
        status: 200,
        data: { entreprise_id: 901, titre: "Offre test" },
      });
      await Application.create({
        user_id: 31,
        offre_id: 7,
        statut: "en_attente",
        dateCandidature: new Date(),
      });
      const res = await request(app)
        .get("/api/candidatures/offre/7")
        .set("Authorization", `Bearer ${creerJetonEntreprise(901)}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("502 si offre service erreur simulee", async () => {
      offresClient.fetchOffreParId.mockResolvedValueOnce({
        status: 500,
        data: {},
      });
      const res = await request(app)
        .get("/api/candidatures/offre/1")
        .set("Authorization", `Bearer ${creerJetonEntreprise(900)}`);
      expect(res.status).toBe(502);
    });
  });

  describe("PUT /api/candidatures/:id/statut", () => {
    it("400 statut invalide", async () => {
      const c = await Application.create({
        user_id: 20,
        offre_id: 5,
        statut: "en_attente",
        dateCandidature: new Date(),
      });
      offresClient.fetchOffreParId.mockResolvedValue({
        status: 200,
        data: { entreprise_id: 900, titre: "T" },
      });
      const res = await request(app)
        .put(`/api/candidatures/${c.id}/statut`)
        .set("Authorization", `Bearer ${creerJetonEntreprise(900)}`)
        .send({ statut: "invalide" });
      expect(res.status).toBe(400);
    });

    it("200 acceptation", async () => {
      const c = await Application.create({
        user_id: 22,
        offre_id: 8,
        statut: "en_attente",
        dateCandidature: new Date(),
      });
      offresClient.fetchOffreParId.mockResolvedValue({
        status: 200,
        data: { entreprise_id: 902, titre: "Titre offre" },
      });
      const res = await request(app)
        .put(`/api/candidatures/${c.id}/statut`)
        .set("Authorization", `Bearer ${creerJetonEntreprise(902)}`)
        .send({ statut: "accepte" });
      expect(res.status).toBe(200);
      expect(res.body.statut).toBe("accepte");
    });
  });
});
