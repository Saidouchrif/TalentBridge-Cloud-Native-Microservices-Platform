const request = require("supertest");
const app = require("../src/app");
const {
  creerJetonEntreprise,
  creerJetonEtudiant,
  corpsProfilEntreprise,
} = require("./helpers");

describe("Entreprise-service", () => {
  describe("GET /sante", () => {
    it("200 + statut ok", async () => {
      const res = await request(app).get("/sante");
      expect(res.status).toBe(200);
      expect(res.body.statut).toBe("ok");
      expect(res.body.service).toBe("entreprise-service");
    });
  });

  describe("POST /api/entreprise/profile", () => {
    it("401 sans Bearer", async () => {
      const res = await request(app)
        .post("/api/entreprise/profile")
        .send(corpsProfilEntreprise);
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message");
    });

    it("403 si role etudiant", async () => {
      const res = await request(app)
        .post("/api/entreprise/profile")
        .set("Authorization", `Bearer ${creerJetonEtudiant(7001)}`)
        .send(corpsProfilEntreprise);
      expect(res.status).toBe(403);
    });

    it("400 corps invalide", async () => {
      const res = await request(app)
        .post("/api/entreprise/profile")
        .set("Authorization", `Bearer ${creerJetonEntreprise(7002)}`)
        .send({ nomEntreprise: "" });
      expect(res.status).toBe(400);
    });

    it("201 creation profil", async () => {
      const res = await request(app)
        .post("/api/entreprise/profile")
        .set("Authorization", `Bearer ${creerJetonEntreprise(7003)}`)
        .send(corpsProfilEntreprise);
      expect(res.status).toBe(201);
      expect(res.body.user_id).toBe(7003);
      expect(res.body.nomEntreprise).toBe("TestCorp");
    });

    it("409 si profil deja existant", async () => {
      const token = creerJetonEntreprise(7004);
      await request(app)
        .post("/api/entreprise/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({ ...corpsProfilEntreprise, nomEntreprise: "A" });
      const res = await request(app)
        .post("/api/entreprise/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({ ...corpsProfilEntreprise, nomEntreprise: "B" });
      expect(res.status).toBe(409);
    });
  });

  describe("GET /api/entreprise/me", () => {
    it("404 sans profil", async () => {
      const res = await request(app)
        .get("/api/entreprise/me")
        .set("Authorization", `Bearer ${creerJetonEntreprise(7005)}`);
      expect(res.status).toBe(404);
    });

    it("200 avec profil", async () => {
      const uid = 7006;
      const token = creerJetonEntreprise(uid);
      await request(app)
        .post("/api/entreprise/profile")
        .set("Authorization", `Bearer ${token}`)
        .send(corpsProfilEntreprise);
      const res = await request(app)
        .get("/api/entreprise/me")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.user_id).toBe(uid);
    });
  });

  describe("PUT /api/entreprise/me", () => {
    it("200 mise a jour", async () => {
      const uid = 7007;
      const token = creerJetonEntreprise(uid);
      await request(app)
        .post("/api/entreprise/profile")
        .set("Authorization", `Bearer ${token}`)
        .send(corpsProfilEntreprise);
      const res = await request(app)
        .put("/api/entreprise/me")
        .set("Authorization", `Bearer ${token}`)
        .send({ ville: "Lyon" });
      expect(res.status).toBe(200);
      expect(res.body.ville).toBe("Lyon");
    });
  });

  describe("404 route inconnue", () => {
    it("JSON message", async () => {
      const res = await request(app).get("/api/inexistant");
      expect(res.status).toBe(404);
      expect(res.body.message).toBeDefined();
    });
  });
});
