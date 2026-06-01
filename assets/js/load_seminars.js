// load_seminars.js
document.addEventListener('DOMContentLoaded', () => {
    const fetchSeminars = (retryCount = 3) => {
        fetch('assets/data/seminars.yaml')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(yamlText => {
                const seminarsData = jsyaml.load(yamlText);
                const seminarContainer = document.querySelector('.seminar-container');

                if (!seminarContainer) return;

                seminarContainer.innerHTML = '';

                if (seminarsData.seminars) {
                    // 상세 페이지 모드
                    if (window.isSeminarDetailPage) {
                        seminarsData.seminars.forEach(seminar => {
                            const seminarCard = document.createElement('div');
                            seminarCard.className = 'seminar-card';

                            seminarCard.innerHTML = `
                                ${seminar.image ? `<div class="card-bg-image" style="background-image: url('${seminar.image}')"></div>` : ''}
                                <div class="card-content">
                                    <h3>${seminar.title}</h3>
                                    <div class="seminar-card-info">
                                        <p>${seminar.description}</p>
                                        <p class="seminar-meta"><strong>강의자:</strong> ${seminar.organizer} <br> <strong>기간:</strong> ${seminar.period}</p>
                                        <div class="links-container" style="justify-content: center; margin-top: 1rem;">
                                            ${seminar.link ? `<a href="${seminar.link}" target="_blank" class="link-icon">
                                                <i class="ph-fill ph-github-logo"></i>
                                            </a>` : ''}
                                        </div>
                                    </div>
                                </div>
                            `;

                            seminarContainer.appendChild(seminarCard);
                        });
                    } 
                    // 메인 화면 모드 (그리드)
                    else {
                        // 넉넉하게 최신 12개 렌더링 후 동적 숨김 처리
                        const maxRender = seminarsData.seminars.slice(0, 12);
                        const cards = [];

                        maxRender.forEach((seminar, index) => {
                            const seminarCard = document.createElement('div');
                            const delayClass = `reveal-delay-${(index % 3) + 1}`; 
                            seminarCard.className = `seminar-card cards reveal-up ${delayClass}`;
                            seminarCard.style.display = 'none'; // 초기에는 모두 숨김
                            
                            seminarCard.innerHTML = `
                                ${seminar.image ? `<div class="card-bg-image" style="background-image: url('${seminar.image}')"></div>` : ''}
                                <div class="card-content">
                                    <h3>${seminar.title}</h3>
                                    <div class="seminar-card-info">
                                        <p>${seminar.description}</p>
                                        <p class="seminar-meta"><strong>강의자:</strong> ${seminar.organizer} <br> <strong>기간:</strong> ${seminar.period}</p>
                                        <div class="links-container" style="justify-content: center; margin-top: 1rem;">
                                            ${seminar.link ? `<a href="${seminar.link}" target="_blank" class="link-icon">
                                                <i class="ph-fill ph-github-logo"></i>
                                            </a>` : ''}
                                        </div>
                                    </div>
                                </div>
                            `;

                            seminarContainer.appendChild(seminarCard);
                            cards.push(seminarCard);
                        });

                        const updateVisibleCards = () => {
                            if (!seminarContainer || cards.length === 0) return;
                            
                            const gridComputed = window.getComputedStyle(seminarContainer);
                            const columnsStr = gridComputed.getPropertyValue('grid-template-columns');
                            
                            let colCount = 1;
                            if (columnsStr && columnsStr !== 'none') {
                                colCount = columnsStr.split(' ').length;
                            }
                            
                            // 무조건 2줄 (n x 2)을 유지하되, 창이 좁아 카드가 너무 적게 보일 경우를 대비해 최소 6개 보장
                            const targetCount = Math.max(6, colCount * 2);
                            
                            cards.forEach((card, index) => {
                                if (index < targetCount) {
                                    if (card.style.display === 'none') {
                                        card.style.display = 'flex';
                                        setTimeout(() => card.classList.add('visible'), 100 * (index + 1));
                                    }
                                } else {
                                    card.style.display = 'none';
                                    card.classList.remove('visible');
                                }
                            });
                        };

                        // 브라우저 렌더링(레이아웃 계산)이 끝난 직후 컬럼 수 파악을 위해 약간 지연
                        setTimeout(updateVisibleCards, 50);

                        window.addEventListener('resize', () => {
                            clearTimeout(window.seminarResizeTimer);
                            window.seminarResizeTimer = setTimeout(updateVisibleCards, 150);
                        });
                    }
                }
            })
            .catch(error => {
                console.error('Error loading YAML:', error);
                if (retryCount > 0) {
                    setTimeout(() => fetchSeminars(retryCount - 1), 1000);
                } else {
                    const seminarContainer = document.querySelector('.seminar-container');
                    if (seminarContainer) {
                        seminarContainer.innerHTML = '<p>Error loading seminars. Please try again later.</p>';
                    }
                }
            });
    };

    fetchSeminars();
});
