const request = require("supertest");
const app = require("../src/app");
const { creerJetonEtudiant, creerJetonEntreprise } = require("./helpers");
const offresClient = require("../src/services/offresClient");

describe("Matching-service", () => {
  beforeEach(() => {
    offresClient.obtenirOffreParId.mockReset();
    offresClient.obtenirOffreParId.mockResolvedValue({
      id: 99,
      entreprise_id: 50,
      titre: "Poste test",
      competencesRequises: "JavaScript",
      localisation: "Paris",
    });
  });

  describe("GET /sante", () => {
    it("200", async () => {
      const res = await request(app).get("/sante");
      expect(res.status).toBe(200);
      expect(res.body.service).toBe("matching-service");
    });
  });

  describe("GET /api/matching/offres", () => {
    it("403 si pas etudiant", async () => {
      const res = await request(app)
        .get("/api/matching/offres")
        .set("Authorization", `Bearer ${creerJetonEntreprise(1)}`);
      expect(res.status).toBe(403);
    });

    it("200 recommandations", async () => {
      const res = await request(app)
        .get("/api/matching/offres")
        .set("Authorization", `Bearer ${creerJetonEtudiant(400)}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeLessThanOrEqual(10);
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty("offre_id");
        expect(res.body[0]).toHaveProperty("score");
      }
    });
  });

  describe("GET /api/matching/candidats/:offre_id", () => {
    it("403 si pas entreprise", async () => {
      const res = await request(app)
        .get("/api/matching/candidats/99")
        .set("Authorization", `Bearer ${creerJetonEtudiant(2)}`);
      expect(res.status).toBe(403);
    });

    it("404 offre introuvable", async () => {
      offresClient.obtenirOffreParId.mockResolvedValueOnce(null);
      const res = await request(app)
        .get("/api/matching/candidats/999")
        .set("Authorization", `Bearer ${creerJetonEntreprise(50)}`);
      expect(res.status).toBe(404);
    });

    it("403 offre autre entreprise", async () => {
      offresClient.obtenirOffreParId.mockResolvedValueOnce({
        id: 99,
        entreprise_id: 999,
        competencesRequises: "x",
        localisation: "Paris",
      });
      const res = await request(app)
        .get("/api/matching/candidats/99")
        .set("Authorization", `Bearer ${creerJetonEntreprise(50)}`);
      expect(res.status).toBe(403);
    });

    it("200 candidats scores", async () => {
      offresClient.obtenirOffreParId.mockResolvedValue({
        id: 99,
        entreprise_id: 50,
        titre: "T",
        competencesRequises: "JavaScript",
        localisation: "Paris",
      });
      const res = await request(app)
        .get("/api/matching/candidats/99")
        .set("Authorization", `Bearer ${creerJetonEntreprise(50)}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty("user_id");
        expect(res.body[0]).toHaveProperty("score");
      }
    });
  });
});
