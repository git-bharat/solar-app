Here is the complete `README.md` file based on the content extracted from your uploaded PDF (`README.pdf`):

---

```markdown
# 🌠 Solar System Application for Children

A full-stack Node.js application designed to educate children about the solar system in an interactive and engaging way. It features an Express.js backend with MongoDB and a frontend using HTML, CSS, and JavaScript for visualization.

---

## 📚 Table of Contents

- [Features](#features)
- [Workflow Explained](#workflow-explained)
- [Prerequisites](#prerequisites)
- [MongoDB Atlas Setup](#mongodb-atlas-setup)
- [Local Setup Guide](#local-setup-guide)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Running Tests & Code Coverage](#running-tests--code-coverage)
- [Kubernetes Pod Name Display](#kubernetes-pod-name-display)
- [Enhancing with Planet Images](#enhancing-with-planet-images)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## ✅ Features

- 🪐 Interactive Solar System Visualization with rotating planets
- 🌍 Planet Data API with search and filter functionality
- ☁️ MongoDB Atlas Integration
- 🚀 Kubernetes-ready with pod name display
- ✅ Unit & Integration tests with coverage reporting
- 📄 Comprehensive Documentation

---

## 🧠 Workflow Explained

### Frontend (Browser)

- Loads `index.html` with a canvas element
- `script.js` fetches planet data from the backend
- Interactions allow planet filtering and searching
- Dynamically updates canvas visualization
- Displays pod name if running in Kubernetes

### Backend (Node.js / Express)

- `server.js` initializes Express server
- Connects to MongoDB using environment variables
- Defines API endpoints:
  - `/api/planets`
  - `/api/planets/search`
  - `/api/podname`
- Uses Mongoose and a `Planet` schema for data operations

### Database (MongoDB Atlas)

- Cloud-hosted database
- Stores planet information: name, description, radius, speed, etc.

---

## 🔧 Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- npm (comes with Node.js)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free M0 tier)

---

## ☁️ MongoDB Atlas Setup

1. **Create a Free Account**  
   Create a Shared Cluster (Free M0 tier)

2. **Create a Database User**  
   - Use password authentication  
   - Assign read/write privileges  
   - Save username & password for `.env`

3. **Configure Network Access**  
   - Add IP address (current or 0.0.0.0 for testing)

4. **Get Connection String**  
   Example:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/solar_system_db?retryWrites=true&w=majority
   ```

---

## 💻 Local Setup Guide

### Backend Setup

```bash
git clone <your-repo-url>
cd solar-system-app
```

Create a `.env` file in the root:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/solar_system_db?retryWrites=true&w=majority
PORT=3000
```

Install dependencies:

```bash
npm install
```

### Frontend Setup

No additional steps. The frontend is statically served by the backend from the `public/` directory.

---

## 🚀 Running the Application

```bash
npm start
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## 🔌 API Endpoints

### `GET /api/planets`

- Retrieves a list of all planets  
- Optional query parameters:  
  `start`, `end`  
- Example:  
  `/api/planets?start=0&end=3`

---

### `GET /api/planets/search?name=mars`

- Searches for planets by name

---

### `GET /api/podname`

- Returns Kubernetes Pod name or default message

---

## 🧪 Running Tests & Code Coverage

Install test dependencies:

```bash
npm install --save-dev jest supertest nyc
```

Run tests:

```bash
npm test
```

Generate coverage:

```bash
npm run coverage
```

Open coverage report:
`coverage/lcov-report/index.html`

---

## 📦 Kubernetes Pod Name Display

Simulate Kubernetes locally:

**Linux/macOS**

```bash
POD_NAME=my-local-pod npm start
```

**Windows CMD**

```cmd
set POD_NAME=my-local-pod && npm start
```

**Windows PowerShell**

```powershell
$env:POD_NAME="my-local-pod"; npm start
```

---

## 🌌 Enhancing with Planet Images

1. Place planet images in `public/images/`
2. Add `imageSrc` to `planets.json`:
   ```json
   {
     "name": "Earth",
     "imageSrc": "/images/earth.png"
   }
   ```
3. Modify `drawPlanet()` in `script.js` to use `drawImage()` instead of `ctx.arc`
4. Preload images before drawing

---

## 📁 Project Structure

```
solar-system-app/
├── public/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── images/
│       ├── sun.png
│       ├── mercury.png
│       └── ...
├── data/
│   └── planets.json
├── models/
│   └── Planet.js
├── tests/
│   └── server.test.js
├── .env.example
├── .env
├── server.js
├── package.json
├── package-lock.json
└── README.md
```

---

## 🤝 Contributing

Fork the repo, create a feature branch, and submit a pull request. Feedback and improvements are welcome!

---

## 📄 License

This project is licensed under the **MIT License**.
```

---

Let me know if you want this content exported to a downloadable `.md` file or formatted with GitHub badges, screenshots, or demo GIFs.
