import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

/* =========================================================================
   [사용자 설정 가이드]
   1. STL 파일을 교체하려면:
      - 'assets/models/' 폴더에 새로운 .stl 파일을 넣으세요.
      - 아래 CONFIG 객체의 'modelPath' 값을 해당 파일 경로로 수정하세요.
      
   2. 모델 크기나 위치 조절:
      - scale: 모델 크기 (기본값 1.0)
      - color: 모델 색상 (16진수)
   ========================================================================= */

const CONFIG = {
    modelPath: 'assets/model/rats3d.stl', // 교체할 STL 파일 경로 (파일명 대소문자 주의)
    color: 0x00d4ff,                     // 모델 색상 (형광 하늘색)
    scale: 0.15,                         // 모델 기본 크기 (폴백은 자동 조정됨)
    wireframe: true,                     // 와이어프레임 모드
    opacity: 0.4                         // 투명도
};

class Background3D {
    constructor() {
        this.container = document.getElementById('canvas-container');
        if (!this.container) return;

        // Scene 구성 요소
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.modelGroup = new THREE.Group(); // 모델을 담을 그룹
        this.model = null;

        // 인터랙션 상태 값
        this.pointerTarget = new THREE.Vector2(0, 0); // 마우스 목표 위치 (-1 ~ 1)
        this.pointer = new THREE.Vector2(0, 0);       // 현재 마우스 위치 (보간됨)
        this.scrollTarget = 0;                        // 스크롤 목표 값 (0 ~ 1)
        this.scroll = 0;                              // 현재 스크롤 값 (보간됨)

        this.clock = new THREE.Clock();
        this.lastMouseMoveTime = 0; // 마지막 마우스 움직임 시간
        this.isMouseMoving = false; // 마우스 움직임 활성화 여부

        this.init();
        this.animate();
    }

    // 선형 보간 함수 (부드러운 움직임)
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    init() {
        // ... (기존 코드 생략)
        // 1. Scene 설정
        this.scene = new THREE.Scene();
        // 안개 효과 (배경색과 자연스럽게 섞이도록)
        this.scene.fog = new THREE.FogExp2(0x0a0e1a, 0.02);

        // 2. Camera 설정
        // window.innerWidth 대신 container 크기 사용
        this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        // 초기 위치 (이후 animate에서 갱신됨)
        this.camera.position.z = 5;

        // 3. Renderer 설정
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // 4. 조명 설정
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0x00d4ff, 1.5);
        pointLight.position.set(5, 5, 5);
        this.scene.add(pointLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(-5, 5, 5);
        this.scene.add(dirLight);

        // 5. 그룹 추가 및 모델 로드
        this.scene.add(this.modelGroup);
        this.loadModel();

        // 6. 이벤트 리스너
        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('scroll', () => this.onScroll(), { passive: true });
        window.addEventListener('mousemove', (e) => this.onMouseMove(e), { passive: true });

        // 터치 디바이스 대응 (터치 시작 시 마우스 모드 강제 종료)
        window.addEventListener('touchstart', () => {
            this.isMouseMoving = false;
        }, { passive: true });

        // 7. 파일 업로드 리스너
        const fileInput = document.getElementById('modelFile');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }

