import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

class JoinBackground3D {
    constructor() {
        this.container = document.getElementById('join-3d-canvas');
        if (!this.container) return;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.shapes = [];
        this.clock = new THREE.Clock();

        this.init();
        this.animate();
    }

    init() {
        // 1. Scene & Camera
        this.scene = new THREE.Scene();

        const width = this.container.clientWidth || window.innerWidth;
        const height = this.container.clientHeight || (window.innerWidth <= 1024 ? 400 : 800); // 모바일/PC 기본값

        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.z = 5;

        // 2. Renderer
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // 3. Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0x00d4ff, 1.5);
        pointLight1.position.set(5, 5, 5);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xa855f7, 1);
        pointLight2.position.set(-5, -5, 5);
        this.scene.add(pointLight2);

        // 4. Create Shapes
        this.createAmbientShapes();
        this.loadRatsModel();

        // 5. Resize Listener
        window.addEventListener('resize', () => this.onWindowResize());

        this.resizeObserver = new ResizeObserver(() => this.onWindowResize());
        this.resizeObserver.observe(this.container);
    }

    createAmbientShapes() {
        const materialConfig = {
            color: 0x00d4ff,
            wireframe: true,
            transparent: true,
            opacity: 0.15
        };

        // 1. Octahedron (Diamond) - Align with "Freshman" card (Left/Top)
        const octGeo = new THREE.OctahedronGeometry(0.7, 0);
        const oct = new THREE.Mesh(octGeo, new THREE.MeshPhongMaterial({
            ...materialConfig,
            color: 0x00ff88,
            opacity: 0.2
        }));
        this.scene.add(oct);
        this.shapes.push({
            mesh: oct,
            speed: 0.5,
            float: 0.3,
            basePos: new THREE.Vector3(-3.2, -1.8, -1.5), // Desktop position
            mobPos: new THREE.Vector3(0, -1, -1.5)        // Mobile position
        });

        // 2. Icosahedron (Tech Ball) - Align with "Current Student" card (Right/Bottom)
        const icoGeo = new THREE.IcosahedronGeometry(0.6, 1);
        const ico = new THREE.Mesh(icoGeo, new THREE.MeshPhongMaterial({
            ...materialConfig,
            color: 0xa855f7,
            opacity: 0.25
        }));
        this.scene.add(ico);
        this.shapes.push({
            mesh: ico,
            speed: 0.7,
            float: 0.4,
            basePos: new THREE.Vector3(3.2, -1.8, -1.5), // Desktop position
            mobPos: new THREE.Vector3(0, -6, -1.5)        // Mobile position (stacked below)
        });
    }

    loadRatsModel() {
        const loader = new STLLoader();
        loader.load('assets/model/rats3d.stl', (geometry) => {
            geometry.center();

            const material = new THREE.MeshPhongMaterial({
                color: 0x00d4ff,
                wireframe: true,
                transparent: true,
                opacity: 0.4,
                shininess: 100
            });

            const mesh = new THREE.Mesh(geometry, material);

            geometry.computeBoundingBox();
            const bbox = geometry.boundingBox;
            const size = new THREE.Vector3();
            bbox.getSize(size);
            const maxDim = Math.max(size.x, size.y, size.z);
            const scaleFactor = 3.5 / maxDim;
            mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);

            this.scene.add(mesh);
            this.shapes.push({
                mesh: mesh,
                speed: 0.8,
                float: 0.4,
                isMain: true,
                basePos: new THREE.Vector3(0, 1.5, -1), // Desktop position
                mobPos: new THREE.Vector3(0, 3, -1)     // Mobile position
            });

            // Initial position update
            this.updateResponsivePositions();
        });
    }

    onWindowResize() {
        if (!this.container || !this.camera || !this.renderer) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        if (width === 0 || height === 0) return;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);

        // Update shape positions on resize
        this.updateResponsivePositions();
    }

    updateResponsivePositions() {
        const isMobile = window.innerWidth <= 1024;
        this.shapes.forEach(shape => {
            const targetPos = isMobile ? shape.mobPos : shape.basePos;
            if (targetPos) {
                shape.mesh.position.copy(targetPos);
            }
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const time = this.clock.getElapsedTime();

        this.shapes.forEach((shape, index) => {
            // Rotation
            shape.mesh.rotation.y += 0.005 * shape.speed;
            if (shape.isMain) {
                shape.mesh.rotation.z = Math.sin(time * 0.2) * 0.1;
                shape.mesh.position.y = Math.sin(time * 0.5) * 0.3;
            } else {
                shape.mesh.rotation.x += 0.003 * shape.speed;
                shape.mesh.position.y += Math.sin(time * shape.speed + index) * 0.002 * shape.float;
            }
        });

        this.renderer.render(this.scene, this.camera);
    }
}

window.initJoin3D = function () {
    if (window.join3DInstance) return window.join3DInstance;
    window.join3DInstance = new JoinBackground3D();
    return window.join3DInstance;
};
