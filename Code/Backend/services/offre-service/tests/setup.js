// Jest setup file for tests
require('dotenv').config({ path: '.env.test' });

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret';
process.env.DB_DIALECT = 'sqlite';
process.env.SQLITE_STORAGE = ':memory:';
process.env.CORS_ORIGIN = '*';
process.env.ENTREPRISE_SERVICE_URL = 'http://localhost:5002';

// Increase timeout for async operations
jest.setTimeout(10000);
