Here is your `README.md` file for the **Solar System Application for Children**:

---

```markdown
# 🌌 Solar System Application for Children

A full-stack Node.js application designed to educate children about the solar system in an interactive and engaging way. The backend API is built using Express.js and MongoDB, and the frontend uses HTML, CSS, and JavaScript to visualize the solar system.

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

- **Interactive Visualization:** Dynamic rotating canvas of the solar system.
- **Planet Data API:** Retrieve and search planet information.
- **MongoDB Integration:** Persistent data storage with Mongoose.
- **Kubernetes Ready:** Displays pod name when deployed in Kubernetes.
- **Test Coverage:** Jest and Supertest included for backend testing.
- **Expandable Design:** Easy to enhance with images and interactivity.

---

## 🧠 Workflow Explained

**Frontend:**
- Loads `index.html` and initializes a canvas for the solar system.
- `script.js` fetches data from the backend to draw planets.
- User can search or filter planets dynamically.
- Displays Kubernetes pod name if available.

**Backend:**
- Built with Express.js and connected to MongoDB using Mongoose.
- API Endpoints:
  - `/api/planets`
  - `/api/planets/search`
  - `/api/podname`
- Handles MongoDB interaction and pod environment detection.

**MongoDB:**
- Stores structured planet data.
- Hosted on MongoDB Atlas (cloud-based).

---

## 🛠 Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- npm (comes with Node.js)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) account (Free M0 tier)

---

## ☁️ MongoDB Atlas Setup

1. **Create Account & Cluster**  
   Sign up → Create Cluster (Free Tier).

2. **Add Database User**  
   Add new user with **Read/Write** access.

3. **Whitelist IP**  
   Allow local IP or 0.0.0.0/0 for testing.

4. **Get Connection String**  
   Format:
```

mongodb+srv://<username>:<password>@cluster0.mongodb.net/solar\_system\_db?retryWrites=true\&w=majority

````

---

## 💻 Local Setup Guide

### Backend Setup

```bash
git clone <your-repo-url>
cd solar-system-app
````

Create a `.env` file:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/solar_system_db?retryWrites=true&w=majority
PORT=3000
```

Install dependencies:

```bash
npm install
```

### Frontend Setup

No separate setup required. The static files are served from the `public/` directory.

---

## 🚀 Running the Application

```bash
npm start
```

Visit in browser:

```
http://localhost:3000
```

---

## 🔌 API Endpoints

### `GET /api/planets`

* Returns all planets
* Optional Query: `start`, `end`
* Example:

  ```
  /api/planets?start=0&end=3
  ```

### `GET /api/planets/search?name=mars`

* Search planet(s) by name

### `GET /api/podname`

* Returns Kubernetes Pod name or default message

---

## 🧪 Running Tests & Code Coverage

Install dev dependencies:

```bash
npm install --save-dev jest supertest nyc
```

Run tests:

```bash
npm test
```

Generate coverage report:

```bash
npm run coverage
```

View HTML report at: `coverage/lcov-report/index.html`

---

## 🧭 Kubernetes Pod Name Display

Simulate locally:

Linux/macOS:

```bash
POD_NAME=my-local-pod npm start
```

Windows CMD:

```cmd
set POD_NAME=my-local-pod && npm start
```

PowerShell:

```powershell
$env:POD_NAME="my-local-pod"; npm start
```

---

## 🪐 Enhancing with Planet Images

1. Place `.png` images in `public/images/` (e.g., `earth.png`, `mars.png`)
2. Update `planet.json` with:

   ```json
   {
     "name": "Earth",
     ...
     "imageSrc": "/images/earth.png"
   }
   ```
3. Modify `script.js` to preload and use image instead of circles.

---

## 🗂 Project Structure

```
solar-system-app/
├── public/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── images/
├── data/
│   └── planets.json
├── models/
│   └── Planet.js
├── tests/
│   └── server.test.js
├── .env
├── .env.example
├── server.js
├── package.json
└── README.md
```

---

## 🤝 Contributing

* Fork the repository
* Create a new branch
* Submit PR with changes/improvements

---

## 📄 License

This project is licensed under the **MIT License**.

```

---

Let me know if you want a downloadable `README.md` file or a version with GitHub markdown enhancements (e.g., shields, badges, demo GIF, etc.).
```
