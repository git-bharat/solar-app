# Dockerfile
# This Dockerfile builds an image for the Solar System Node.js application.

# Use an official Node.js runtime as a parent image
# We choose a specific version (e.g., 20-alpine) for stability and smaller image size.
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
# This allows Docker to cache the npm install step, speeding up subsequent builds
# if only source code changes.
COPY package*.json ./

# Install application dependencies
# The --omit=dev flag ensures that development dependencies (like Jest, Supertest)
# are not installed in the production image, keeping it smaller.
RUN npm install --omit=dev

# Copy the rest of the application source code to the working directory
# This includes server.js, public/, data/, models/, and tests/
COPY . .

# Expose the port that the Express server listens on
# This is typically port 3000 as defined in your .env file and server.js
EXPOSE 3000

# Define the command to run the application
# The 'npm start' script defined in package.json will execute server.js
# Environment variables like MONGO_URI and POD_NAME should be passed at runtime
# using `docker run -e MONGO_URI=... -e POD_NAME=...` or Kubernetes secrets/config maps.
CMD [ "npm", "start" ]