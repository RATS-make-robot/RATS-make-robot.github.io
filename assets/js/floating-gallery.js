// floating-gallery.js

document.addEventListener('DOMContentLoaded', () => {
    const galleryContainer = document.getElementById('hero-floating-gallery');
    if (!galleryContainer) return;

    // Fetch images from both YAMLs
    Promise.all([
        fetch('assets/data/projects.yaml').then(res => res.text()).catch(() => ''),
        fetch('assets/data/seminars.yaml').then(res => res.text()).catch(() => '')
    ]).then(([projectsYaml, seminarsYaml]) => {
        let imageUrls = [];

        try {
            if (projectsYaml) {
                const pData = jsyaml.load(projectsYaml);
                if (pData && pData.projects) {
                    pData.projects.forEach(p => {
                        if (p.image && !p.image.toLowerCase().endsWith('.gif')) imageUrls.push(p.image);
                    });
                }
            }
            if (seminarsYaml) {
                const sData = jsyaml.load(seminarsYaml);
                if (sData && sData.seminars) {
                    sData.seminars.forEach(s => {
                        if (s.image && !s.image.toLowerCase().endsWith('.gif')) imageUrls.push(s.image);
                    });
                }
            }
        } catch (e) {
            console.error("Error parsing YAML for gallery", e);
        }

        // 중복 제거 및 부족하면 더미 채우기 (최소 10장)
        imageUrls = [...new Set(imageUrls)];
        if (imageUrls.length === 0) return;

        // 랜덤하게 최대 15개 선택 (중복 불가 — 셔플 후 슬라이스)
        const targetCount = 15;
        // Fisher-Yates 셔플
        for (let i = imageUrls.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [imageUrls[i], imageUrls[j]] = [imageUrls[j], imageUrls[i]];
        }
        const selectedImages = imageUrls.slice(0, Math.min(targetCount, imageUrls.length));

        const images = [];

        selectedImages.forEach((url, i) => {
            const img = document.createElement('img');
            img.src = url;
            img.className = 'gallery-img';
            
            // Random properties (Avoid center area to not block 3D logo)
            const size = 120 + Math.random() * 80; // 120px ~ 200px
            
            let posX, posY;
            // 3D 로고(중앙 30% ~ 70% 영역) 피하기 로직
            do {
                posX = Math.random() * 85; // 0% ~ 85%
                posY = Math.random() * 85; // 0% ~ 85%
            } while (posX > 25 && posX < 75 && posY > 25 && posY < 75);
            
            const initialRotZ = (Math.random() - 0.5) * 60; // -30 to 30 deg
            const initialRotY = (Math.random() - 0.5) * 40; // -20 to 20 deg
            const initialRotX = (Math.random() - 0.5) * 40; // -20 to 20 deg
            
            const parallaxSpeed = 0.2 + Math.random() * 0.6; // 0.2 to 0.8
            const rotationSpeed = (Math.random() - 0.5) * 0.1; // -0.05 to 0.05
            
            img.style.width = `${size}px`;
            img.style.height = `${size * 0.75}px`;
            img.style.left = `${posX}%`;
            img.style.top = `${posY}%`;
            
            // Save metadata for scroll animation
            images.push({
                el: img,
                initZ: initialRotZ,
                initY: initialRotY,
                initX: initialRotX,
                speed: parallaxSpeed,
                rotSpeed: rotationSpeed
            });
            
            // Fade in after random delay
            setTimeout(() => {
                img.style.opacity = (0.2 + Math.random() * 0.5).toString(); // 반투명하게 (텍스트 방해 방지)
            }, 100 * i);
            
            galleryContainer.appendChild(img);
        });

        // Scroll Animation Logic
        let currentScroll = 0;
        let targetScroll = 0;
        
        window.addEventListener('scroll', () => {
            targetScroll = window.scrollY;
        }, { passive: true });
        
        function animate() {
            // 부드러운 보간 (Lerp)
            currentScroll += (targetScroll - currentScroll) * 0.1;
            
            images.forEach(item => {
                const yOffset = -currentScroll * item.speed;
                const rotZ = item.initZ + (currentScroll * item.rotSpeed);
                const rotY = item.initY + (currentScroll * item.rotSpeed * 0.5);
                const rotX = item.initX + (currentScroll * item.rotSpeed * 0.5);
                
                item.el.style.transform = `translate3d(0, ${yOffset}px, 0) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg)`;
            });
            
            requestAnimationFrame(animate);
        }
        
        animate();
    });
});
