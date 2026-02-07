// load_experiences.js
window.loadExperiences = function () {
    const MAX_RETRIES = 3;
    let retryCount = 0;

    const load = () => {
        fetch('assets/data/experiences.yaml')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.text();
            })
            .then(yamlText => {
                const experiencesData = jsyaml.load(yamlText); // YAML 파싱
                const experienceContainer = document.querySelector('.experience-container');

                if (!experienceContainer) {
                    throw new Error('Container element .experience-container is missing.');
                }

                // Clear existing content if container exists
                if (experienceContainer) {
                    experienceContainer.innerHTML = '';
                }

                // 상별 이모티콘 매핑
                const awardIcons = {
                    "대상": "🏆",
                    "최우수상": "🏆",
                    "우수상": "🏅",
                    "금상": "🥇",
                    "은상": "🥈",
                    "동상": "🥉",
                    "입선": "✨",
                    "장려상": "✨",
                    "포스터상": "📜"
                };

                // 카운트 변수 초기화
                let schoolCount = 0;
                let externalCount = 0;

                if (experiencesData.experiences) {
                    experiencesData.experiences.forEach(experience => {
                        let experienceCard = null;
                        if (experienceContainer) {
                            experienceCard = document.createElement('div');
                            experienceCard.className = 'experience-card';

                            // 연도 추가
                            const year = document.createElement('h3');
                            year.textContent = experience.year;
                            experienceCard.appendChild(year);
                        }

                        // 대회 및 수상 내역 처리
                        if (experience.competitions) {
                            experience.competitions.forEach(comp => {
                                let competitionRow = null;
                                let awardList = null;

                                if (experienceCard) {
                                    competitionRow = document.createElement('div');
                                    competitionRow.className = 'competition-row';

                                    // 대회명 추가
                                    const compTitle = document.createElement('span');
                                    compTitle.className = 'competition-title';
                                    compTitle.textContent = comp.name;
                                    competitionRow.appendChild(compTitle);

                                    // 수상 내역 추가
                                    awardList = document.createElement('span');
                                    awardList.className = 'award-list';
                                }

                                let awardText = '';

                                comp.awards.forEach(award => {
                                    const icon = awardIcons[award.type] || "✨";
                                    const count = award.count || 1;

                                    // 수상 횟수 카운팅 (교내 vs 교외)
                                    // "교내", "명지대", "학과", "공학입문설계", "SEP" 키워드가 포함되면 교내로 분류
                                    const isSchool = /교내|명지대|학과|공학입문설계|SEP/.test(comp.name);

                                    if (isSchool) {
                                        schoolCount += count;
                                    } else {
                                        externalCount += count;
                                    }

                                    if (awardList) {
                                        if (count > 1) {
                                            awardText += `<code>${icon}${award.type}(${count})</code> `;
                                        } else {
                                            awardText += `<code>${icon}${award.type}</code> `;
                                        }
                                    }
                                });

                                if (awardList && competitionRow) {
                                    awardList.innerHTML = awardText.trim();
                                    competitionRow.appendChild(awardList);
                                    experienceCard.appendChild(competitionRow);
                                }
                            });
                        }

                        if (experienceContainer && experienceCard) {
                            experienceContainer.appendChild(experienceCard);
                        }
                    });

                    // 카운터 업데이트 (모든 인스턴스 업데이트를 위해 querySelectorAll 사용)
                    const schoolCounterEls = document.querySelectorAll('.school-counter');
                    const externalCounterEls = document.querySelectorAll('.external-counter');

                    schoolCounterEls.forEach(el => el.setAttribute('data-target', schoolCount));
                    externalCounterEls.forEach(el => el.setAttribute('data-target', externalCount));

                    // IntersectionObserver로 스크롤 시 애니메이션 트리거
                    const counterContainers = document.querySelectorAll('.counter-animate-trigger');
                    if (counterContainers.length > 0) {
                        const observer = new IntersectionObserver((entries) => {
                            entries.forEach(entry => {
                                if (entry.isIntersecting) {
                                    // 해당 컨테이너 내부의 카운터들만 애니메이션 실행
                                    animateCounters(entry.target);
                                } else {
                                    // 화면에서 벗어나면 초기화
                                    const counters = entry.target.querySelectorAll('.counter-number');
                                    counters.forEach(counter => {
                                        counter.innerText = '0';
                                        counter.removeAttribute('data-animating');
                                    });
                                }
                            });
                        }, { threshold: 0.1 });

                        counterContainers.forEach(container => observer.observe(container));
                    }

                } else {
                    console.error('No experiences found in YAML data.');
                }
            })
            .catch(error => {
                console.error(`Error loading YAML (Attempt ${retryCount + 1}):`, error);
                if (retryCount < MAX_RETRIES) {
                    retryCount++;
                    setTimeout(load, 2000); // 재시도
                } else {
                    if (experienceContainer) {
                        experienceContainer.innerHTML = '<p>Error loading experiences. Please try again later.</p>';
                    }
                }
            });
    };

    // 숫자 카운트 애니메이션 함수
    function animateCounters(container) {
        const counters = container.querySelectorAll('.counter-number');
        const speed = 200; // 숫자가 클수록 느림 (프레임 수)

        counters.forEach(counter => {
            // 이미 애니메이션 중이면 중복 실행 방지
            if (counter.getAttribute('data-animating')) return;

            counter.setAttribute('data-animating', 'true');

            const updateCount = () => {
                // 플래그가 없으면(화면 밖으로 나감) 중지
                if (!counter.getAttribute('data-animating')) return;

                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText;

                // 증가량 계산
                const inc = target / speed;

                if (count < target) {
                    counter.innerText = Math.ceil(count + inc);
                    setTimeout(updateCount, 20);
                } else {
                    counter.innerText = target;
                    // 애니메이션 완료 후에도 플래그 유지 (중복 실행 방지)
                }
            };

            updateCount();
        });
    }

    load();
};
