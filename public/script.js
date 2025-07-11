// public/script.js
// This file contains the frontend JavaScript logic for the Solar System application.
// It handles fetching data from the backend, rendering the solar system animation,
// and managing user interactions.

const canvas = document.getElementById('solarSystemCanvas');
const ctx = canvas.getContext('2d');

// Get references to DOM elements
const viewPlanetsBtn = document.getElementById('viewPlanetsBtn');
const startPlanetInput = document.getElementById('startPlanet');
const endPlanetInput = document.getElementById('endPlanet');
const searchPlanetInput = document.getElementById('searchPlanetInput');
const searchPlanetBtn = document.getElementById('searchPlanetBtn');
const podNameDisplay = document.getElementById('podNameDisplay');
const solarSystemTitle = document.getElementById('solarSystemTitle'); // New: Get reference to the title h2
const solarSystemDescription = document.getElementById('solarSystemDescription');

// Message Box elements
const messageBox = document.getElementById('messageBox');
const messageBoxText = document.getElementById('messageBoxText');
const messageBoxCloseBtn = document.getElementById('messageBoxCloseBtn');

let planets = []; // Array to hold planet data currently being displayed
let allPlanetsData = []; // Store all planets data initially fetched and loaded with images
let animationFrameId; // To store the requestAnimationFrame ID for cancellation

// Constants for canvas drawing
let SUN_CENTER_X;
let SUN_CENTER_Y;
let maxOriginalOrbitalRadius = 0; // To store the maximum original orbital radius for scaling

// Function to show a custom message box
function showMessageBox(message) {
    messageBoxText.textContent = message;
    messageBox.classList.remove('hidden');
}

// Function to hide the custom message box
function hideMessageBox() {
    messageBox.classList.add('hidden');
}

// Event listener for message box close button
messageBoxCloseBtn.addEventListener('click', hideMessageBox);

/**
 * @function resizeCanvas
 * @description Adjusts the canvas size to fit its parent container and updates sun center.
 * This ensures responsiveness across different screen sizes.
 */
function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    SUN_CENTER_X = canvas.width / 2;
    SUN_CENTER_Y = canvas.height / 2;
    // Recalculate scaling and redraw if planets are loaded
    if (allPlanetsData.length > 0) {
        calculateScalingFactor();
        drawSolarSystem();
    }
}

// Initial canvas resize and add event listener for window resize
window.addEventListener('load', () => {
    resizeCanvas();
    fetchInitialPlanets(); // Fetch all planets initially
    fetchPodName(); // Fetch pod name on load
});
window.addEventListener('resize', resizeCanvas);

/**
 * @function calculateScalingFactor
 * @description Calculates a scaling factor for orbital radii to fit within the canvas.
 * This makes the orbits adaptive to the device and uses the maximum area.
 */
function calculateScalingFactor() {
    maxOriginalOrbitalRadius = 0;
    // Find the largest orbital radius among all planets in the full dataset (excluding Sun)
    allPlanetsData.forEach(p => {
        if (p.name !== "Sun" && p.orbitalRadius > maxOriginalOrbitalRadius) {
            maxOriginalOrbitalRadius = p.orbitalRadius;
        }
    });

    // Determine the maximum available dimension for orbits (width or height, whichever is smaller)
    // Subtract some padding to ensure orbits don't touch the canvas edges
    const maxCanvasDimension = Math.min(canvas.width, canvas.height) / 2;
    const padding = 50; // Pixels from the edge
    const availableRadius = maxCanvasDimension - padding;

    // Calculate the scaling factor
    // If maxOriginalOrbitalRadius is 0 (e.g., only Sun is present), set scale to 1 to avoid division by zero
    const scale = maxOriginalOrbitalRadius > 0 ? availableRadius / maxOriginalOrbitalRadius : 1;

    // Apply the scale to currently displayed planets' orbitalRadius for drawing
    planets.forEach(p => {
        if (p.name !== "Sun") {
            p.scaledOrbitalRadius = p.orbitalRadius * scale;
        } else {
            p.scaledOrbitalRadius = 0; // Sun doesn't orbit
        }
    });
}


