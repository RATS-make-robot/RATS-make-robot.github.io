/* ================================================
   스크롤 애니메이션 & 섹션 자동 활성화
   ================================================ */

// 섹션 IntersectionObserver for fade-in animations
window.setupSectionAnimations = () => {
    const sections = document.querySelectorAll('section');

    // 섹션이 없으면 종료 (아직 로드 안 됨)
    if (sections.length === 0) return;

    const observerOptions = {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -10% 0px'
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
        // 이미 화면에 보이는 섹션은 즉시 visible 처리 (로딩 직후)
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
            section.classList.add('visible');
        }
    });

    console.log(`Scroll animations initialized for ${sections.length} sections.`);
};
