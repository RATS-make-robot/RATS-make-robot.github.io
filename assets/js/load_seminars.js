// YAML 파싱 라이브러리 사용 (js-yaml)
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
                const seminarsData = jsyaml.load(yamlText); // YAML 파싱
                const seminarContainer = document.querySelector('.seminar-container');

                if (seminarsData.seminars) {
                    seminarsData.seminars.forEach(seminar => {
                        const seminarCard = document.createElement('div');
                        seminarCard.className = 'seminar-card';

                        seminarCard.innerHTML = `
                            <h3>${seminar.title}</h3>
                            <img src="${seminar.image}" alt="image" class="seminar-card-image">
                            <p>${seminar.description}</p>
                            <p><strong>강의자:</strong> ${seminar.organizer}</p>
                            <p><strong>기간:</strong> ${seminar.period}</p>
                            ${seminar.link ? `<a href="${seminar.link}" target="_blank">
                                <img src="/assets/images/icons/githublogo.svg" alt="GitHub Link" style="width:50px;height:auto;">
                            </a>` : ''}
                        `;

                        seminarContainer.appendChild(seminarCard);
                    });
                }
            })
            .catch(error => {
                console.error('Error loading YAML:', error);
                if (retryCount > 0) {
                    console.log(`Retrying... (${3 - retryCount + 1})`);
                    setTimeout(() => fetchSeminars(retryCount - 1), 1000); // 1초 후 재시도
                } else {
                    const seminarContainer = document.querySelector('.seminar-container');
                    seminarContainer.innerHTML = '<p>Error loading seminars. Please try again later.</p>';
                }
            });
    };

    fetchSeminars();
});
