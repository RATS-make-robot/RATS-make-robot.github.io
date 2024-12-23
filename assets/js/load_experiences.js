document.addEventListener('DOMContentLoaded', () => {
    fetch('assets/data/experiences.yaml')
        .then(response => response.text())
        .then(yamlText => {
            const experiencesData = jsyaml.load(yamlText); // YAML 파싱
            const experienceContainer = document.querySelector('.experience-container');

            // 상별 이모티콘 매핑
            const awardIcons = {
                "대상": "🏆",
                "최우수상": "🏆",
                "금상": "🥇",
                "은상": "🥈",
                "동상": "🥉",
                "입선": "✨",
                "장려상": "✨",
                "포스터상": "📜"
            };

            if (experiencesData.experiences) {
                experiencesData.experiences.forEach(experience => {
                    const experienceCard = document.createElement('div');
                    experienceCard.className = 'experience-card';

                    // 연도 추가
                    const year = document.createElement('h3');
                    year.textContent = experience.year;
                    experienceCard.appendChild(year);

                    // 대회 및 수상 내역 처리
                    if (experience.competitions) {
                        experience.competitions.forEach(comp => {
                            const compTitle = document.createElement('h4');
                            compTitle.textContent = comp.name;
                            experienceCard.appendChild(compTitle);

                            const awardList = document.createElement('p');
                            let awardText = '';

                            comp.awards.forEach(award => {
                                const icon = awardIcons[award.type] || "✨"; // 기본 이모티콘 설정

                                if (award.count && award.count > 1) {
                                    awardText += `<code>${icon}${award.type}(${award.count})</code> `;
                                } else {
                                    awardText += `<code>${icon}${award.type}</code> `;
                                }
                            });

                            awardList.innerHTML = awardText.trim();
                            experienceCard.appendChild(awardList);
                        });
                    }

                    experienceContainer.appendChild(experienceCard);
                });
            } else {
                console.error('No experiences found in YAML data.');
            }
        })
        .catch(error => console.error('Error loading YAML:', error));
});
