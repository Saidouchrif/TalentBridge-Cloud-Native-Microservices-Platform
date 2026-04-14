const request = require("supertest");
const app = require("../src/app");
const Document = require("../src/models/document.model");
const { creerJeton } = require("./helpers");

describe("AI-Document-service", () => {
  describe("GET /sante", () => {
    it("200", async () => {
      const res = await request(app).get("/sante");
      expect(res.status).toBe(200);
      expect(res.body.service).toBe("ai-document-service");
    });
  });

  describe("POST /api/ai/generate-cv", () => {
    it("401 sans JWT", async () => {
      const res = await request(app)
        .post("/api/ai/generate-cv")
        .send({ resumeProfil: "Developpeur full-stack" });
      expect(res.status).toBe(401);
    });

    it("201 genere et enregistre", async () => {
      const res = await request(app)
        .post("/api/ai/generate-cv")
        .set("Authorization", `Bearer ${creerJeton(800)}`)
        .send({
          prenom: "Jean",
          nom: "Test",
          resumeProfil: "Experience en Node.js et PostgreSQL",
          competences: ["Node.js", "SQL"],
        });
      expect(res.status).toBe(201);
      expect(res.body.type).toBe("cv");
      expect(String(res.body.contenu).length).toBeGreaterThan(0);
      expect(res.body.id).toBeDefined();
    });
  });

  describe("POST /api/ai/generate-lettre", () => {
    it("201", async () => {
      const res = await request(app)
        .post("/api/ai/generate-lettre")
        .set("Authorization", `Bearer ${creerJeton(801)}`)
        .send({
          offre_titre: "Stage dev",
          entreprise: "TechCo",
          resumeProfil: "Motivation test",
        });
      expect(res.status).toBe(201);
      expect(res.body.type).toBe("lettre");
    });
  });

  describe("POST /api/ai/generate-email", () => {
    it("201", async () => {
      const res = await request(app)
        .post("/api/ai/generate-email")
        .set("Authorization", `Bearer ${creerJeton(802)}`)
        .send({ offre_titre: "Poste", entreprise: "Co" });
      expect(res.status).toBe(201);
      expect(res.body.type).toBe("email");
    });
  });

  describe("POST /api/ai/adapt-offre", () => {
    it("400 sans contenu", async () => {
      const res = await request(app)
        .post("/api/ai/adapt-offre")
        .set("Authorization", `Bearer ${creerJeton(803)}`)
        .send({ offre: { titre: "X" } });
      expect(res.status).toBe(400);
    });

    it("201", async () => {
      const res = await request(app)
        .post("/api/ai/adapt-offre")
        .set("Authorization", `Bearer ${creerJeton(804)}`)
        .send({
          contenu: "Mon CV actuel avec experiences.",
          offre: { titre: "Dev", description: "Node.js requis" },
        });
      expect(res.status).toBe(201);
      expect(res.body.type).toBe("lettre");
    });
  });

  describe("GET /api/documents/me", () => {
    it("200", async () => {
      await Document.create({
        type: "cv",
        contenu: "ancien",
        dateGeneration: new Date(),
        user_id: 805,
      });
      const res = await request(app)
        .get("/api/documents/me")
        .set("Authorization", `Bearer ${creerJeton(805)}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("DELETE /api/documents/:id", () => {
    it("204", async () => {
      const d = await Document.create({
        type: "email",
        contenu: "x",
        dateGeneration: new Date(),
        user_id: 806,
      });
      const res = await request(app)
        .delete(`/api/documents/${d.id}`)
        .set("Authorization", `Bearer ${creerJeton(806)}`);
      expect(res.status).toBe(204);
    });
  });
});
