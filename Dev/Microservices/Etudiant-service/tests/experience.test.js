const request = require("supertest");
const app = require("../src/app");
const { corpsProfilValide, creerJetonEtudiant } = require("./helpers");

const corpsExperienceValide = {
  poste: "Stagiaire",
  entreprise: "ACME",
  dateDebut: "2024-01-01",
  dateFin: "2024-06-30",
  description: "Description test",
};

async function preparerUtilisateurAvecProfil(identifiant) {
  const jeton = creerJetonEtudiant(identifiant);
  await request(app)
    .post("/api/etudiant/profile")
    .set("Authorization", `Bearer ${jeton}`)
    .send(corpsProfilValide);
  return jeton;
}

describe("Experience — routes", () => {
  describe("POST /api/etudiant/experience", () => {
    it("refuse sans jeton (401)", async () => {
      const reponse = await request(app)
        .post("/api/etudiant/experience")
        .send(corpsExperienceValide);
      expect(reponse.status).toBe(401);
    });

    it("refuse sans profil (403)", async () => {
      const jeton = creerJetonEtudiant(94001);
      const reponse = await request(app)
        .post("/api/etudiant/experience")
        .set("Authorization", `Bearer ${jeton}`)
        .send(corpsExperienceValide);
      expect(reponse.status).toBe(403);
    });

    it("refuse un corps invalide (400)", async () => {
      const jeton = await preparerUtilisateurAvecProfil(94002);
      const reponse = await request(app)
        .post("/api/etudiant/experience")
        .set("Authorization", `Bearer ${jeton}`)
        .send({ poste: "" });
      expect(reponse.status).toBe(400);
    });

    it("cree une experience (201)", async () => {
      const jeton = await preparerUtilisateurAvecProfil(94003);
      const reponse = await request(app)
        .post("/api/etudiant/experience")
        .set("Authorization", `Bearer ${jeton}`)
        .send(corpsExperienceValide);
      expect(reponse.status).toBe(201);
      expect(reponse.body.poste).toBe("Stagiaire");
    });
  });

  describe("GET /api/etudiant/experience", () => {
    it("liste les experiences de l'utilisateur (200)", async () => {
      const jeton = await preparerUtilisateurAvecProfil(94004);
      await request(app)
        .post("/api/etudiant/experience")
        .set("Authorization", `Bearer ${jeton}`)
        .send(corpsExperienceValide);
      const reponse = await request(app)
        .get("/api/etudiant/experience")
        .set("Authorization", `Bearer ${jeton}`);
      expect(reponse.status).toBe(200);
      expect(Array.isArray(reponse.body)).toBe(true);
      expect(reponse.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("DELETE /api/etudiant/experience/:id", () => {
    it("refuse un id invalide (400)", async () => {
      const jeton = await preparerUtilisateurAvecProfil(94005);
      const reponse = await request(app)
        .delete("/api/etudiant/experience/abc")
        .set("Authorization", `Bearer ${jeton}`);
      expect(reponse.status).toBe(400);
    });

    it("retourne 404 si l'experience n'existe pas", async () => {
      const jeton = await preparerUtilisateurAvecProfil(94006);
      const reponse = await request(app)
        .delete("/api/etudiant/experience/999999")
        .set("Authorization", `Bearer ${jeton}`);
      expect(reponse.status).toBe(404);
    });

    it("supprime une experience existante (204)", async () => {
      const jeton = await preparerUtilisateurAvecProfil(94007);
      const creation = await request(app)
        .post("/api/etudiant/experience")
        .set("Authorization", `Bearer ${jeton}`)
        .send(corpsExperienceValide);
      const id = creation.body.id;
      const reponse = await request(app)
        .delete(`/api/etudiant/experience/${id}`)
        .set("Authorization", `Bearer ${jeton}`);
      expect(reponse.status).toBe(204);
    });
  });
});