/**
 * @function fetchInitialPlanets
 * @description Fetches all planet data initially, loads images, and stores it.
 * Then, it displays the complete solar system.
 */
async function fetchInitialPlanets() {
    try {
        const response = await fetch('/api/planets');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        let fetchedData = await response.json();

        // Load images for all planets once and store them in allPlanetsData
        for (const planet of fetchedData) {
            if (planet.imageSrc) {
                const img = new Image();
                img.src = planet.imageSrc;
                await new Promise(resolve => {
                    img.onload = () => {
                        planet.image = img; // Store the Image object on the planet data
                        resolve();
                    };
                    img.onerror = () => {
                        console.error('Failed to load image:', planet.imageSrc);
                        planet.image = null; // Fallback to drawing a circle
                        resolve();
                    };
                });
            }
        }
        allPlanetsData = fetchedData; // Store the fully loaded data

        // Display all planets on initial load and set default title/description
        displayPlanets([...allPlanetsData], "Solar System", `Our Solar System consists of our star, the Sun, and everything bound to it by gravity – the planets Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune; dwarf planets such as Pluto; dozens of moons; and millions of asteroids, comets, and meteoroids.`);

    } catch (error) {
        console.error('Error fetching initial planets:', error);
        showMessageBox(`Failed to load initial solar system data: ${error.message}`);
    }
}

/**
 * @function displayPlanets
 * @description Sets the 'planets' array for drawing, calculates scaling, and starts animation.
 * Also updates the main title and description.
 * @param {Array<Object>} planetsToDisplay - The array of planet objects to display.
 * @param {string} [titleText="Solar System"] - The text to set for the main title.
 * @param {string} [descriptionText="Our Solar System consists..."] - The text to set for the description.
 */
function displayPlanets(planetsToDisplay, titleText = "Solar System", descriptionText = `Our Solar System consists of our star, the Sun, and everything bound to it by gravity – the planets Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune; dwarf planets such as Pluto; dozens of moons; and millions of asteroids, comets, and meteoroids.`) {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId); // Stop any ongoing animation
    }

    // Ensure Sun is always included if it's in allPlanetsData but not in the current set
    const sunData = allPlanetsData.find(p => p.name === "Sun");
    if (sunData && !planetsToDisplay.some(p => p.name === "Sun")) {
        planetsToDisplay.unshift(sunData); // Add Sun to the beginning if not present
    }

    // Map to ensure we use the pre-loaded image objects and original orbitalRadius for scaling
    planets = planetsToDisplay.map(p => {
        const original = allPlanetsData.find(ap => ap.name === p.name);
        return {
            ...p,
            image: original ? original.image : null,
            orbitalRadius: original ? original.orbitalRadius : p.orbitalRadius // Use original for scaling logic
        };
    });

    // Sort planets by original orbitalRadius to ensure correct drawing order (Sun first, then closest to furthest)
    planets.sort((a, b) => a.orbitalRadius - b.orbitalRadius);

    calculateScalingFactor(); // Recalculate scaling for the current set of planets
    animateSolarSystem(); // Start the animation loop

    // Update the title and description
    solarSystemTitle.textContent = titleText;
    solarSystemDescription.textContent = descriptionText;
}


/**
 * @function fetchPodName
 * @description Fetches the Kubernetes pod name or host IP/name from the backend and displays it.
 */
