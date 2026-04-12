const request = require("supertest");
const app = require("../src/app");
const {
  corpsProfilValide,
  creerJetonEtudiant,
  creerJetonEntreprise,
} = require("./helpers");

describe("Etudiant — routes profil", () => {
  describe("GET /sante", () => {
    it("retourne le statut du service sans authentification", async () => {
      const reponse = await request(app).get("/sante");
      expect(reponse.status).toBe(200);
      expect(reponse.body.statut).toBe("ok");
    });
  });

  describe("POST /api/etudiant/profile", () => {
    it("refuse sans jeton (401)", async () => {
      const reponse = await request(app)
        .post("/api/etudiant/profile")
        .send(corpsProfilValide);
      expect(reponse.status).toBe(401);
      expect(reponse.body).toHaveProperty("message");
    });

    it("refuse avec un jeton invalide (401)", async () => {
      const reponse = await request(app)
        .post("/api/etudiant/profile")
        .set("Authorization", "Bearer jeton.invalide")
        .send(corpsProfilValide);
      expect(reponse.status).toBe(401);
    });

    it("refuse si le role n'est pas etudiant (403)", async () => {
      const jeton = creerJetonEntreprise(91001);
      const reponse = await request(app)
        .post("/api/etudiant/profile")
        .set("Authorization", `Bearer ${jeton}`)
        .send(corpsProfilValide);
      expect(reponse.status).toBe(403);
    });

    it("refuse un corps JSON invalide (400)", async () => {
      const jeton = creerJetonEtudiant(91002);
      const reponse = await request(app)
        .post("/api/etudiant/profile")
        .set("Authorization", `Bearer ${jeton}`)
        .send({ universite: "" });
      expect(reponse.status).toBe(400);
      expect(reponse.body.message).toBe("Les données envoyées sont invalides");
    });

    it("cree le profil (201)", async () => {
      const identifiant = 91003;
      const jeton = creerJetonEtudiant(identifiant);
      const reponse = await request(app)
        .post("/api/etudiant/profile")
        .set("Authorization", `Bearer ${jeton}`)
        .send(corpsProfilValide);
      expect(reponse.status).toBe(201);
      expect(reponse.body.user_id).toBe(identifiant);
    });

    it("refuse un second profil pour le meme utilisateur (409)", async () => {
      const identifiant = 91004;
      const jeton = creerJetonEtudiant(identifiant);
      await request(app)
        .post("/api/etudiant/profile")
        .set("Authorization", `Bearer ${jeton}`)
        .send(corpsProfilValide);
      const reponse = await request(app)
        .post("/api/etudiant/profile")
        .set("Authorization", `Bearer ${jeton}`)
        .send(corpsProfilValide);
      expect(reponse.status).toBe(409);
    });
  });

  describe("GET /api/etudiant/me", () => {
    it("refuse sans profil complete (403)", async () => {
      const jeton = creerJetonEtudiant(92001);
      const reponse = await request(app)
        .get("/api/etudiant/me")
        .set("Authorization", `Bearer ${jeton}`);
      expect(reponse.status).toBe(403);
    });

    it("retourne le profil apres creation (200)", async () => {
      const identifiant = 92002;
      const jeton = creerJetonEtudiant(identifiant);
      await request(app)
        .post("/api/etudiant/profile")
        .set("Authorization", `Bearer ${jeton}`)
        .send(corpsProfilValide);
      const reponse = await request(app)
        .get("/api/etudiant/me")
        .set("Authorization", `Bearer ${jeton}`);
      expect(reponse.status).toBe(200);
      expect(reponse.body.user_id).toBe(identifiant);
    });
  });

  describe("PUT /api/etudiant/me", () => {
    it("refuse un corps vide (400)", async () => {
      const identifiant = 93001;
      const jeton = creerJetonEtudiant(identifiant);
      await request(app)
        .post("/api/etudiant/profile")
        .set("Authorization", `Bearer ${jeton}`)
        .send(corpsProfilValide);
      const reponse = await request(app)
        .put("/api/etudiant/me")
        .set("Authorization", `Bearer ${jeton}`)
        .send({});
      expect(reponse.status).toBe(400);
    });

    it("met a jour le profil (200)", async () => {
      const identifiant = 93002;
      const jeton = creerJetonEtudiant(identifiant);
      await request(app)
        .post("/api/etudiant/profile")
        .set("Authorization", `Bearer ${jeton}`)
        .send(corpsProfilValide);
      const reponse = await request(app)
        .put("/api/etudiant/me")
        .set("Authorization", `Bearer ${jeton}`)
        .send({ localisation: "Lyon" });
      expect(reponse.status).toBe(200);
      expect(reponse.body.localisation).toBe("Lyon");
    });
  });
});
