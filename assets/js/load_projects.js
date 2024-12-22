// YAML 파싱 라이브러리 사용 (js-yaml)
document.addEventListener('DOMContentLoaded', () => {
    const loadYamlData = () => {
        return fetch('assets/data/projects.yaml')
            .then(response => response.text())
            .then(yamlText => jsyaml.load(yamlText)) // YAML 파싱
            .catch(error => {
                console.error('Error loading YAML:', error);
                return null;
            });
    };

    const renderProjects = (projectsData) => {
        const projectContainer = document.querySelector('.project-container');
        if (!projectContainer) {
            console.error('Project container not found.');
            return;
        }

        // Clear existing projects
        projectContainer.innerHTML = '';

        // Generate project cards
        projectsData.projects.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            projectCard.setAttribute('data-year', project.year);

            projectCard.innerHTML = `
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <p><strong>[팀원]</strong> ${project.team}</p>
                ${project.link ? `<a href="${project.link}" target="_blank">
                    <img src="${project.link.includes('youtube.com') 
                        ? 'assets/images/icons/youtubelogo.svg' 
                        : 'assets/images/icons/githublogo.svg'}" 
                        alt="Link" style="width:24px;height:24px;">
                </a>` : ''}
            `;

            projectContainer.appendChild(projectCard);
        });

        // Trigger filter initialization
        initializeFilters(); // Call filter initialization after rendering
    };

    loadYamlData().then(projectsData => {
        if (projectsData) {
            renderProjects(projectsData);
        }
    });
});
