const request = require('supertest');
const { sequelize } = require('../src/Models');
const { app } = require('../src/app');

describe('Entreprise Service API Tests', () => {

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clean database before each test
    await sequelize.sync({ force: true });
  });

  describe('GET /api/entreprises', () => {
    it('should return empty list initially', async () => {
      const response = await request(app)
        .get('/api/entreprises')
        .expect(200);

      expect(response.body).toHaveProperty('enterprises');
      expect(Array.isArray(response.body.enterprises)).toBe(true);
      expect(response.body.enterprises.length).toBe(0);
    });
  });

  describe('POST /api/entreprises', () => {
    it('should create a new enterprise', async () => {
      const enterpriseData = {
        name: 'Test Enterprise',
        sector: 'Technology',
        description: 'Test description',
        addressLine1: '123 Test Street',
        city: 'Test City',
        postalCode: '12345',
        country: 'France',
        phone: '+33 1 23 45 67 89',
        website: 'https://test.com'
      };

      const response = await request(app)
        .post('/api/entreprises')
        .send(enterpriseData)
        .expect(201);

      expect(response.body).toHaveProperty('enterprise');
      expect(response.body.enterprise.name).toBe(enterpriseData.name);
      expect(response.body.enterprise.sector).toBe(enterpriseData.sector);
    });

    it('should return 400 for missing required fields', async () => {
      const invalidData = {
        sector: 'Technology'
        // Missing name
      };

      await request(app)
        .post('/api/entreprises')
        .send(invalidData)
        .expect(400);
    });
  });

  describe('Enterprise CRUD Operations', () => {
    let enterpriseId;

    beforeEach(async () => {
      const enterprise = await request(app)
        .post('/api/entreprises')
        .send({
          name: 'Test Enterprise',
          sector: 'Technology'
        });
      
      enterpriseId = enterprise.body.enterprise.id;
    });

    it('should get enterprise by ID', async () => {
      const response = await request(app)
        .get(`/api/entreprises/${enterpriseId}`)
        .expect(200);

      expect(response.body).toHaveProperty('enterprise');
      expect(response.body.enterprise.id).toBe(enterpriseId);
    });

    it('should update enterprise', async () => {
      const updateData = {
        name: 'Updated Enterprise Name',
        sector: 'Updated Sector'
      };

      const response = await request(app)
        .put(`/api/entreprises/${enterpriseId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.enterprise.name).toBe(updateData.name);
      expect(response.body.enterprise.sector).toBe(updateData.sector);
    });

    it('should delete enterprise', async () => {
      await request(app)
        .delete(`/api/entreprises/${enterpriseId}`)
        .expect(200);

      // Verify it's deleted
      await request(app)
        .get(`/api/entreprises/${enterpriseId}`)
        .expect(404);
    });
  });

  describe('Offers Management', () => {
    let enterpriseId;

    beforeEach(async () => {
      const enterprise = await request(app)
        .post('/api/entreprises')
        .send({
          name: 'Test Enterprise',
          sector: 'Technology'
        });
      
      enterpriseId = enterprise.body.enterprise.id;
    });

    it('should create an offer for enterprise', async () => {
      const offerData = {
        title: 'Developer Position',
        description: 'Looking for a skilled developer',
        requiredSkills: ['JavaScript', 'React'],
        location: 'Paris',
        status: 'published'
      };

      const response = await request(app)
        .post(`/api/entreprises/${enterpriseId}/offers`)
        .send(offerData)
        .expect(201);

      expect(response.body).toHaveProperty('offer');
      expect(response.body.offer.title).toBe(offerData.title);
      expect(response.body.offer.enterpriseId).toBe(enterpriseId);
    });

    it('should list offers for enterprise', async () => {
      // Create an offer first
      await request(app)
        .post(`/api/entreprises/${enterpriseId}/offers`)
        .send({
          title: 'Test Offer',
          description: 'Test description'
        });

      const response = await request(app)
        .get(`/api/entreprises/${enterpriseId}/offers`)
        .expect(200);

      expect(response.body).toHaveProperty('offers');
      expect(Array.isArray(response.body.offers)).toBe(true);
      expect(response.body.offers.length).toBe(1);
    });
  });

  describe('Applications Management', () => {
    let enterpriseId, offerId;

    beforeEach(async () => {
      const enterprise = await request(app)
        .post('/api/entreprises')
        .send({
          name: 'Test Enterprise',
          sector: 'Technology'
        });
      
      enterpriseId = enterprise.body.enterprise.id;

      const offer = await request(app)
        .post(`/api/entreprises/${enterpriseId}/offers`)
        .send({
          title: 'Test Offer',
          description: 'Test description'
        });
      
      offerId = offer.body.offer.id;
    });

    it('should apply to an offer', async () => {
      const response = await request(app)
        .post(`/api/offers/${offerId}/applications`)
        .send({})
        .expect(201);

      expect(response.body).toHaveProperty('application');
      expect(response.body.application.offerId).toBe(offerId);
    });

    it('should list applications for enterprise', async () => {
      // Create an application first
      await request(app)
        .post(`/api/offers/${offerId}/applications`)
        .send({});

      const response = await request(app)
        .get(`/api/entreprises/${enterpriseId}/applications`)
        .expect(200);

      expect(response.body).toHaveProperty('applications');
      expect(Array.isArray(response.body.applications)).toBe(true);
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('Entreprise Service running');
    });
  });
});
