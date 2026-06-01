// cursor-glow.js — 미래적 글로우 트레일 커서 효과
(function () {
    // 모바일/터치 디바이스에서는 비활성화
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);

    let mouseX = -100, mouseY = -100;
    let glowX = -100, glowY = -100;
    let visible = false;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!visible) {
            visible = true;
            glow.classList.add('visible');
        }
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
        visible = false;
        glow.classList.remove('visible');
    });

    document.addEventListener('mousedown', () => {
        glow.classList.add('clicking');
    });

    document.addEventListener('mouseup', () => {
        glow.classList.remove('clicking');
    });

    // 부드러운 추적 (lerp)
    function animate() {
        glowX += (mouseX - glowX) * 0.15;
        glowY += (mouseY - glowY) * 0.15;
        glow.style.left = glowX + 'px';
        glow.style.top = glowY + 'px';
        requestAnimationFrame(animate);
    }

    animate();
})();
