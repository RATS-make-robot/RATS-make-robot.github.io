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
        const left = activeItem.offsetLeft;
        const width = activeItem.offsetWidth;
        const top = activeItem.offsetTop;
        const height = activeItem.offsetHeight;
        indicator.style.opacity = '1';
        indicator.style.transform = `translateX(${left}px)`;
        indicator.style.width = `${width}px`;
        indicator.style.top = `${top}px`;
        indicator.style.height = `${height}px`;
    }

    let isAutoScrolling = false;
    let autoScrollTimeout = null;
    let scrollSpyTicking = false;

    function updateNavOnScroll() {
        if (isAutoScrolling) {
            scrollSpyTicking = false;
            return;
        }

        let mostVisible = null;
        let maxVisibleHeight = 0;
        // 네비게이션 바 높이나 화면 중앙을 고려하여 계산 범위를 설정
        const viewportHeight = window.innerHeight;
        const viewTop = viewportHeight * 0.2; // 화면 상단 20%
        const viewBottom = viewportHeight * 0.8; // 화면 하단 80%

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            // 화면에 보이는 부분의 높이 계산
            const visibleTop = Math.max(viewTop, rect.top);
            const visibleBottom = Math.min(viewBottom, rect.bottom);
            const visibleHeight = Math.max(0, visibleBottom - visibleTop);

            if (visibleHeight > maxVisibleHeight) {
                maxVisibleHeight = visibleHeight;
                mostVisible = section.id;
            }
        });

        if (mostVisible) {
            let target = mostVisible;
            if (target === 'hero') target = 'home';
            
            // 현재 active 상태인 메뉴 확인 (불필요한 DOM 업데이트 방지)
            const currentActive = document.querySelector('.nav-item.active');
            if (!currentActive || currentActive.getAttribute('data-target') !== target) {
                navItems.forEach(item => {
                    item.classList.remove('active');
                    item.classList.remove('clicked');
                });

                const activeItem = document.querySelector(`.nav-item[data-target="${target}"]`);
                if (activeItem) {
                    activeItem.classList.add('active');
                    updateIndicator(activeItem);
                }
            }
        }
        scrollSpyTicking = false;
    }

    window.addEventListener('scroll', () => {
        if (!scrollSpyTicking) {
            window.requestAnimationFrame(updateNavOnScroll);
            scrollSpyTicking = true;
        }
    });

    // 클릭 이벤트: 클릭한 대상에 즉시 인디케이터 이동 후 스크롤
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            isAutoScrolling = true;

            // 모든 아이템 상태 초기화 후 클릭 요소 즉시 활성화
            navItems.forEach(n => {
                n.classList.remove('active');
                n.classList.remove('clicked');
            });
            item.classList.add('active');
            item.classList.add('clicked');
            
            // 자동 스크롤 중 중간 섹션을 거쳐도 인디케이터는 여기 고정됨
            updateIndicator(item);

            // 클릭한 메뉴의 target 섹션으로 부드럽게 스크롤
            const target = item.getAttribute('data-target');
            let targetSection;
            if (target === 'home') {
                targetSection = document.getElementById('hero');
            } else {
                targetSection = document.getElementById(target);
            }
            
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                // 스크롤 종료 감지 로직
                const detectScrollEnd = () => {
                    clearTimeout(autoScrollTimeout);
                    autoScrollTimeout = setTimeout(() => {
                        isAutoScrolling = false;
                        window.removeEventListener('scroll', detectScrollEnd);
                    }, 150); // 스크롤 이벤트가 150ms 멈추면 스크롤 끝난 것으로 간주
                };
                window.addEventListener('scroll', detectScrollEnd);
            } else {
                // 타겟을 못 찾은 경우 즉시 해제
                isAutoScrolling = false;
            }
        });
    });

    
    // 윈도우 크기 조절 시 인디케이터 위치 및 크기 재조정
    window.addEventListener('resize', () => {
        const currentActive = document.querySelector('.nav-item.active');
        if (currentActive) {
            updateIndicator(currentActive);
        }
    });

    // 초기 활성화 상태 지정
    setTimeout(() => {
        if (window.location.hash) {
            let initialTarget = window.location.hash.substring(1);
            let initialActive = document.querySelector(`.nav-item[data-target="${initialTarget}"]`);
            if (initialActive) {
                initialActive.classList.add('active');
                updateIndicator(initialActive);
            }
        }
        
        // 현재 스크롤 위치 기준으로 네비게이션 상태 동기화
        updateNavOnScroll();
    }, 150);
});

