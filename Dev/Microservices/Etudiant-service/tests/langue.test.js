const request = require("supertest");
const app = require("../src/app");
const { corpsProfilValide, creerJetonEtudiant } = require("./helpers");

const corpsLangueValide = {
  nom: "Anglais",
  niveau: "B2",
};

async function preparerUtilisateurAvecProfil(identifiant) {
  const jeton = creerJetonEtudiant(identifiant);
  await request(app)
    .post("/api/etudiant/profile")
    .set("Authorization", `Bearer ${jeton}`)
    .send(corpsProfilValide);
  return jeton;
}

describe("Langue — routes", () => {
  describe("POST /api/etudiant/langue", () => {
    it("refuse sans jeton (401)", async () => {
      const reponse = await request(app)
        .post("/api/etudiant/langue")
        .send(corpsLangueValide);
      expect(reponse.status).toBe(401);
    });

    it("refuse sans profil (403)", async () => {
      const jeton = creerJetonEtudiant(97001);
      const reponse = await request(app)
        .post("/api/etudiant/langue")
        .set("Authorization", `Bearer ${jeton}`)
        .send(corpsLangueValide);
      expect(reponse.status).toBe(403);
    });

    it("refuse un corps invalide (400)", async () => {
      const jeton = await preparerUtilisateurAvecProfil(97002);
      const reponse = await request(app)
        .post("/api/etudiant/langue")
        .set("Authorization", `Bearer ${jeton}`)
        .send({ niveau: "x" });
      expect(reponse.status).toBe(400);
    });

    it("cree une langue (201)", async () => {
      const jeton = await preparerUtilisateurAvecProfil(97003);
      const reponse = await request(app)
        .post("/api/etudiant/langue")
        .set("Authorization", `Bearer ${jeton}`)
        .send(corpsLangueValide);
      expect(reponse.status).toBe(201);
      expect(reponse.body.nom).toBe("Anglais");
    });
  });

  describe("GET /api/etudiant/langue", () => {
    it("liste les langues (200)", async () => {
      const jeton = await preparerUtilisateurAvecProfil(97004);
      await request(app)
        .post("/api/etudiant/langue")
        .set("Authorization", `Bearer ${jeton}`)
        .send(corpsLangueValide);
      const reponse = await request(app)
        .get("/api/etudiant/langue")
        .set("Authorization", `Bearer ${jeton}`);
      expect(reponse.status).toBe(200);
      expect(Array.isArray(reponse.body)).toBe(true);
    });
  });
});
