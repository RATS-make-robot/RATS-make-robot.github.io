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
                        // 최근 6개만
                        const recentSeminars = seminarsData.seminars.slice(0, 6);

                        recentSeminars.forEach((seminar, index) => {
                            const seminarCard = document.createElement('div');
                            const delayClass = `reveal-delay-${(index % 3) + 1}`; 
                            seminarCard.className = `seminar-card cards reveal-up ${delayClass}`;
                            
                            setTimeout(() => {
                                seminarCard.classList.add('visible');
                            }, 100 * (index + 1));

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
