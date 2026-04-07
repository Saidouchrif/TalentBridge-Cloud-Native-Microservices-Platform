const request = require('supertest');
const { createApp } = require('../app');
const { sequelize, Notification, NotificationPreference } = require('../Models');

describe('Notification Controller', () => {
  let app;

  beforeAll(async () => {
    app = createApp();
    // Initialiser avec SQLite en mémoire pour les tests
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /api/notifications', () => {
    test('devrait retourner les notifications de l\'utilisateur', async () => {
      // Créer une notification test
      await Notification.create({
        userId: 1,
        type: 'registration',
        message: 'Test message',
        canal: 'in-app'
      });

      const res = await request(app)
        .get('/api/notifications')
        .set('X-User-ID', '1');

      expect(res.statusCode).toBe(200);
      expect(res.body.notifications).toBeInstanceOf(Array);
      expect(res.body.notifications.length).toBeGreaterThan(0);
    });

    test('devrait supporter la pagination', async () => {
      const res = await request(app)
        .get('/api/notifications?limit=10&offset=0')
        .set('X-User-ID', '1');

      expect(res.statusCode).toBe(200);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.limit).toBe(10);
    });
  });

  describe('POST /api/notifications', () => {
    test('devrait créer une notification (admin only)', async () => {
      const res = await request(app)
        .post('/api/notifications')
        .set('X-User-Role', 'admin')
        .send({
          userId: 1,
          type: 'new_offer',
          message: 'Nouvelle offre test',
          canal: 'email'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.notification).toBeDefined();
      expect(res.body.notification.message).toBe('Nouvelle offre test');
    });

    test('devrait rejeter sans userId/type/message', async () => {
      const res = await request(app)
        .post('/api/notifications')
        .set('X-User-Role', 'admin')
        .send({
          userId: 1
          // manque type et message
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('PATCH /api/notifications/:id/read', () => {
    test('devrait marquer une notification comme lue', async () => {
      const notif = await Notification.create({
        userId: 1,
        type: 'registration',
        message: 'Test',
        canal: 'in-app'
      });

      const res = await request(app)
        .patch(`/api/notifications/${notif.id}/read`)
        .set('X-User-ID', '1');

      expect(res.statusCode).toBe(200);
      expect(res.body.notification.statut).toBe('read');
    });
  });

  describe('Preferences', () => {
    test('devrait récupérer les préférences utilisateur', async () => {
      const res = await request(app)
        .get('/api/notifications/preferences')
        .set('X-User-ID', '1');

      expect(res.statusCode).toBe(200);
      expect(res.body.preferences).toBeDefined();
    });

    test('devrait mettre à jour les préférences', async () => {
      const res = await request(app)
        .put('/api/notifications/preferences')
        .set('X-User-ID', '1')
        .send({
          emailEnabled: false,
          preferredLanguage: 'en'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.preferences.emailEnabled).toBe(false);
    });
  });
});
