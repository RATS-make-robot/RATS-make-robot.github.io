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

                    // Create HTML elements for project card
                    const title = document.createElement('h3');
                    title.textContent = project.title;

                    // 이미지 추가 (제목 바로 아래)
                    if (project.image) {
                        const projectImage = document.createElement('img');
                        projectImage.src = project.image;
                        projectImage.alt = `${project.title} 이미지`;
                        projectImage.className = 'project-image'; // CSS 스타일링을 위한 클래스
                        projectCard.appendChild(title);
                        projectCard.appendChild(projectImage);
                    } else {
                        projectCard.appendChild(title);
                    }

                    const description = document.createElement('p');
                    description.textContent = project.description;

                    const team = document.createElement('p');
                    team.innerHTML = `<strong>[팀원]</strong> ${project.team}`;

                    const duration = document.createElement('p');
                    duration.innerHTML = `<strong>[기간]</strong> ${project.duration}`;

                    const tags = document.createElement('p');
                    tags.innerHTML = `<strong>[태그]</strong> ${project.tags.join(', ')}`;

                    const linksContainer = document.createElement('div');
                    linksContainer.className = 'links-container';

                    if (project.links) {
                        // Other Link
                        if (project.links.other) {
                            const otherLink = document.createElement('a');
                            otherLink.href = project.links.other;
                            otherLink.target = '_blank';
                            otherLink.textContent = "기타 링크";
                            otherLink.className = 'project-btn';
                            linksContainer.appendChild(otherLink);
                        }

                        // YouTube Link
                        if (project.links.youtube) {
                            const youtubeLink = document.createElement('a');
                            youtubeLink.href = project.links.youtube;
                            youtubeLink.className = 'link-icon';
                            youtubeLink.target = '_blank';
                            youtubeLink.innerHTML = `<img src="assets/images/icons/youtubelogo.svg" alt="YouTube Link" style="width: 50px; height: auto;">`;
                            linksContainer.appendChild(youtubeLink);
                        }

                        // GitHub Link
                        if (project.links.github) {
                            const githubLink = document.createElement('a');
                            githubLink.href = project.links.github;
                            githubLink.className = 'link-icon';
                            githubLink.target = '_blank';
                            githubLink.innerHTML = `<img src="assets/images/icons/githublogo.svg" alt="GitHub Link" style="width: 50px; height: auto;">`;
                            linksContainer.appendChild(githubLink);
                        }
                    }

                    // Append elements to project card
                    projectCard.appendChild(description);
                    projectCard.appendChild(team);
                    projectCard.appendChild(duration);
                    projectCard.appendChild(tags);
                    projectCard.appendChild(linksContainer);

                    projectContainer.appendChild(projectCard);
                });
            }
        })
        .catch(error => console.error('Error loading YAML:', error));
});
