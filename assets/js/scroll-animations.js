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
            
            // 자동 스크롤(클릭으로 인한 이동) 중일 때는 중간 섹션 활성화를 무시함
            if (isAutoScrolling) return;

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
    }, navObserverOptions);

    sections.forEach(section => {
        navObserver.observe(section);
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

    // 초기 활성화 상태 지정 (URL 해시가 있거나 기본으로 첫번째 항목)
    setTimeout(() => {
        let initialTarget = window.location.hash ? window.location.hash.substring(1) : 'home';
        let initialActive = document.querySelector(`.nav-item[data-target="${initialTarget}"]`);
        
        if (!initialActive) {
            initialActive = document.querySelector('.nav-item'); // fallback
        }
        
        if (initialActive) {
            initialActive.classList.add('clicked');
            initialActive.classList.add('active');
            updateIndicator(initialActive);
        }
    }, 150);
});
