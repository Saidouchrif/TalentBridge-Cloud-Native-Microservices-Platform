const request = require("supertest");
const app = require("../src/app");
const { corpsProfilValide, creerJetonEtudiant } = require("./helpers");

const corpsCompetenceValide = {
  nom: "JavaScript",
  niveau: "Avancé",
};

async function preparerUtilisateurAvecProfil(identifiant) {
  const jeton = creerJetonEtudiant(identifiant);
  await request(app)
    .post("/api/etudiant/profile")
    .set("Authorization", `Bearer ${jeton}`)
    .send(corpsProfilValide);
  return jeton;
}

describe("Competence — routes", () => {
  describe("POST /api/etudiant/competence", () => {
    it("refuse sans jeton (401)", async () => {
      const reponse = await request(app)
        .post("/api/etudiant/competence")
        .send(corpsCompetenceValide);
      expect(reponse.status).toBe(401);
    });

    it("refuse sans profil (403)", async () => {
      const jeton = creerJetonEtudiant(96001);
      const reponse = await request(app)
        .post("/api/etudiant/competence")
        .set("Authorization", `Bearer ${jeton}`)
        .send(corpsCompetenceValide);
      expect(reponse.status).toBe(403);
    });

    it("refuse un corps invalide (400)", async () => {
      const jeton = await preparerUtilisateurAvecProfil(96002);
      const reponse = await request(app)
        .post("/api/etudiant/competence")
        .set("Authorization", `Bearer ${jeton}`)
        .send({ nom: "" });
      expect(reponse.status).toBe(400);
    });

    it("cree une competence (201)", async () => {
      const jeton = await preparerUtilisateurAvecProfil(96003);
      const reponse = await request(app)
        .post("/api/etudiant/competence")
        .set("Authorization", `Bearer ${jeton}`)
        .send(corpsCompetenceValide);
      expect(reponse.status).toBe(201);
      expect(reponse.body.nom).toBe("JavaScript");
    });
  });

  describe("GET /api/etudiant/competence", () => {
    it("liste les competences (200)", async () => {
      const jeton = await preparerUtilisateurAvecProfil(96004);
      await request(app)
        .post("/api/etudiant/competence")
        .set("Authorization", `Bearer ${jeton}`)
        .send(corpsCompetenceValide);
      const reponse = await request(app)
        .get("/api/etudiant/competence")
        .set("Authorization", `Bearer ${jeton}`);
      expect(reponse.status).toBe(200);
      expect(Array.isArray(reponse.body)).toBe(true);
    });
  });
});
