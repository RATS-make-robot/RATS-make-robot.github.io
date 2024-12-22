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

                    // Create HTML elements for project card
                    const title = document.createElement('h3');
                    title.textContent = project.title;

                    const description = document.createElement('p');
                    description.textContent = project.description;

                    const team = document.createElement('p');
                    team.innerHTML = `<strong>[팀원]</strong> ${project.team}`;

                    const linkWrapper = document.createElement('a');
                    if (project.link) {
                        linkWrapper.href = project.link;
                        linkWrapper.target = '_blank';

                        const linkIcon = document.createElement('img');
                        linkIcon.src = project.link.includes('youtube.com')
                            ? 'assets/images/icons/youtubelogo.svg'
                            : 'assets/images/icons/githublogo.svg';
                        linkIcon.alt = project.link.includes('youtube.com') ? 'YouTube Link' : 'GitHub Link';
                        linkIcon.style.width = '50px';
                        linkIcon.style.height = '24px';

                        linkWrapper.appendChild(linkIcon);
                    }

                    // Append elements to project card
                    projectCard.appendChild(title);
                    projectCard.appendChild(description);
                    projectCard.appendChild(team);
                    if (project.link) {
                        projectCard.appendChild(linkWrapper);
                    }

                    projectContainer.appendChild(projectCard);
                });
            }
        })
        .catch(error => console.error('Error loading YAML:', error));
});
