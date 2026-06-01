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

// 네비게이션 활성화 로직 및 스르륵 이동 애니메이션
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-item');
    const indicator = document.querySelector('.nav-indicator');

    if (sections.length === 0 || navItems.length === 0 || !indicator) return;

    function updateIndicator(activeItem) {
        if (!activeItem) return;
        // offsetLeft returns position relative to the container
        const left = activeItem.offsetLeft;
        const width = activeItem.offsetWidth;
        indicator.style.opacity = '1';
        indicator.style.transform = `translateX(${left}px)`;
        indicator.style.width = `${width}px`;
    }

    const navObserverOptions = {
        root: null,
        threshold: 0.1, // 섹션이 조금이라도 보일 때 계산을 위해 낮춤
        rootMargin: '-30% 0px -50% 0px' // 화면 중앙 근처를 기준으로 판정
    };

    const navObserver = new IntersectionObserver((entries) => {
        let mostVisible = null;
        let maxRatio = 0;
        
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
                maxRatio = entry.intersectionRatio;
                mostVisible = entry.target.id;
            }
        });

        if (mostVisible) {
            let target = mostVisible;
            if (target === 'hero') target = 'home';
            
            navItems.forEach(item => item.classList.remove('active'));
            const activeItem = document.querySelector(`.nav-item[data-target="${target}"]`);
            if (activeItem) {
                activeItem.classList.add('active');
                updateIndicator(activeItem);
            }
        }
    }, navObserverOptions);

    sections.forEach(section => {
        navObserver.observe(section);
    });

    // 클릭 시 파란색 색상만 즉시 변경하고 알약 배경은 스크롤에 따라 이동하도록 처리
    let scrollTimeout = null;
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // 모든 아이템에서 강제 파란색 클래스 제거
            navItems.forEach(n => n.classList.remove('clicked-target'));
            // 누른 버튼 즉시 파란색 적용
            item.classList.add('clicked-target');
            
            // 스크롤 이동이 완료될 즈음(1.2초 후) 강제 클래스를 지워 자연스럽게 옵저버에 맡김
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                navItems.forEach(n => n.classList.remove('clicked-target'));
            }, 1200);
        });
    });

    // 초기 인디케이터 위치 설정
    setTimeout(() => {
        const initialActive = document.querySelector('.nav-item.active');
        if (initialActive) updateIndicator(initialActive);
    }, 150);
});
