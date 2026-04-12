const request = require("supertest");
const app = require("../src/app");
const { corpsProfilValide, creerJetonEtudiant } = require("./helpers");

const corpsFormationValide = {
  etablissement: "Université X",
  diplome: "Licence Info",
  dateDebut: "2020-09-01",
  dateFin: "2023-06-30",
};

async function preparerUtilisateurAvecProfil(identifiant) {
  const jeton = creerJetonEtudiant(identifiant);
  await request(app)
    .post("/api/etudiant/profile")
    .set("Authorization", `Bearer ${jeton}`)
    .send(corpsProfilValide);
  return jeton;
}

describe("Formation — routes", () => {
  describe("POST /api/etudiant/formation", () => {
    it("refuse sans jeton (401)", async () => {
      const reponse = await request(app)
        .post("/api/etudiant/formation")
        .send(corpsFormationValide);
      expect(reponse.status).toBe(401);
    });

    it("refuse sans profil (403)", async () => {
      const jeton = creerJetonEtudiant(95001);
      const reponse = await request(app)
        .post("/api/etudiant/formation")
        .set("Authorization", `Bearer ${jeton}`)
        .send(corpsFormationValide);
      expect(reponse.status).toBe(403);
    });

    it("refuse un corps invalide (400)", async () => {
      const jeton = await preparerUtilisateurAvecProfil(95002);
      const reponse = await request(app)
        .post("/api/etudiant/formation")
        .set("Authorization", `Bearer ${jeton}`)
        .send({ diplome: "x" });
      expect(reponse.status).toBe(400);
    });

    it("cree une formation (201)", async () => {
      const jeton = await preparerUtilisateurAvecProfil(95003);
      const reponse = await request(app)
        .post("/api/etudiant/formation")
        .set("Authorization", `Bearer ${jeton}`)
        .send(corpsFormationValide);
      expect(reponse.status).toBe(201);
      expect(reponse.body.diplome).toBe("Licence Info");
    });
  });

  describe("GET /api/etudiant/formation", () => {
    it("liste les formations (200)", async () => {
      const jeton = await preparerUtilisateurAvecProfil(95004);
      await request(app)
        .post("/api/etudiant/formation")
        .set("Authorization", `Bearer ${jeton}`)
        .send(corpsFormationValide);
      const reponse = await request(app)
        .get("/api/etudiant/formation")
        .set("Authorization", `Bearer ${jeton}`);
      expect(reponse.status).toBe(200);
      expect(Array.isArray(reponse.body)).toBe(true);
    });
  });
});