async function fetchPodName() {
    try {
        const response = await fetch('/api/podname');
        if (!response.ok) {
            // If the /api/podname endpoint fails, try to get host information
            const hostName = window.location.hostname;
            // Attempt to get local IP (might not work in all browser/network configurations)
            let ipAddress = 'Unknown IP';
            try {
                const rtc = new RTCPeerConnection();
                rtc.createDataChannel('');
                rtc.createOffer().then(offer => rtc.setLocalDescription(offer));
                rtc.onicecandidate = event => {
                    if (event.candidate && event.candidate.candidate.includes('srflx')) {
                        const parts = event.candidate.candidate.split(' ');
                        ipAddress = parts[4];
                        podNameDisplay.textContent = `Host: ${hostName} (${ipAddress})`;
                        rtc.onicecandidate = null; // Stop listening
                    }
                };
            } catch (e) {
                console.warn("RTCPeerConnection not available or failed to get IP:", e);
            }
            podNameDisplay.textContent = `Host: ${hostName} (${ipAddress})`;
            return;
        }
        const data = await response.json();
        if (data.podName && data.podName !== 'Not running in Kubernetes or POD_NAME environment variable not set.') {
            podNameDisplay.textContent = `Pod - ${data.podName}`;
        } else {
            const hostName = window.location.hostname;
            // Attempt to get local IP (might not work in all browser/network configurations)
            let ipAddress = 'Unknown IP';
            try {
                const rtc = new RTCPeerConnection();
                rtc.createDataChannel('');
                rtc.createOffer().then(offer => rtc.setLocalDescription(offer));
                rtc.onicecandidate = event => {
                    if (event.candidate && event.candidate.candidate.includes('srflx')) {
                        const parts = event.candidate.candidate.split(' ');
                        ipAddress = parts[4];
                        podNameDisplay.textContent = `Host: ${hostName} (${ipAddress})`;
                        rtc.onicecandidate = null; // Stop listening
                    }
                };
            } catch (e) {
                console.warn("RTCPeerConnection not available or failed to get IP:", e);
            }
            podNameDisplay.textContent = `Host: ${hostName} (${ipAddress})`;
        }
    } catch (error) {
        console.error('Error fetching pod name:', error);
        const hostName = window.location.hostname;
        // Attempt to get local IP on error as well
        let ipAddress = 'Unknown IP';
        try {
            const rtc = new RTCPeerConnection();
            rtc.createDataChannel('');
            rtc.createOffer().then(offer => rtc.setLocalDescription(offer));
            rtc.onicecandidate = event => {
                if (event.candidate && event.candidate.candidate.includes('srflx')) {
                    const parts = event.candidate.candidate.split(' ');
                    ipAddress = parts[4];
                    podNameDisplay.textContent = `Host: ${hostName} (${ipAddress})`;
                    rtc.onicecandidate = null;
                }
            };
        } catch (e) {
            console.warn("RTCPeerConnection not available or failed to get IP on error:", e);
        }
        podNameDisplay.textContent = `Host: ${hostName} (${ipAddress})`; // Fallback to host name on error
    }
}


/**
 * @function drawSolarSystem
 * @description Clears the canvas and draws the Sun and all planets.
 */
