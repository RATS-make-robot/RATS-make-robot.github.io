// YAML 파싱 라이브러리 사용 (js-yaml)
document.addEventListener('DOMContentLoaded', () => {
    fetch('assets/data/experiences.yaml')
        .then(response => response.text())
        .then(yamlText => {
            const experiencesData = jsyaml.load(yamlText); // YAML 파싱
            const experienceContainer = document.querySelector('.experience-container');
            
            if (experiencesData.experiences) {
                experiencesData.experiences.forEach(experienceGroup => {
                    experienceGroup.positions.forEach(position => {
                        const experienceCard = document.createElement('div');
                        experienceCard.className = 'experience-card';

                        const year = document.createElement('h3');
                        year.textContent = position.designation;

                        const awardList = document.createElement('ul');
                        position.responsibilities.forEach(responsibility => {
                            const listItem = document.createElement('li');

                            // 수상 내역 중 강조 부분만 <code>로 감싸기
                            const match = responsibility.match(/(.*? - )(.*?)(🏆|🥇|🥈|🥉|🎖️|✨)(.*)/);
                            if (match) {
                                const textPart1 = document.createTextNode(match[1]);
                                const emoji = document.createElement('span');
                                emoji.textContent = match[3];
                                emoji.className = 'emoji-sparkle'; // 반짝임 효과 클래스
                                const textPart2 = document.createTextNode(match[2] + match[4]);

                                listItem.appendChild(textPart1);
                                listItem.appendChild(emoji);
                                listItem.appendChild(textPart2);
                            } else {
                                listItem.textContent = responsibility; // 매칭 실패 시 전체 텍스트 출력
                            }

                            awardList.appendChild(listItem);
                        });

                        experienceCard.appendChild(year);
                        experienceCard.appendChild(awardList);
                        experienceContainer.appendChild(experienceCard);
                    });
                });
            }
        })
        .catch(error => console.error('Error loading YAML:', error));
});
