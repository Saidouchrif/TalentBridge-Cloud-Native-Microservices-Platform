const request = require("supertest");
const app = require("../src/app");
const Notification = require("../src/models/notification.model");
const { creerJeton } = require("./helpers");

describe("Notification-service", () => {
  describe("GET /sante", () => {
    it("200", async () => {
      const res = await request(app).get("/sante");
      expect(res.status).toBe(200);
      expect(res.body.service).toBe("notification-service");
    });
  });

  describe("GET /api/notifications/me", () => {
    it("401 sans Bearer", async () => {
      const res = await request(app).get("/api/notifications/me");
      expect(res.status).toBe(401);
    });

    it("200 liste", async () => {
      await Notification.create({
        user_id: 55,
        message: "Message test",
        type: "system",
        lu: false,
      });
      const res = await request(app)
        .get("/api/notifications/me")
        .set("Authorization", `Bearer ${creerJeton(55)}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].message).toBe("Message test");
      expect(res.body[0].lu).toBe(false);
    });
  });

  describe("PATCH /api/notifications/:id/read", () => {
    it("404 notification autre utilisateur", async () => {
      const n = await Notification.create({
        user_id: 66,
        message: "Prive",
        type: "system",
        lu: false,
      });
      const res = await request(app)
        .patch(`/api/notifications/${n.id}/read`)
        .set("Authorization", `Bearer ${creerJeton(67)}`);
      expect(res.status).toBe(404);
    });

    it("200 marque lu", async () => {
      const n = await Notification.create({
        user_id: 68,
        message: "A lire",
        type: "system",
        lu: false,
      });
      const res = await request(app)
        .patch(`/api/notifications/${n.id}/read`)
        .set("Authorization", `Bearer ${creerJeton(68)}`);
      expect(res.status).toBe(200);
      expect(res.body.lu).toBe(true);
    });
  });

  describe("POST /api/notifications/new-offre", () => {
    it("401 sans jeton service", async () => {
      const res = await request(app)
        .post("/api/notifications/new-offre")
        .send({ offre_id: 1, titre: "Titre" });
      expect(res.status).toBe(401);
    });

    it("202 avec destinataires explicites", async () => {
      const res = await request(app)
        .post("/api/notifications/new-offre")
        .set("X-Service-Token", process.env.NOTIFICATION_INTERNAL_TOKEN)
        .send({
          offre_id: 10,
          titre: "Offre CI",
          recipients: [{ user_id: 2, email: "x@y.com" }],
        });
      expect(res.status).toBe(202);
      expect(res.body.notifications).toBeGreaterThanOrEqual(1);
    });
  });

  describe("POST /api/notifications/new-candidature", () => {
    it("202", async () => {
      const res = await request(app)
        .post("/api/notifications/new-candidature")
        .set("X-Service-Token", process.env.NOTIFICATION_INTERNAL_TOKEN)
        .send({
          offre_id: 1,
          offre_titre: "Offre test",
          entreprise_user_id: 100,
          entreprise_nom: "Entreprise Demo",
          candidature_id: 5,
          etudiant_user_id: 200,
          etudiant_nom: "Etudiant Demo",
        });
      expect(res.status).toBe(202);
    });
  });

  describe("POST /api/notifications/status-update", () => {
    it("202", async () => {
      const res = await request(app)
        .post("/api/notifications/status-update")
        .set("X-Service-Token", process.env.NOTIFICATION_INTERNAL_TOKEN)
        .send({
          candidature_id: 1,
          etudiant_user_id: 300,
          statut: "refuse",
          offre_titre: "Poste X",
          entreprise_nom: "Entreprise Demo",
        });
      expect(res.status).toBe(202);
    });
  });
});
