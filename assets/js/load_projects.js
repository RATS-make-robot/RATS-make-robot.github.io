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

                    const linksContainer = document.createElement('div');
                    linksContainer.className = 'links-container';

                    if (project.links) {
                        if (project.links.youtube) {
                            const youtubeLink = document.createElement('a');
                            youtubeLink.href = project.links.youtube;
                            youtubeLink.target = '_blank';
                            youtubeLink.innerHTML = `<img src="assets/images/icons/youtubelogo.svg" alt="YouTube Link" style="width: 50px; height: auto;">`;
                            linksContainer.appendChild(youtubeLink);
                        }

                        if (project.links.github) {
                            const githubLink = document.createElement('a');
                            githubLink.href = project.links.github;
                            githubLink.target = '_blank';
                            githubLink.innerHTML = `<img src="assets/images/icons/githublogo.svg" alt="GitHub Link" style="width: 50px; height: auto;">`;
                            linksContainer.appendChild(githubLink);
                        }

                        if (project.links.other) {
                            const otherLink = document.createElement('a');
                            otherLink.href = project.links.other;
                            otherLink.target = '_blank';
                            otherLink.innerHTML = `<img src="assets/images/icons/linklogo.svg" alt="Other Link" style="width: 50px; height: auto;">`;
                            linksContainer.appendChild(otherLink);
                        }
                    }

                    // Append elements to project card
                    projectCard.appendChild(title);
                    projectCard.appendChild(description);
                    projectCard.appendChild(team);
                    projectCard.appendChild(linksContainer);

                    projectContainer.appendChild(projectCard);
                });
            }
        })
        .catch(error => console.error('Error loading YAML:', error));
});
