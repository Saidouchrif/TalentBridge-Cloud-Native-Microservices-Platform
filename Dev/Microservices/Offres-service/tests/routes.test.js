const request = require("supertest");
const app = require("../src/app");
const Offre = require("../src/models/offre.model");
const {
  creerJetonEntreprise,
  creerJetonEtudiant,
  corpsOffreValide,
} = require("./helpers");

describe("Offres-service", () => {
  describe("GET /sante", () => {
    it("200", async () => {
      const res = await request(app).get("/sante");
      expect(res.status).toBe(200);
      expect(res.body.service).toBe("offres-service");
    });
  });

  describe("GET /api/offres", () => {
    it("200 avec pagination", async () => {
      const res = await request(app).get("/api/offres").query({ limit: 5 });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(res.body).toHaveProperty("pagination");
    });
  });

  describe("GET /api/offres/search", () => {
    it("200", async () => {
      const res = await request(app).get("/api/offres/search");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("GET /api/offres/:id", () => {
    it("404 offre inexistante", async () => {
      const res = await request(app).get("/api/offres/999999");
      expect(res.status).toBe(404);
      expect(res.body.message).toBeDefined();
    });

    it("200 offre existante", async () => {
      const o = await Offre.create({
        ...corpsOffreValide,
        entreprise_id: 1,
        statut: "actif",
        datePublication: new Date(),
        nombreCandidatures: 0,
      });
      const res = await request(app).get(`/api/offres/${o.id}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(o.id);
    });
  });

  describe("POST /api/offres/:id/increment-candidatures", () => {
    it("401 sans jeton service", async () => {
      const res = await request(app).post("/api/offres/1/increment-candidatures");
      expect(res.status).toBe(401);
    });

    it("200 avec X-Service-Token", async () => {
      const o = await Offre.create({
        ...corpsOffreValide,
        titre: "Stage QA",
        type: "stage",
        entreprise_id: 2,
        statut: "actif",
        datePublication: new Date(),
        nombreCandidatures: 0,
      });
      const res = await request(app)
        .post(`/api/offres/${o.id}/increment-candidatures`)
        .set("X-Service-Token", process.env.SERVICE_INTERNAL_TOKEN);
      expect(res.status).toBe(200);
      expect(res.body.nombreCandidatures).toBe(1);
    });
  });

  describe("POST /api/offres", () => {
    it("401 sans JWT", async () => {
      const res = await request(app).post("/api/offres").send(corpsOffreValide);
      expect(res.status).toBe(401);
    });

    it("403 etudiant", async () => {
      const res = await request(app)
        .post("/api/offres")
        .set("Authorization", `Bearer ${creerJetonEtudiant(1)}`)
        .send(corpsOffreValide);
      expect(res.status).toBe(403);
    });

    it("201 entreprise", async () => {
      const res = await request(app)
        .post("/api/offres")
        .set("Authorization", `Bearer ${creerJetonEntreprise(501)}`)
        .send(corpsOffreValide);
      expect(res.status).toBe(201);
      expect(res.body.titre).toBe(corpsOffreValide.titre);
      expect(res.body.entreprise_id).toBe(501);
    });
  });

  describe("PUT /api/offres/:id", () => {
    it("403 si pas proprietaire", async () => {
      const o = await Offre.create({
        ...corpsOffreValide,
        titre: "Offre A",
        entreprise_id: 99,
        statut: "actif",
        datePublication: new Date(),
        nombreCandidatures: 0,
      });
      const res = await request(app)
        .put(`/api/offres/${o.id}`)
        .set("Authorization", `Bearer ${creerJetonEntreprise(100)}`)
        .send({ titre: "Hack" });
      expect(res.status).toBe(403);
    });

    it("200 proprietaire", async () => {
      const uid = 502;
      const o = await Offre.create({
        ...corpsOffreValide,
        titre: "Offre B",
        entreprise_id: uid,
        statut: "actif",
        datePublication: new Date(),
        nombreCandidatures: 0,
      });
      const res = await request(app)
        .put(`/api/offres/${o.id}`)
        .set("Authorization", `Bearer ${creerJetonEntreprise(uid)}`)
        .send({ titre: "Offre B modifiee" });
      expect(res.status).toBe(200);
      expect(res.body.titre).toBe("Offre B modifiee");
    });
  });

  describe("DELETE /api/offres/:id", () => {
    it("204 suppression", async () => {
      const uid = 503;
      const o = await Offre.create({
        ...corpsOffreValide,
        titre: "A supprimer",
        entreprise_id: uid,
        statut: "actif",
        datePublication: new Date(),
        nombreCandidatures: 0,
      });
      const res = await request(app)
        .delete(`/api/offres/${o.id}`)
        .set("Authorization", `Bearer ${creerJetonEntreprise(uid)}`);
      expect(res.status).toBe(204);
    });
  });
});
