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

                    // 수상 내역 목록 생성
                    const competitionList = document.createElement('div');
                    competitionList.className = 'competition-list';

                    experience.competition.forEach(comp => {
                        const compTitle = document.createElement('h4');
                        compTitle.textContent = comp.title;

                        const awardList = document.createElement('ul');
                        comp.awards.forEach(award => {
                            const listItem = document.createElement('li');

                            // 상 종류에 따라 이모티콘 추가
                            const icon = awardIcons[award.type] || "✨";
                            icon.classname = 'emoji-sparkle';

                            listItem.innerHTML = `${icon} ${award.type} (${award.count || 1})`; // 이모티콘과 텍스트 추가
                            awardList.appendChild(listItem);
                        });

                        competitionList.appendChild(compTitle);
                        competitionList.appendChild(awardList);
                    });

                    experienceCard.appendChild(year);
                    experienceCard.appendChild(competitionList);
                    experienceContainer.appendChild(experienceCard);
                });
            } else {
                console.error('No experiences found in YAML data.');
            }
        })
        .catch(error => console.error('Error loading YAML:', error));
});
