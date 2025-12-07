/**
 * MediaPipe Face Tracking Integration
 * Extracts nose tip position for head tracking
 */

import { OneEuroFilter } from './utils.js';

// Landmark 1 = Nose tip
const NOSE_TIP_INDEX = 1;

export class FaceTracker {
    constructor() {
        this.faceMesh = null;
        this.camera = null;
        this.videoElement = null;

        // Normalized head position (-1 to 1)
        this.headX = 0;
        this.headY = 0;
        this.confidence = 0;

        // Smoothing filters
        this.filterX = new OneEuroFilter(60, 1.0, 0.007);
        this.filterY = new OneEuroFilter(60, 1.0, 0.007);

        // Callbacks
        this.onTrackingUpdate = null;
        this.onConfidenceChange = null;

        this.isTracking = false;
    }

    async init() {
        // Get video element
        this.videoElement = document.getElementById('webcam');

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
                refineLandmarks: false,
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

            console.log('Face Mesh loaded');
            console.log('Tracking started');

            return true;
        } catch (error) {
            console.error('Failed to initialize face tracking:', error);
            return false;
        }
    }

    onResults(results) {
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            const landmarks = results.multiFaceLandmarks[0];
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

            if (this.onTrackingUpdate) {
                this.onTrackingUpdate(this.headX, this.headY);
            }
        } else {
            // No face detected - gradually reduce confidence
            this.confidence = Math.max(0, this.confidence - 5);
        }

        if (this.onConfidenceChange) {
            this.onConfidenceChange(this.confidence);
        }
    }

    getPosition() {
        return {
            x: this.headX,
            y: this.headY,
            confidence: this.confidence
        };
    }

    stop() {
        if (this.camera) {
            this.camera.stop();
        }
        if (this.videoElement && this.videoElement.srcObject) {
            this.videoElement.srcObject.getTracks().forEach(track => track.stop());
        }
        this.isTracking = false;
    }

    reset() {
        this.filterX.reset();
        this.filterY.reset();
        this.headX = 0;
        this.headY = 0;
    }
}
