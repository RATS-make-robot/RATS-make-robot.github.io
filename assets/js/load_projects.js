document.addEventListener('DOMContentLoaded', () => {
    const fetchProjects = (attempt = 1) => {
        fetch('assets/data/projects.yaml')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.text();
            })
            .then(yamlText => {
                const projectsData = jsyaml.load(yamlText); // YAML 파싱
                const projectScrollContainer = document.querySelector('.project-scroll-container');
                
                if (!projectScrollContainer) {
                    throw new Error('Container element .project-scroll-container is missing.');
                }

                // Clear existing content to prevent duplication during retries
                projectScrollContainer.innerHTML = '';

                const projectContainer = document.createElement('div');
                projectContainer.className = 'project-container';

                if (projectsData.projects) {
                    projectsData.projects.forEach(projectGroup => {
                        const projectGroupContainer = document.createElement('div');
                        projectGroupContainer.className = 'project-group';

                        projectGroup.projects.forEach(project => {
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
                                projectImage.className = 'project-image';
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

                                    // `other_logo`가 존재하면 이미지 추가, 없으면 버튼 표시
                                    if (project.links.other_logo) {
                                        const logo = document.createElement('img');
                                        logo.src = project.links.other_logo;
                                        logo.alt = "Other Link Logo";
                                        logo.className = 'link-icon';
                                        otherLink.appendChild(logo);
                                    } else {
                                        otherLink.textContent = "기타 링크";
                                        otherLink.style.display = "inline-block";
                                        otherLink.style.padding = "10px 15px";
                                        otherLink.style.backgroundColor = "#007bff";
                                        otherLink.style.color = "#fff";
                                        otherLink.style.borderRadius = "5px";
                                        otherLink.style.textAlign = "center";
                                        otherLink.style.fontWeight = "bold";
                                        otherLink.style.textDecoration = "none"; // 밑줄 제거
                                    }

                                    otherLink.addEventListener('mouseover', () => {
                                        otherLink.style.backgroundColor = "#0056b3"; // 버튼 hover 효과
                                    });
                                    otherLink.addEventListener('mouseout', () => {
                                        otherLink.style.backgroundColor = "#007bff"; // 기본 색상 복원
                                    });

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

                            projectGroupContainer.appendChild(projectCard);
                        });

                        projectContainer.appendChild(projectGroupContainer);
                    });

                    projectScrollContainer.appendChild(projectContainer);
                }
            })
            .catch(error => {
                console.error(`Error loading YAML (Attempt ${attempt}):`, error);

                if (attempt < 3) {
                    console.log('Retrying fetch...');
                    setTimeout(() => fetchProjects(attempt + 1), 2000); // 재시도
                } else {
                    const projectScrollContainer = document.querySelector('.project-scroll-container');
                    if (projectScrollContainer) {
                        projectScrollContainer.innerHTML = '<p>프로젝트 데이터를 불러오지 못했습니다. 나중에 다시 시도해주세요.</p>';
                    }
                }
            });
    };

    fetchProjects();
});
