/**
 * PARALLAX-CORE Main Application
 * Entry point that connects all modules together
 */

import { ParallaxScene } from './scene.js';
import { FaceTracker } from './tracker.js';
import { ParallaxController } from './parallax.js';
import { FPSCounter } from './utils.js';

// Configuration
const CONFIG = {
    // Asset paths (relative to index.html)
    assets: {
        background: './assets/layer_bg.png',
        midground: './assets/layer_mid.png',
        foreground: './assets/layer_char.png'
    },
    // Low light threshold (%)
    lowLightThreshold: 50,
    // Enable debug panel
    debug: true,
    // Start in demo mode (mouse control instead of webcam)
    demoMode: true
};

// Global state
let scene = null;
let tracker = null;
let parallax = null;
let fpsCounter = null;
let isRunning = false;
let demoMode = CONFIG.demoMode;
let mouseX = 0;
let mouseY = 0;

// DOM Elements
const loadingEl = document.getElementById('loading');
const confidenceEl = document.getElementById('confidence-indicator');
const confidenceValueEl = document.getElementById('confidence-value');
const lightBoosterEl = document.getElementById('light-booster');
const debugPanelEl = document.getElementById('debug-panel');

/**
 * Initialize the application
 */
async function init() {
    console.log('PARALLAX-CORE initializing...');

    // Initialize Three.js scene
    const container = document.getElementById('scene-container');
    scene = new ParallaxScene(container);

    // Load layer textures
    const layersLoaded = await scene.loadLayers(
        CONFIG.assets.background,
        CONFIG.assets.midground,
        CONFIG.assets.foreground
    );

    if (!layersLoaded) {
        showError('Failed to load layer images. Check that assets exist.');
        return;
    }

    // Initialize parallax controller
    parallax = new ParallaxController(scene);

    // Initialize FPS counter
    fpsCounter = new FPSCounter();

    if (demoMode) {
        // DEMO MODE: Use mouse for control
        console.log('Starting in DEMO MODE (mouse control)');
        setupMouseControl();

        // Update UI for demo mode
        confidenceValueEl.textContent = 'DEMO';
        confidenceEl.style.color = '#00aaff';

        // Hide loading and start
        loadingEl.classList.add('hidden');

        // Show debug panel
        if (CONFIG.debug) {
            debugPanelEl.classList.remove('hidden');
        }

        // Start animation loop
        isRunning = true;
        animateDemo();

        console.log('PARALLAX-CORE ready! (Demo Mode - Press T to enable tracking)');
    } else {
        // TRACKING MODE: Use webcam
        await initTracking();
    }
}

/**
 * Initialize face tracking
 */
async function initTracking() {
    // Initialize face tracker
    tracker = new FaceTracker();

    // Set up tracking callbacks
    tracker.onConfidenceChange = handleConfidenceChange;

    const trackingReady = await tracker.init();

    if (!trackingReady) {
        // Fallback to demo mode
        console.warn('Webcam not available, switching to demo mode');
        demoMode = true;
        setupMouseControl();
        confidenceValueEl.textContent = 'DEMO';
        confidenceEl.style.color = '#00aaff';
        loadingEl.classList.add('hidden');

        if (CONFIG.debug) {
            debugPanelEl.classList.remove('hidden');
        }

        isRunning = true;
        animateDemo();
        return;
    }

    // Show debug panel if enabled
    if (CONFIG.debug) {
        debugPanelEl.classList.remove('hidden');
    }

    // Hide loading screen
    loadingEl.classList.add('hidden');

    // Start animation loop
    isRunning = true;
    animate();

    console.log('PARALLAX-CORE ready!');
}

/**
 * Setup mouse control for demo mode
 */
function setupMouseControl() {
    document.addEventListener('mousemove', (e) => {
        // Normalize mouse position to -1 to 1
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });
}

/**
 * Animation loop for demo mode (mouse control)
 */
function animateDemo() {
    if (!isRunning) return;

    requestAnimationFrame(animateDemo);

    // Update parallax with mouse position
    parallax.update(mouseX, mouseY);

    // Render scene
    scene.render();

    // Update FPS
    fpsCounter.tick();

    // Update debug panel
    if (CONFIG.debug) {
        document.getElementById('head-x').textContent = mouseX.toFixed(3);
        document.getElementById('head-y').textContent = mouseY.toFixed(3);
        document.getElementById('fps').textContent = fpsCounter.getFPS();
    }
}

/**
 * Animation loop for tracking mode
 */
function animate() {
    if (!isRunning) return;

    requestAnimationFrame(animate);

    // Get current head position
    const pos = tracker.getPosition();

    // Update parallax
    parallax.update(pos.x, pos.y);

    // Render scene
    scene.render();

    // Update FPS
    fpsCounter.tick();

    // Update debug panel
    if (CONFIG.debug) {
        document.getElementById('head-x').textContent = pos.x.toFixed(3);
        document.getElementById('head-y').textContent = pos.y.toFixed(3);
        document.getElementById('fps').textContent = fpsCounter.getFPS();
    }
}

/**
 * Handle confidence changes
 */
function handleConfidenceChange(confidence) {
    confidenceValueEl.textContent = Math.round(confidence);

    // Update indicator color
    confidenceEl.classList.remove('low', 'medium');
    if (confidence < 30) {
        confidenceEl.classList.add('low');
    } else if (confidence < 70) {
        confidenceEl.classList.add('medium');
    }

    // Light booster for low light conditions
    if (confidence < CONFIG.lowLightThreshold) {
        lightBoosterEl.classList.remove('hidden');
    } else {
        lightBoosterEl.classList.add('hidden');
    }
}

/**
 * Show error message
 */
function showError(message) {
    loadingEl.innerHTML = `
        <div style="color: #ff4444; text-align: center;">
            <p style="font-size: 18px; margin-bottom: 10px;">⚠️ Error</p>
            <p>${message}</p>
        </div>
    `;
}

/**
 * Keyboard shortcuts
 */
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'd':
        case 'D':
            // Toggle debug panel
            debugPanelEl.classList.toggle('hidden');
            break;
        case 'l':
        case 'L':
            // Toggle light booster manually
            lightBoosterEl.classList.toggle('hidden');
            break;
        case 'r':
        case 'R':
            // Reset position
            if (parallax) parallax.reset();
            if (tracker) tracker.reset();
            mouseX = 0;
            mouseY = 0;
            break;
        case 't':
        case 'T':
            // Toggle tracking mode (disable demo mode and init tracking)
            if (demoMode && !tracker) {
                demoMode = false;
                isRunning = false;
                initTracking();
            }
            break;
    }
});

// Start the application
init();

