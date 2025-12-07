/**
 * MediaPipe Face Tracking Integration
 * Extracts nose tip position for head tracking
 * Visualizes 478 face mesh landmarks
 */

import { OneEuroFilter } from './utils.js';

// Landmark indices
const NOSE_TIP_INDEX = 1;

// Face mesh connection groups for drawing
const FACE_OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10];
const LIPS_OUTER = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185, 61];
const LIPS_INNER = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191, 78];
const LEFT_EYE = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246, 33];
const RIGHT_EYE = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398, 362];
const LEFT_EYEBROW = [70, 63, 105, 66, 107, 55, 65, 52, 53, 46];
const RIGHT_EYEBROW = [300, 293, 334, 296, 336, 285, 295, 282, 283, 276];

export class FaceTracker {
    constructor() {
        this.faceMesh = null;
        this.camera = null;
        this.videoElement = null;
        this.canvasElement = null;
        this.ctx = null;

        // Normalized head position (-1 to 1)
        this.headX = 0;
        this.headY = 0;
        this.confidence = 0;

        // Store landmarks for external access
        this.landmarks = null;

        // Smoothing filters
        this.filterX = new OneEuroFilter(60, 1.0, 0.007);
        this.filterY = new OneEuroFilter(60, 1.0, 0.007);

        // Callbacks
        this.onTrackingUpdate = null;
        this.onConfidenceChange = null;

        // Visualization settings
        this.showLandmarks = true;
        this.showConnections = true;

        this.isTracking = false;
    }

    async init() {
        // Get video element
        this.videoElement = document.getElementById('webcam');
        this.canvasElement = document.getElementById('face-canvas');

        if (this.canvasElement) {
            this.ctx = this.canvasElement.getContext('2d');
        }

        try {
            // Request webcam access
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            });

            this.videoElement.srcObject = stream;
            await this.videoElement.play();

            // Initialize MediaPipe Face Mesh
            this.faceMesh = new window.FaceMesh({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
                }
            });

            this.faceMesh.setOptions({
                maxNumFaces: 1,
                refineLandmarks: true, // Enable refined landmarks for better accuracy
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            this.faceMesh.onResults((results) => this.onResults(results));

            // Setup camera utility
            this.camera = new window.Camera(this.videoElement, {
                onFrame: async () => {
                    if (this.faceMesh) {
                        await this.faceMesh.send({ image: this.videoElement });
                    }
                },
                width: 640,
                height: 480
            });

            await this.camera.start();
            this.isTracking = true;

            console.log('Face Mesh loaded (478 landmarks)');
            console.log('Tracking started');

            return true;
        } catch (error) {
            console.error('Failed to initialize face tracking:', error);
            return false;
        }
    }

    onResults(results) {
        // Clear canvas
        if (this.ctx && this.canvasElement) {
            // Set canvas size to match video
            const rect = this.videoElement.getBoundingClientRect();
            this.canvasElement.width = rect.width;
            this.canvasElement.height = rect.height;
            this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        }

        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            const landmarks = results.multiFaceLandmarks[0];
            this.landmarks = landmarks;
            const noseTip = landmarks[NOSE_TIP_INDEX];

            // Convert to normalized coordinates (-1 to 1)
            // MediaPipe returns 0-1, we need to center and scale
            const rawX = (noseTip.x - 0.5) * 2; // -1 to 1
            const rawY = (noseTip.y - 0.5) * 2; // -1 to 1

            // Apply smoothing
            this.headX = this.filterX.filter(rawX);
            this.headY = this.filterY.filter(rawY);

            // High confidence when face is detected
            this.confidence = 100;

            // Draw landmarks on canvas
            if (this.ctx && this.showLandmarks) {
                this.drawLandmarks(landmarks);
            }

            if (this.onTrackingUpdate) {
                this.onTrackingUpdate(this.headX, this.headY);
            }
        } else {
            // No face detected - gradually reduce confidence
            this.confidence = Math.max(0, this.confidence - 5);
            this.landmarks = null;
        }

        if (this.onConfidenceChange) {
            this.onConfidenceChange(this.confidence);
        }
    }

    /**
     * Draw face mesh landmarks on canvas
     */
    drawLandmarks(landmarks) {
        const width = this.canvasElement.width;
        const height = this.canvasElement.height;

        // Draw connections first (green lines)
        if (this.showConnections) {
            this.ctx.strokeStyle = '#00ff88';
            this.ctx.lineWidth = 1;

            // Draw face oval
            this.drawConnection(landmarks, FACE_OVAL, width, height);

            // Draw lips
            this.ctx.strokeStyle = '#00ff88';
            this.drawConnection(landmarks, LIPS_OUTER, width, height);
            this.drawConnection(landmarks, LIPS_INNER, width, height);

            // Draw eyes
            this.ctx.strokeStyle = '#00ff88';
            this.drawConnection(landmarks, LEFT_EYE, width, height);
            this.drawConnection(landmarks, RIGHT_EYE, width, height);

            // Draw eyebrows
            this.ctx.strokeStyle = '#00ff88';
            this.ctx.lineWidth = 2;
            this.drawOpenConnection(landmarks, LEFT_EYEBROW, width, height);
            this.drawOpenConnection(landmarks, RIGHT_EYEBROW, width, height);
        }

        // Draw landmark points (red dots)
        this.ctx.fillStyle = '#ff4444';
        for (let i = 0; i < landmarks.length; i++) {
            const point = landmarks[i];
            const x = point.x * width;
            const y = point.y * height;

            this.ctx.beginPath();
            this.ctx.arc(x, y, 1.5, 0, 2 * Math.PI);
            this.ctx.fill();
        }

        // Highlight nose tip (larger yellow dot)
        const noseTip = landmarks[NOSE_TIP_INDEX];
        this.ctx.fillStyle = '#ffff00';
        this.ctx.beginPath();
        this.ctx.arc(noseTip.x * width, noseTip.y * height, 4, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    /**
     * Draw a closed connection path
     */
    drawConnection(landmarks, indices, width, height) {
        if (indices.length < 2) return;

        this.ctx.beginPath();
        const first = landmarks[indices[0]];
        this.ctx.moveTo(first.x * width, first.y * height);

        for (let i = 1; i < indices.length; i++) {
            const point = landmarks[indices[i]];
            this.ctx.lineTo(point.x * width, point.y * height);
        }

        this.ctx.closePath();
        this.ctx.stroke();
    }

    /**
     * Draw an open connection path (no closing)
     */
    drawOpenConnection(landmarks, indices, width, height) {
        if (indices.length < 2) return;

        this.ctx.beginPath();
        const first = landmarks[indices[0]];
        this.ctx.moveTo(first.x * width, first.y * height);

        for (let i = 1; i < indices.length; i++) {
            const point = landmarks[indices[i]];
            this.ctx.lineTo(point.x * width, point.y * height);
        }

        this.ctx.stroke();
    }

    getPosition() {
        return {
            x: this.headX,
            y: this.headY,
            confidence: this.confidence
        };
    }

    getLandmarks() {
        return this.landmarks;
    }

    toggleLandmarks(show) {
        this.showLandmarks = show;
    }

    stop() {
        if (this.camera) {
            this.camera.stop();
        }
        if (this.videoElement && this.videoElement.srcObject) {
            this.videoElement.srcObject.getTracks().forEach(track => track.stop());
        }
        this.isTracking = false;

        // Clear canvas
        if (this.ctx && this.canvasElement) {
            this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        }
    }

    reset() {
        this.filterX.reset();
        this.filterY.reset();
        this.headX = 0;
        this.headY = 0;
    }
}
