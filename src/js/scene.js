/**
 * Three.js Scene Configuration
 * Creates and manages the 3D scene with layered planes
 */

import * as THREE from 'three';

// Layer Z positions (from project spec)
const LAYER_CONFIG = {
    background: { z: -10, scale: 3.0 },
    midground: { z: 0, scale: 1.0 },
    foreground: { z: 2, scale: 0.8 }
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

        // Handle window resize
        window.addEventListener('resize', () => this.onResize());

        console.log('Scene initialized');
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
        const aspect = texture.image.width / texture.image.height;
        const height = 5 * config.scale;
        const width = height * aspect;

        const geometry = new THREE.PlaneGeometry(width, height);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.z = config.z;

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
        const shiftX = headX * 0.5;
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
        const aspect = window.innerWidth / window.innerHeight;
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
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