function drawSolarSystem() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the entire canvas

    // Draw the Sun (always at the center, doesn't orbit)
    const sun = planets.find(p => p.name === "Sun");
    if (sun) {
        if (sun.image) {
            const imageSize = sun.radius * 2; // Adjust size as needed
            ctx.drawImage(sun.image, SUN_CENTER_X - sun.radius, SUN_CENTER_Y - sun.radius, imageSize, imageSize);
        } else {
            // Fallback to drawing a circle if image is not loaded
            ctx.fillStyle = sun.color;
            ctx.beginPath();
            ctx.arc(SUN_CENTER_X, SUN_CENTER_Y, sun.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
        }
        ctx.fillStyle = '#fff';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(sun.name, SUN_CENTER_X, SUN_CENTER_Y + sun.radius + 15);
    }


    // Draw orbital paths for other planets
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'; // Changed to white with higher opacity
    ctx.lineWidth = 1; // Increased line width
    ctx.setLineDash([3, 3]); // Set to dotted line [segment length, gap length]
    planets.filter(p => p.name !== "Sun").forEach(planet => {
        // Use scaledOrbitalRadius for drawing orbits
        ctx.beginPath();
        ctx.arc(SUN_CENTER_X, SUN_CENTER_Y, planet.scaledOrbitalRadius, 0, Math.PI * 2);
        ctx.stroke();
    });
    ctx.setLineDash([]); // Reset line dash to solid for other drawings

    // Draw planets and update their positions
    planets.filter(p => p.name !== "Sun").forEach(planet => {
        // Update angle for rotation
        planet.angle = (planet.angle || 0) + planet.orbitalSpeed;

        // Use scaledOrbitalRadius for planet positions
        const x = SUN_CENTER_X + planet.scaledOrbitalRadius * Math.cos(planet.angle);
        const y = SUN_CENTER_Y + planet.scaledOrbitalRadius * Math.sin(planet.angle);

        if (planet.image) {
            const imageSize = planet.radius * 2; // Adjust size as needed
            ctx.drawImage(planet.image, x - planet.radius, y - planet.radius, imageSize, imageSize);
        } else {
            // Fallback to drawing a circle if image is not loaded
            ctx.fillStyle = planet.color;
            ctx.beginPath();
            ctx.arc(x, y, planet.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
        }

        // Draw planet name
        ctx.fillStyle = '#fff';
        ctx.font = '10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(planet.name, x, y + planet.radius + 12);
    });
}

/**
 * @function animateSolarSystem
 * @description The main animation loop for the solar system.
 * It continuously calls drawSolarSystem to update the visual.
 */
function animateSolarSystem() {
    drawSolarSystem();
    animationFrameId = requestAnimationFrame(animateSolarSystem);
}


// Event Listeners for Buttons

/**
 * @event viewPlanetsBtn click
 * @description Handles the "View Planets by Range" button click.
 * Filters planets from allPlanetsData based on the provided start and end indices.
 */
viewPlanetsBtn.addEventListener('click', () => {
    const start = startPlanetInput.value;
    const end = endPlanetInput.value;

    if (start === '' || end === '') {
        showMessageBox('Please enter both start and end numbers (0-8 for start, 1-9 for end).');
        return;
    }

    const startIndex = parseInt(start);
    const endIndex = parseInt(end);

    if (isNaN(startIndex) || isNaN(endIndex) || startIndex < 0 || endIndex <= startIndex) {
        showMessageBox('Invalid range. Start must be non-negative, and End must be greater than Start.');
        return;
    }

    // Filter from allPlanetsData and then pass to display function
    let filteredPlanets = allPlanetsData.slice(startIndex, endIndex);
    displayPlanets(filteredPlanets, "Solar System", `Displaying planets from index ${startIndex} to ${endIndex - 1}.`);
});

/**
 * @event searchPlanetBtn click
 * @description Handles the "Search the Planet" button click.
 * Searches for a planet by name from allPlanetsData.
 */
searchPlanetBtn.addEventListener('click', async () => {
    const planetName = searchPlanetInput.value.trim();
    if (planetName === '') {
        showMessageBox('Please enter a planet name to search.');
        return;
    }

    // Filter from allPlanetsData directly for search
    const searchResults = allPlanetsData.filter(p =>
        p.name.toLowerCase().includes(planetName.toLowerCase())
    );

    if (searchResults.length === 0) {
        showMessageBox(`No planet found with the name "${planetName}".`);
        displayPlanets([...allPlanetsData], "Solar System", `No planet found with the name "${planetName}". Showing all planets.`); // Revert to displaying all planets
        return;
    }

    // Find the exact planet if possible, otherwise use the first search result
    const foundPlanet = searchResults.find(p => p.name.toLowerCase() === planetName.toLowerCase()) || searchResults[0];

    // Update the title and description using the found planet's details
    displayPlanets(searchResults, foundPlanet.name, foundPlanet.description);
});

// Initial fetch and render when the script loads
// This is now handled by the window.onload event listener.
