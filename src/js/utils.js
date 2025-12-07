/**
 * Utility Functions
 * Smoothing filters and helper functions for parallax calculations
 */

/**
 * Linear interpolation between two values
 * @param {number} current - Current value
 * @param {number} target - Target value
 * @param {number} factor - Interpolation factor (0-1, lower = smoother)
 */
export function lerp(current, target, factor = 0.1) {
    return current + (target - current) * factor;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * One Euro Filter for jitter reduction
 * Adaptive low-pass filter that provides smooth output while maintaining responsiveness
 */
export class OneEuroFilter {
    constructor(frequency = 60, minCutoff = 1.0, beta = 0.007, dCutoff = 1.0) {
        this.frequency = frequency;
        this.minCutoff = minCutoff;
        this.beta = beta;
        this.dCutoff = dCutoff;

        this.xPrev = null;
        this.dxPrev = 0;
        this.tPrev = null;
    }

    alpha(cutoff) {
        const tau = 1.0 / (2 * Math.PI * cutoff);
        const te = 1.0 / this.frequency;
        return 1.0 / (1.0 + tau / te);
    }

    filter(x, timestamp = null) {
        if (this.xPrev === null) {
            this.xPrev = x;
            this.tPrev = timestamp ?? performance.now() / 1000;
            return x;
        }

        const t = timestamp ?? performance.now() / 1000;
        const dt = t - this.tPrev;
        this.frequency = dt > 0 ? 1.0 / dt : this.frequency;
        this.tPrev = t;

        // Derivative estimation
        const dx = (x - this.xPrev) / (dt > 0 ? dt : 1 / 60);
        const edx = this.alpha(this.dCutoff) * dx + (1 - this.alpha(this.dCutoff)) * this.dxPrev;
        this.dxPrev = edx;

        // Adaptive cutoff
        const cutoff = this.minCutoff + this.beta * Math.abs(edx);

        // Filtered value
        const result = this.alpha(cutoff) * x + (1 - this.alpha(cutoff)) * this.xPrev;
        this.xPrev = result;

        return result;
    }

    reset() {
        this.xPrev = null;
        this.dxPrev = 0;
        this.tPrev = null;
    }
}

/**
 * FPS Counter
 */
export class FPSCounter {
    constructor() {
        this.frames = [];
        this.lastTime = performance.now();
    }

    tick() {
        const now = performance.now();
        const delta = now - this.lastTime;
        this.lastTime = now;
        this.frames.push(delta);

        // Keep last 60 frames
        if (this.frames.length > 60) {
            this.frames.shift();
        }
    }

    getFPS() {
        if (this.frames.length === 0) return 0;
        const avg = this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
        return Math.round(1000 / avg);
    }
}
