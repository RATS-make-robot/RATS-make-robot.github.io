// YAML 파싱 라이브러리 사용 (js-yaml)
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

                    const year = document.createElement('h3');
                    year.textContent = experience.year;

                    const awardList = document.createElement('ul');
                    experience.awards.forEach(award => {
                        const listItem = document.createElement('li');
                        const codeElement = document.createElement('code');
                        codeElement.textContent = award; // 수상 내역을 <code> 태그로 감싸기
                        listItem.appendChild(codeElement);
                        awardList.appendChild(listItem);
                    });

                    experienceCard.appendChild(year);
                    experienceCard.appendChild(awardList);
                    experienceContainer.appendChild(experienceCard);
                });
            }
        })
        .catch(error => console.error('Error loading YAML:', error));
});
