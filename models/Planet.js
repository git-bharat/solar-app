// models/Planet.js
// This file defines the Mongoose schema and model for a Planet document in MongoDB.

const mongoose = require('mongoose');

// Define the schema for a Planet
const planetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Ensure planet names are unique
    trim: true // Remove whitespace from both ends of a string
  },
  description: {
    type: String,
    required: true
  },
  radius: { // Visual radius on canvas (for frontend)
    type: Number,
    required: true,
    min: 1
  },
  orbitalRadius: { // Distance from the sun (for frontend animation)
    type: Number,
    required: true,
    min: 0
  },
  orbitalSpeed: { // Speed of orbit (for frontend animation)
    type: Number,
    required: true,
    min: 0
  },
  color: { // Color for drawing the planet (for frontend, if no image)
    type: String,
    required: true
  },
  imageSrc: { // Path to planet image (for frontend, if available)
    type: String,
    default: null // Can be null if no image is provided
  }
});

// Create the Mongoose model from the schema
const Planet = mongoose.model('Planet', planetSchema);

module.exports = Planet;
