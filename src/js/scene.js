/**
 * Three.js Scene Configuration
 * Creates and manages the 3D scene with layered planes
 */

import * as THREE from 'three';

// Layer Z positions (from project spec)
const LAYER_CONFIG = {
    background: { z: -10, scale: 1},
    midground: { z: 0, scale: 0.7 },
    foreground: { z: 2, scale: 0.5 }
};

// Camera configuration
const CAMERA_CONFIG = {
    fov: 60,
    near: 0.1,
    far: 100,
    initialZ: 5
};

export class ParallaxScene {
    constructor(container) {
        this.container = container;
        this.layers = {};
        this.layerTextures = {};
        this.texturesLoaded = false;

        this.init();
    }

    init() {
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 1);
        this.container.appendChild(this.renderer.domElement);

        // Create scene
        this.scene = new THREE.Scene();

        // Create camera
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(
            CAMERA_CONFIG.fov,
            aspect,
            CAMERA_CONFIG.near,
            CAMERA_CONFIG.far
        );
        this.camera.position.set(0, 0, CAMERA_CONFIG.initialZ);

        // Handle window resize with debounce
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => this.onResize(), 100);
        });

        console.log('Scene initialized');
    }

    /**
     * Calculate plane size to cover viewport at given Z position
     */
    calculatePlaneSize(zPosition, textureAspect) {
        const distance = CAMERA_CONFIG.initialZ - zPosition;
        const fovRad = THREE.MathUtils.degToRad(CAMERA_CONFIG.fov);

        // Calculate visible height at this distance
        const visibleHeight = 2 * Math.tan(fovRad / 2) * distance;
        const screenAspect = window.innerWidth / window.innerHeight;
        const visibleWidth = visibleHeight * screenAspect;

        // Add extra margin to ensure full coverage during parallax movement
        const coverageMultiplier = 1.5;

        let width, height;

        // Scale to cover the viewport while maintaining aspect ratio
        if (textureAspect > screenAspect) {
            // Texture is wider - fit to height
            height = visibleHeight * coverageMultiplier;
            width = height * textureAspect;
        } else {
            // Texture is taller - fit to width
            width = visibleWidth * coverageMultiplier;
            height = width / textureAspect;
        }

        return { width, height };
    }

    /**
     * Load layer textures and create planes
     */
    async loadLayers(bgPath, midPath, fgPath) {
        const loader = new THREE.TextureLoader();

        const loadTexture = (path) => {
            return new Promise((resolve, reject) => {
                loader.load(
                    path,
                    (texture) => {
                        texture.colorSpace = THREE.SRGBColorSpace;
                        resolve(texture);
                    },
                    undefined,
                    reject
                );
            });
        };

        try {
            const [bgTex, midTex, fgTex] = await Promise.all([
                loadTexture(bgPath),
                loadTexture(midPath),
                loadTexture(fgPath)
            ]);

            // Store textures for resize
            this.layerTextures = { background: bgTex, midground: midTex, foreground: fgTex };

            this.createLayerPlane('background', bgTex);
            this.createLayerPlane('midground', midTex);
            this.createLayerPlane('foreground', fgTex);

            this.texturesLoaded = true;
            console.log('All layers loaded');
            return true;
        } catch (error) {
            console.error('Failed to load textures:', error);
            return false;
        }
    }

    /**
     * Create a plane with texture at specified layer depth
     */
    createLayerPlane(layerName, texture) {
        const config = LAYER_CONFIG[layerName];

        // Calculate aspect ratio from texture
        const textureAspect = texture.image.width / texture.image.height;

        // Calculate size to cover viewport
        const { width, height } = this.calculatePlaneSize(config.z, textureAspect);

        // Apply layer-specific scale
        const finalWidth = width * config.scale;
        const finalHeight = height * config.scale;

        const geometry = new THREE.PlaneGeometry(finalWidth, finalHeight);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.z = config.z;

        // Store texture aspect for resize
        mesh.userData.textureAspect = textureAspect;
        mesh.userData.layerName = layerName;

        this.scene.add(mesh);
        this.layers[layerName] = mesh;
    }

    /**
     * Update camera position for parallax effect
     * Head position should be normalized to -1 to +1
     */
    updateCameraPosition(headX, headY, sensitivity = 2.0) {
        // Invert movement: camera moves opposite to head
        // This creates the parallax illusion
        this.camera.position.x = -headX * sensitivity;
        this.camera.position.y = -headY * sensitivity * 0.5; // Less vertical movement

        // Camera always looks at center
        this.camera.lookAt(0, 0, 0);
    }

    /**
     * Apply off-axis projection for "window" effect
     */
    applyOffAxisProjection(headX, headY) {
        const aspect = window.innerWidth / window.innerHeight;
        const near = this.camera.near;
        const fov = THREE.MathUtils.degToRad(CAMERA_CONFIG.fov);
        const top = near * Math.tan(fov / 2);
        const bottom = -top;
        const right = top * aspect;
        const left = -right;

        // Shift frustum based on head position
        const shiftX = headX * 0.01;
        const shiftY = headY * 0.25;

        this.camera.projectionMatrix.makePerspective(
            left + shiftX,
            right + shiftX,
            top + shiftY,
            bottom + shiftY,
            near,
            this.camera.far
        );
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const aspect = width / height;

        // Update camera
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();

        // Update renderer
        this.renderer.setSize(width, height);

        // Update layer planes to cover new viewport
        Object.entries(this.layers).forEach(([layerName, mesh]) => {
            const config = LAYER_CONFIG[layerName];
            const textureAspect = mesh.userData.textureAspect;

            if (textureAspect) {
                const { width: planeWidth, height: planeHeight } = this.calculatePlaneSize(config.z, textureAspect);

                // Dispose old geometry
                mesh.geometry.dispose();

                // Create new geometry with updated size
                mesh.geometry = new THREE.PlaneGeometry(
                    planeWidth * config.scale,
                    planeHeight * config.scale
                );
            }
        });

        console.log(`Resized to ${width}x${height}`);
    }

    dispose() {
        this.renderer.dispose();
        Object.values(this.layers).forEach(mesh => {
            mesh.geometry.dispose();
            mesh.material.dispose();
            if (mesh.material.map) mesh.material.map.dispose();
        });
    }
}
