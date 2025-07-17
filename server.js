// server.js
// This is the main backend application file. It sets up the Express server,
// connects to MongoDB, defines API routes, and serves static frontend files.

// Load environment variables from .env file
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Planet = require('./models/Planet'); // Import the Planet model
const initialPlanets = require('./data/planets.json'); // Initial data for seeding

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

/**
 * @function connectDB
 * @description Establishes a connection to MongoDB.
 * This function is now separate and explicitly called only when server.js is run directly.
 */
async function connectDB() {
  if (!MONGO_URI) {
    console.warn('MONGO_URI is not defined. Database connection will not be established.');
    return;
  }
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected...');
    // Seed initial data if the collection is empty
    await seedDatabase();
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process if DB connection fails
  }
}

/**
 * @function seedDatabase
 * @description Seeds the database with initial planet data if the Planet collection is empty.
 * This prevents re-seeding on every server restart if data already exists.
 */
async function seedDatabase() {
  try {
    const count = await Planet.countDocuments();
    if (count === 0) {
      await Planet.insertMany(initialPlanets);
      console.log('Initial planet data seeded successfully.');
    } else {
      console.log('Database already contains planet data. Skipping seeding.');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// API Endpoints

/**
 * @route GET /api/planets
 * @description Get all planets or a specified range of planets.
 * @queryParam {number} [start] - The starting index (0-based) for fetching planets.
 * @queryParam {number} {end} - The ending index (exclusive) for fetching planets.
 * @returns {Array<Object>} An array of planet objects.
 */
app.get('/api/planets', async (req, res) => {
  try {
    const { start, end } = req.query;
    let query = Planet.find({});

    if (start !== undefined && end !== undefined) {
      const startIndex = parseInt(start);
      const endIndex = parseInt(end);

      if (isNaN(startIndex) || isNaN(endIndex) || startIndex < 0 || endIndex <= startIndex) {
        return res.status(400).json({ message: 'Invalid start or end parameters. Must be non-negative integers where end > start.' });
      }
      // Fetch all and then slice in memory for simplicity, avoiding complex MongoDB pagination
      // that might require specific indexing based on sort order for large datasets.
      const allPlanets = await query.exec();
      const slicedPlanets = allPlanets.slice(startIndex, endIndex);
      return res.json(slicedPlanets);
    }

    const planets = await query.exec();
    res.json(planets);
  } catch (error) {
    console.error('Error fetching planets:', error);
    res.status(500).json({ message: 'Server error while fetching planets.' });
  }
});

/**
 * @route GET /api/planets/search
 * @description Search for planets by name.
 * @queryParam {string} [name] - The name or partial name of the planet to search for.
 * @returns {Array<Object>} An array of planet objects matching the search criteria.
 */
app.get('/api/planets/search', async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ message: 'Please provide a planet name to search.' });
    }

    // Use a case-insensitive regex for partial matching
    const planets = await Planet.find({
      name: { $regex: name, $options: 'i' }
    });
    res.json(planets);
  } catch (error) {
    console.error('Error searching planets:', error);
    res.status(500).json({ message: 'Server error while searching planets.' });
  }
});

/**
 * @route GET /api/podname
 * @description Returns the Kubernetes pod name if available from environment variables.
 * @returns {Object} An object containing the pod name.
 */
app.get('/api/podname', (req, res) => {
  const podName = process.env.POD_NAME || 'Not running in Kubernetes or POD_NAME environment variable not set.';
  res.json({ podName });
});

// Catch-all for any other API routes not found
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found.' });
});

// For any other GET request, serve the index.html file
// This ensures that refreshing the page or direct access to routes
// like /some-path still serves the single-page application.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server and connect to DB ONLY if this file is run directly (e.g., node server.js)
// This prevents the server from starting or connecting to DB when imported by test files.
if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}

module.exports = app; // Export app for testing