        // 초기 스크롤 값 계산
        this.onScroll();
    }

    handleFileUpload(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        const ext = file.name.split('.').pop().toLowerCase();
        if (ext !== 'stl') {
            alert('.stl 파일만 지원합니다.');
            return;
        }

        const url = URL.createObjectURL(file);
        this.loadSTLFromURL(url);
    }

    loadSTLFromURL(url) {
        const loader = new STLLoader();

        // 기존 모델 제거 (fallback 포함)
        if (this.model) {
            this.modelGroup.remove(this.model);
            if (this.model.geometry) this.model.geometry.dispose();
            if (this.model.material) this.model.material.dispose();
            this.model = null;
        }

        loader.load(
            url,
            (geometry) => {
                this.createMesh(geometry);
                console.log('New STL loaded');
            },
            undefined,
            (error) => {
                console.error('Failed to load STL:', error);
                alert('STL 로드 실패. 파일이 손상되었거나 지원하지 않는 형식일 수 있습니다.');
                // 실패 시 폴백 복구는 선택 사항 (여기선 그냥 둠)
            }
        );
    }

    loadModel() {
        // 초기 로드는 설정된 경로 사용
        this.loadSTLFromURL(CONFIG.modelPath);
    }

    createMesh(geometry) {
        // 기존 모델 제거 (이중 안전장치)
        if (this.model) {
            this.modelGroup.remove(this.model);
            if (this.model.geometry) this.model.geometry.dispose();
            if (this.model.material) this.model.material.dispose();
        }

        geometry.center(); // 중심점 정렬

        // 자동 스케일 조정 (화면에 적절히 들어오도록)
        geometry.computeBoundingBox();
        const bbox = geometry.boundingBox;
        const size = new THREE.Vector3();
        bbox.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetSize = 2.0; // 목표 크기 (월드 좌표계 기준)
        const scaleFactor = targetSize / maxDim;

        const material = new THREE.MeshPhongMaterial({
            color: CONFIG.color,
            specular: 0x111111,
            shininess: 200,
            wireframe: CONFIG.wireframe,
            transparent: true,
            opacity: CONFIG.opacity
        });

        this.model = new THREE.Mesh(geometry, material);
        this.model.scale.set(scaleFactor, scaleFactor, scaleFactor);

        // 약간의 초기 회전
        this.model.rotation.x = -Math.PI / 6;

        this.modelGroup.add(this.model);
    }

    createFallbackModel() {
        // 임시 도형: Icosahedron (Tech 느낌)
        const geometry = new THREE.IcosahedronGeometry(1.5, 1);

        // Wireframe Material
        const material = new THREE.MeshBasicMaterial({
            color: CONFIG.color,
            wireframe: true,
            transparent: true,
            opacity: CONFIG.opacity
        });

        this.model = new THREE.Mesh(geometry, material);
        this.modelGroup.add(this.model);
    }

    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        // 컨테이너가 변경된 크기에 맞춰짐 (CSS) -> 그 크기를 읽어서 리사이징
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    onScroll() {
        const doc = document.documentElement;
        // 전체 스크롤 가능한 높이
        const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
        // 현재 스크롤 위치 (0 ~ 1 정규화)
        const currentScroll = Math.max(0, Math.min(maxScroll, window.scrollY || 0));
        this.scrollTarget = currentScroll / maxScroll;
    }

    onMouseMove(event) {
        this.isMouseMoving = true;
        this.lastMouseMoveTime = Date.now();

        const rect = this.container.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        this.pointerTarget.x = (x / rect.width) * 2 - 1;
        this.pointerTarget.y = -(y / rect.height) * 2 + 1;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const dt = Math.min(0.05, this.clock.getDelta());
        const currentTime = Date.now();
        const smoothFactor = 1 - Math.pow(0.001, dt);

        this.scroll = this.lerp(this.scroll, this.scrollTarget, smoothFactor);

        // 2. 스마트 호버 디텍션 (Activity-based Detection)
        // 마우스 움직임이 2초 이상 없거나 터치 기기일 경우 Idle 애니메이션 활성화
        const inactivityDuration = currentTime - this.lastMouseMoveTime;
        const shouldShowIdle = !this.isMouseMoving || inactivityDuration > 2000;

        if (shouldShowIdle) {
            const time = this.clock.getElapsedTime();
            // 부드러운 8자 형태 움직임 시뮬레이션
            const idleX = Math.sin(time * 0.5) * 0.15;
            const idleY = Math.cos(time * 0.7) * 0.1;

            // 현재 타겟을 Idle 위치로 서서히 보정
            this.pointerTarget.x = this.lerp(this.pointerTarget.x, idleX, smoothFactor);
            this.pointerTarget.y = this.lerp(this.pointerTarget.y, idleY, smoothFactor);
        }

        this.pointer.x = this.lerp(this.pointer.x, this.pointerTarget.x, smoothFactor);
        this.pointer.y = this.lerp(this.pointer.y, this.pointerTarget.y, smoothFactor);

        // 2. 카메라 움직임 (스크롤 + 마우스 시선)
        // 스크롤을 내릴수록 카메라가 가까워짐 (Zoom In) 또는 뒤따라옴
        // Z: 5 (초기) -> 3.5 (끝)
        const camZ = this.lerp(6.0, 3.5, this.scroll);

        // 마우스 위치에 따라 카메라가 살짝 움직여서 입체감(Parallax) 부여
        const camX = this.pointer.x * 0.5;
        const camY = this.pointer.y * 0.5;

        // 카메라 위치 갱신
        this.camera.position.set(camX, camY + (this.scroll * 2), camZ); // Y축으로도 살짝 이동하여 따라가는 느낌

        // 카메라는 항상 원점(모델)을 바라봄
        this.camera.lookAt(0, this.scroll * 2, 0); // 모델과 함께 시선 이동

        // 3. 모델 자체 움직임
        if (this.modelGroup) {
            // 기본 자동 회전
            this.modelGroup.rotation.y += dt * 0.2;

            // 마우스 위치에 따라 모델이 바라보는 방향 회전 (기울기)
            // X축 회전 (위아래): 마우스 Y 영향
            // Y축 회전 (좌우): 마우스 X 영향
            const targetRotX = this.pointer.y * 0.3;
            const targetRotZ = this.pointer.x * 0.2;

            this.modelGroup.rotation.x = this.lerp(this.modelGroup.rotation.x, targetRotX, smoothFactor);
            this.modelGroup.rotation.z = this.lerp(this.modelGroup.rotation.z, targetRotZ, smoothFactor);

            // 스크롤에 따라 모델 위치 이동 (카메라가 따라가지만 모델도 움직여서 역동감)
            this.modelGroup.position.y = this.scroll * 1.5; // 위로 살짝 올라감 (또는 아래로)
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 약간의 딜레이 후 로드 (페이지 렌더링 우선)
    setTimeout(() => {
        new Background3D();
    }, 100);
});
