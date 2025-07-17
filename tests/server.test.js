// tests/server.test.js
// This file contains unit/integration tests for the backend API endpoints
// using Jest and Supertest.

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); // Import the Express app (now without auto-start)
const Planet = require('../models/Planet'); // Import the Planet model
const initialPlanets = require('../data/planets.json'); // Initial data for seeding

// Mock environment variables for testing
process.env.MONGO_URI = 'mongodb://localhost:27017/solar_system_test'; // Use a test database
process.env.PORT = 3001; // Use a different port for tests
process.env.POD_NAME = 'test-pod-123'; // Mock K8s pod name

let server; // Variable to hold the server instance

// Before all tests, connect to the test database, seed data, and start the server
beforeAll(async () => {
  // Ensure a clean connection before testing
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Test database connected.');

  // Clear the collection before seeding to ensure a clean state for each test run
  await Planet.deleteMany({});
  await Planet.insertMany(initialPlanets);
  console.log('Test database seeded.');

  // Start the Express server for testing
  server = app.listen(process.env.PORT, () => {
    console.log(`Test server running on port ${process.env.PORT}`);
  });
});

// After all tests, disconnect from the database and close the server
afterAll(async () => {
  await mongoose.connection.close();
  console.log('Test database disconnected.');

  if (server) {
    await new Promise(resolve => server.close(resolve)); // Close the server
    console.log('Test server closed.');
  }
});

// Describe block for Planet API tests
describe('Planet API', () => {
  // Test for GET /api/planets (all planets)
  test('GET /api/planets should return all planets', async () => {
    const res = await request(app).get('/api/planets');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0); // Ensure some planets are returned
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[0]).toHaveProperty('description');
  });

  // Test for GET /api/planets with range parameters
  test('GET /api/planets?start=0&end=2 should return first two planets', async () => {
    const res = await request(app).get('/api/planets?start=0&end=2');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toEqual(2);
    expect(res.body[0].name).toEqual('Sun'); // Assuming Sun is the first in initial data
    expect(res.body[1].name).toEqual('Mercury'); // Assuming Mercury is second
  });

  // Test for GET /api/planets with invalid range parameters
  test('GET /api/planets?start=invalid&end=2 should return 400', async () => {
    const res = await request(app).get('/api/planets?start=invalid&end=2');
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Invalid start or end parameters. Must be non-negative integers where end > start.');
  });

  test('GET /api/planets?start=2&end=1 should return 400', async () => {
    const res = await request(app).get('/api/planets?start=2&end=1');
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Invalid start or end parameters. Must be non-negative integers where end > start.');
  });

  // Test for GET /api/planets/search with a valid name
  test('GET /api/planets/search?name=earth should return Earth', async () => {
    const res = await request(app).get('/api/planets/search?name=earth');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toEqual(1);
    expect(res.body[0].name).toEqual('Earth');
  });

  // Test for GET /api/planets/search with a partial name (case-insensitive)
  test('GET /api/planets/search?name=mer should return Mercury', async () => {
    const res = await request(app).get('/api/planets/search?name=mer');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].name).toContain('Mercury'); // Check if it contains "Mercury"
  });

  // Test for GET /api/planets/search with no results
  test('GET /api/planets/search?name=xyz should return empty array', async () => {
    const res = await request(app).get('/api/planets/search?name=xyz');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toEqual(0);
  });

  // Test for GET /api/planets/search with missing name parameter
  test('GET /api/planets/search should return 400 if name is missing', async () => {
    const res = await request(app).get('/api/planets/search');
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Please provide a planet name to search.');
  });
});

// Describe block for Pod Name API test
describe('Pod Name API', () => {
  test('GET /api/podname should return the mocked pod name', async () => {
    const res = await request(app).get('/api/podname');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('podName');
    expect(res.body.podName).toEqual('test-pod-123');
  });

  test('GET /api/podname should return default message if POD_NAME is not set', async () => {
    // Temporarily unset POD_NAME for this test
    const originalPodName = process.env.POD_NAME;
    delete process.env.POD_NAME;

    const res = await request(app).get('/api/podname');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('podName', 'Not running in Kubernetes or POD_NAME environment variable not set.');

    // Restore POD_NAME
    process.env.POD_NAME = originalPodName;
  });
});

// Test for non-existent API routes
describe('Error Handling', () => {
  test('GET /api/nonexistent should return 404', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'API endpoint not found.');
  });
});
