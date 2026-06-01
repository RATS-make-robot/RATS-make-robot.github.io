// cursor-3d.js — 3D 모델을 활용한 커스텀 마우스 커서
(function () {
    // 모바일 기기 완벽 차단 (터치스크린 노트북 오작동 방지를 위해 UserAgent로만 체크)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) return;

    // 전역 커서 숨기기 및 스타일 정의
    const style = document.createElement('style');
    style.textContent = `
        @media (pointer: fine) {
            * { cursor: none !important; }
            .cursor-glow { display: none !important; }
        }
        @media (pointer: coarse) {
            #cursor-3d-wrapper, #cursor-3d-dot { display: none !important; }
        }
        
        /* 마우스 끝부분을 알려주는 즉각 반응형 핫스팟 (직각삼각형) */
        #cursor-3d-dot {
            position: fixed;
            top: 0;
            left: 0;
            width: 14px;
            height: 14px;
            pointer-events: none;
            z-index: 10001;
            /* 위치 이동(transform)에는 지연이 없어야 마우스가 밀리지 않음 */
            will-change: transform;
        }
        #cursor-3d-dot::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #fff;
            clip-path: polygon(0 0, 100% 0, 0 100%);
            filter: drop-shadow(0 0 5px rgba(0, 212, 255, 0.8));
            transition: background 0.2s ease, transform 0.2s ease, filter 0.2s ease;
            transform-origin: top left;
        }
        #cursor-3d-dot.hovering::before {
            background: #1d4ed8;
            filter: drop-shadow(0 0 8px rgba(29, 78, 216, 0.8));
            transform: scale(1.2);
        }
        #cursor-3d-dot.clicking::before {
            transform: scale(0.8);
        }

        /* 한 박자 늦게 따라오는 3D 로봇 로고 래퍼 */
        #cursor-3d-wrapper {
            position: fixed;
            top: 0;
            left: 0;
            pointer-events: none;
            z-index: 10000;
            display: flex;
            align-items: center;
            will-change: transform;
        }
        #cursor-3d-canvas-container {
            width: 48px;
            height: 48px;
            position: relative;
            transition: transform 0.4s ease-out;
            /* 기준점을 캔버스 왼쪽 위로 두어 커서 핫스팟과 정렬되게 함 */
            transform-origin: top left;
        }
        #cursor-3d-text {
            opacity: 0;
            transform: translateX(-5px);
            transition: all 0.4s ease-out;
            color: #00d4ff;
            font-weight: 700;
            font-size: 0.85rem;
            margin-left: 8px;
            text-shadow: 0 0 10px rgba(0, 212, 255, 0.6);
            letter-spacing: 3px;
            white-space: nowrap;
            text-transform: uppercase;
        }
        /* 호버 상태 스타일 */
        #cursor-3d-wrapper.hovering #cursor-3d-canvas-container {
            transform: scale(1.15);
        }
        #cursor-3d-wrapper.hovering #cursor-3d-text {
            opacity: 1;
            transform: translateX(0);
        }
    `;
    document.head.appendChild(style);

    // 즉각 반응형 점 요소
    const dotEl = document.createElement('div');
    dotEl.id = 'cursor-3d-dot';
    document.body.appendChild(dotEl);

    // 지연되어 따라오는 3D 커서 요소
    const wrapper = document.createElement('div');
    wrapper.id = 'cursor-3d-wrapper';
    
    const canvasContainer = document.createElement('div');
    canvasContainer.id = 'cursor-3d-canvas-container';
    
    const textEl = document.createElement('div');
    textEl.id = 'cursor-3d-text';
    textEl.textContent = 'LINK!';
    
    wrapper.appendChild(canvasContainer);
    wrapper.appendChild(textEl);
    document.body.appendChild(wrapper);

    // Three.js 셋업
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 4.5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(48, 48);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasContainer.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x00d4ff, 2.5);
    pointLight.position.set(2, 2, 3);
    scene.add(pointLight);

    let cursorModel = null;
    const material = new THREE.MeshPhongMaterial({
        color: 0x00d4ff,
        specular: 0xffffff,
        shininess: 150,
        wireframe: true,
        transparent: true,
        opacity: 0.9
    });

    const loader = new THREE.STLLoader();
    loader.load('assets/model/rats3d.stl', (geometry) => {
        geometry.center();
        geometry.computeBoundingBox();
        const bbox = geometry.boundingBox;
        const size = new THREE.Vector3();
        bbox.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.2 / maxDim; // 모델 크기 조정
        
        cursorModel = new THREE.Mesh(geometry, material);
        cursorModel.scale.set(scale, scale, scale);
        cursorModel.userData.baseScale = scale;
        cursorModel.rotation.x = -Math.PI / 6;
        scene.add(cursorModel);
    }, undefined, () => {
        // 모델 로드 실패시 폴백 (정이십면체)
        const geo = new THREE.IcosahedronGeometry(1.2, 0);
        cursorModel = new THREE.Mesh(geo, material);
        cursorModel.userData.baseScale = 1.0;
        scene.add(cursorModel);
    });

    // 마우스 추적 (Lerp 보간)
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    let isHovering = false;
    let isClicking = false;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        // 직각삼각형은 즉시 이동 (지연 없음)
        dotEl.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    }, { passive: true });

    // 호버 상태 감지 대상 셀렉터
    const hoverSelectors = 'a, button, .nav-item, .more-card, .pill-item, [role="button"]';

    document.addEventListener('mouseover', (e) => {
        const target = e.target.closest(hoverSelectors);
        if (target) {
            isHovering = true;
            wrapper.classList.add('hovering');
            dotEl.classList.add('hovering');
            
            // 페이지 내 섹션 이동 링크인지 확인하여 텍스트 변경
            const href = target.getAttribute('href');
            if (href && href.startsWith('#')) {
                textEl.textContent = 'GO!';
            } else {
                textEl.textContent = 'LINK!';
            }

            // 호버 시 색상 변경 (진한 파란색)
            material.color.setHex(0x1d4ed8);
            pointLight.color.setHex(0x1d4ed8);
            textEl.style.color = '#1d4ed8';
            textEl.style.textShadow = '0 0 10px #1d4ed8, 0 0 20px #00d4ff';
        }
    });

    document.addEventListener('mouseout', (e) => {
        const target = e.target.closest(hoverSelectors);
        if (target) {
            isHovering = false;
            wrapper.classList.remove('hovering');
            dotEl.classList.remove('hovering');
            // 원래 색상 복귀 (형광 시안)
            material.color.setHex(0x00d4ff);
            pointLight.color.setHex(0x00d4ff);
            textEl.style.color = '#00d4ff';
            textEl.style.textShadow = '0 0 10px #00d4ff, 0 0 20px #a855f7';
        }
    });
    
    // 클릭 상태 감지 (화면 밖이나 드래그 시 마우스 업을 놓치는 버그 방지)
    document.addEventListener('mousedown', () => {
        isClicking = true;
        dotEl.classList.add('clicking');
    });
    document.addEventListener('mouseup', () => {
        isClicking = false;
        dotEl.classList.remove('clicking');
    });
    // 창을 벗어나거나 드래그가 끝날 때 클릭 상태 해제 보장
    window.addEventListener('blur', () => { isClicking = false; dotEl.classList.remove('clicking'); });
    document.addEventListener('mouseleave', () => { isClicking = false; dotEl.classList.remove('clicking'); });
    document.addEventListener('dragend', () => { isClicking = false; dotEl.classList.remove('clicking'); });

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        
        // 커서 이동 부드럽게 (Lerp), 더 늦게 따라오게 하려면 계수를 작게(0.15)
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        
        // 3D 커서 래퍼 이동
        // 래퍼의 좌측 상단(0,0)을 마우스 좌표와 일치시키기 위해 cursorX, cursorY 그대로 사용
        wrapper.style.transform = `translate(${cursorX}px, ${cursorY}px)`;

        const dt = clock.getDelta();
        if (cursorModel) {
            // 호버 시 살짝만 더 빠르게 스핀 (너무 깨발랄하지 않게 고급스럽게)
            cursorModel.rotation.y += dt * (isHovering ? 3.0 : 1.5);
            cursorModel.rotation.x += dt * (isHovering ? 1.5 : 0.8);
            cursorModel.rotation.z += dt * (isHovering ? 0.5 : 0.2);

            // 안전한 클릭 스케일링 (수학적 꼬임 및 계속 작아지는 버그 원천 차단)
            const baseScale = cursorModel.userData.baseScale || 1.0;
            const targetScale = isClicking ? baseScale * 0.6 : baseScale;
            
            // 부드러운 스케일 전환 (Lerp)
            cursorModel.scale.x += (targetScale - cursorModel.scale.x) * 0.3;
            cursorModel.scale.y += (targetScale - cursorModel.scale.y) * 0.3;
            cursorModel.scale.z += (targetScale - cursorModel.scale.z) * 0.3;
        }

        renderer.render(scene, camera);
    }
    
    animate();
})();
