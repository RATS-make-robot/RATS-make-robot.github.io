document.addEventListener('DOMContentLoaded', () => {
    fetch('assets/data/experiences.yaml')
        .then(response => response.text())
        .then(yamlText => {
            const experiencesData = jsyaml.load(yamlText); // YAML 파싱
            const experienceContainer = document.querySelector('.experience-container');

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

                            // 수상 내역에서 이모티콘과 텍스트 분리 및 처리
                            const match = award.match(/(.*? - )(.*?)([🏆🥇🥈🥉🎖️✨])(.*)/);
                            if (match) {
                                const textPart1 = document.createTextNode(match[1]);
                                const emojiContainer = document.createElement('span');
                                const emoji = document.createElement('span');
                                emoji.textContent = match[3];
                                emoji.className = 'emoji-sparkle'; // 반짝임 효과 클래스
                                emojiContainer.appendChild(emoji);
                                const textPart2 = document.createTextNode(match[2] + match[4]);

                                listItem.appendChild(textPart1);
                                listItem.appendChild(emojiContainer);
                                listItem.appendChild(textPart2);
                            } else {
                                // 매칭 실패 시 전체 텍스트를 표시
                                listItem.textContent = award;
                            }

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
