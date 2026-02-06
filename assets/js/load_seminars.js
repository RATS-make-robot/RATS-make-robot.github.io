// load_seminars.js
window.loadSeminars = function () {
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

                if (seminarsData.seminars) {
                    seminarContainer.innerHTML = ''; // 초기화
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
                                <img src="assets/images/logos/githublogo.svg" alt="GitHub Link" class="link-icon">
                            </a>` : ''}
                        `;

                        seminarContainer.appendChild(seminarCard);
                    });
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
};
