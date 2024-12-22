// YAML 파싱 라이브러리 사용 (js-yaml)
document.addEventListener('DOMContentLoaded', () => {
    fetch('assets/data/projects.yaml')
        .then(response => response.text())
        .then(yamlText => {
            const projectsData = jsyaml.load(yamlText); // YAML 파싱
            const projectContainer = document.querySelector('.project-container');

            if (projectsData.projects) {
                projectsData.projects.forEach(project => {
                    const projectCard = document.createElement('div');
                    projectCard.className = 'project-card';
                    projectCard.setAttribute('data-year', project.year);

                    // Determine link type and corresponding icon
                    let linkIcon = '';
                    if (project.link.includes('youtube.com')) {
                        linkIcon = '</assets/images/icons/youtubelogo.svg" alt="YouTube Link" style="width:24px;height:24px;">';
                    } else if (project.link.includes('github.com')) {
                        linkIcon = '/assets/images/icons/githublogo.svg" alt="GitHub Link" style="width:24px;height:24px;">';
                    }

                    projectCard.innerHTML = `
                        <h3>${project.title}</h3>
                        <p>${project.description}</p>
                        <p><strong>[팀원]</strong> ${project.team}</p>
                        <a href="${project.link}" target="_blank">${linkIcon}</a>
                    `;

                    projectContainer.appendChild(projectCard);
                });
            }
        })
        .catch(error => console.error('Error loading YAML:', error));
});
