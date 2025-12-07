/**
 * Parallax Math Engine
 * Maps head position to camera movement and off-axis projection
 */

import { lerp, clamp } from './utils.js';

export class ParallaxController {
    constructor(scene) {
        this.scene = scene;

        // Configuration
        this.sensitivity = 2.0;
        this.lerpFactor = 0.1;
        this.enableOffAxis = true;

        // Current smoothed values
        this.currentX = 0;
        this.currentY = 0;
    }

    /**
     * Update parallax based on head position
     * @param {number} headX - Normalized head X (-1 to 1)
     * @param {number} headY - Normalized head Y (-1 to 1)
     */
    update(headX, headY) {
        // Apply additional lerp for extra smoothness
        this.currentX = lerp(this.currentX, headX, this.lerpFactor);
        this.currentY = lerp(this.currentY, headY, this.lerpFactor);

        // Clamp to prevent extreme camera positions
        const clampedX = clamp(this.currentX, -1, 1);
        const clampedY = clamp(this.currentY, -1, 1);

        // Update camera position
        this.scene.updateCameraPosition(clampedX, clampedY, this.sensitivity);

        // Apply off-axis projection for "window" effect
        if (this.enableOffAxis) {
            this.scene.applyOffAxisProjection(clampedX, clampedY);
        }
    }

    /**
     * Adjust sensitivity
     */
    setSensitivity(value) {
        this.sensitivity = clamp(value, 0.5, 5.0);
    }

    /**
     * Adjust smoothing
     */
    setSmoothing(value) {
        this.lerpFactor = clamp(value, 0.01, 0.5);
    }

    /**
     * Toggle off-axis projection
     */
    toggleOffAxis(enabled) {
        this.enableOffAxis = enabled;
    }

    /**
     * Reset to center
     */
    reset() {
        this.currentX = 0;
        this.currentY = 0;
    }
}
