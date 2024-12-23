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
                    const awardList = document.createElement('ul');
                    if (experience.awards) {
                        experience.awards.forEach(award => {
                            const listItem = document.createElement('li');

                            // 상 종류에 따라 이모티콘 추가
                            const match = award.match(/(.*?)(\((.*?)\))?/); // 상 이름과 개수 추출
                            const awardName = match[1].trim();
                            const awardCount = match[3] ? `(${match[3]})` : ""; // 개수가 있으면 추가
                            const icon = awardIcons[awardName] || "✨"; // 매칭되는 이모티콘 없으면 기본값
                            icon.classname = 'emoji-sparkle';

                            listItem.innerHTML = `${icon} ${awardName} ${awardCount}`; // 이모티콘과 텍스트 추가
                            awardList.appendChild(listItem);
                        });
                    }

                    experienceCard.appendChild(year);
                    experienceCard.appendChild(awardList);
                    experienceContainer.appendChild(experienceCard);
                });
            } else {
                console.error('No experiences found in YAML data.');
            }
        })
        .catch(error => console.error('Error loading YAML:', error));
});
