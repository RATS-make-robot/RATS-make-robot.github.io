document.addEventListener('DOMContentLoaded', () => {
    const fetchProjects = (attempt = 1) => {
        fetch('assets/data/projects.yaml')
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.text();
            })
            .then(yamlText => {
                const projectsData = jsyaml.load(yamlText);
                const container = document.querySelector('.project-scroll-container');
                let paginationContainer = document.querySelector('.project-pagination');
                if (!container) return;

                container.innerHTML = ''; // 기존 내용 비우기
                
                if (!window.isProjectDetailPage) {
                    if (!paginationContainer) {
                        paginationContainer = document.createElement("div");
                        paginationContainer.className = "project-pagination";
                        paginationContainer.style.display = "flex";
                        paginationContainer.style.justifyContent = "center";
                        paginationContainer.style.gap = "0.8rem";
                        paginationContainer.style.marginTop = "0.5rem";
                        container.parentNode.insertBefore(paginationContainer, container.nextSibling);
                    } else {
                        paginationContainer.innerHTML = "";
                    }
                }

                let allProjects = [];
                if (projectsData.projects) {
                    projectsData.projects.forEach(group => {
                        if(group.projects) {
                            allProjects = allProjects.concat(group.projects);
                        }
                    });
                }

                // 상세 페이지면 전부 표시, 메인 페이지면 최근 6개만 표시
                const displayProjects = window.isProjectDetailPage ? allProjects : allProjects.slice(0, 6);
                const cards = [];
                const dots = [];

                displayProjects.forEach((project, index) => {
                    const projectCard = document.createElement('div');
                    // 애니메이션 효과를 위해 reveal-up 클래스와 딜레이 부여
                    const delayClass = `reveal-delay-${(index % 3) + 1}`; 
                    projectCard.className = `project-card cards reveal-up ${delayClass}`;
                    if (!window.isProjectDetailPage) {
                        projectCard.style.flex = "0 0 auto";
                        projectCard.style.width = "350px";
                        projectCard.style.scrollSnapAlign = "start";
                    }
                    
                    // (Observer가 나중에 로드된 요소도 감지할 수 있도록, 이미 observer가 있다면 추가)
                    // observer 스크립트가 로드된 상태이므로, 잠시 후 visible 클래스가 붙도록 수동 처리하거나 observer 재호출이 필요함.
                    // 간단히 setTimeout으로 등장 처리
                    setTimeout(() => {
                        projectCard.classList.add('visible');
                    }, 100 * (index + 1));

                    const title = document.createElement('h3');
                    title.textContent = project.title;
                    projectCard.appendChild(title);

                    if (project.image) {
                        const img = document.createElement('img');
                        img.src = project.image;
                        img.alt = `${project.title} 이미지`;
                        img.className = 'project-image';
                        projectCard.appendChild(img);
                    }

                    const desc = document.createElement('p');
                    desc.textContent = project.description;
                    projectCard.appendChild(desc);

                    const duration = document.createElement('p');
                    duration.innerHTML = `<strong>[기간]</strong> ${project.duration}`;
                    projectCard.appendChild(duration);

                    const linksContainer = document.createElement('div');
                    linksContainer.className = 'links-container';
                    linksContainer.style.display = 'flex';
                    linksContainer.style.gap = '0.8rem';

                    if (project.links) {
                        if (project.links.github) {
                            const githubLink = document.createElement('a');
                            githubLink.href = project.links.github;
                            githubLink.target = '_blank';
                            githubLink.className = 'link-icon';
                            githubLink.style.color = '#fff';
                            githubLink.style.fontSize = '1.5rem';
                            githubLink.style.transition = 'color 0.3s';
                            githubLink.innerHTML = `<i class="ph-fill ph-github-logo"></i>`;
                            linksContainer.appendChild(githubLink);
                        }
                        if (project.links.youtube) {
                            const youtubeLink = document.createElement('a');
                            youtubeLink.href = project.links.youtube;
                            youtubeLink.target = '_blank';
                            youtubeLink.className = 'link-icon';
                            youtubeLink.style.color = '#ff0000';
                            youtubeLink.style.fontSize = '1.5rem';
                            youtubeLink.style.transition = 'color 0.3s';
                            youtubeLink.innerHTML = `<i class="ph-fill ph-youtube-logo"></i>`;
                            linksContainer.appendChild(youtubeLink);
                        }
                        if (project.links.link) {
                            const customLink = document.createElement('a');
                            customLink.href = project.links.link;
                            customLink.target = '_blank';
                            customLink.className = 'link-icon';
                            customLink.style.color = 'var(--accent)';
                            customLink.style.fontSize = '1.5rem';
                            customLink.style.transition = 'color 0.3s';
                            customLink.innerHTML = `<i class="ph-bold ph-link"></i>`;
                            linksContainer.appendChild(customLink);
                        }
                    }

                    projectCard.appendChild(linksContainer);
                    container.appendChild(projectCard);
                    
                    if (!window.isProjectDetailPage) {
                        cards.push(projectCard);
                        if (paginationContainer) {
                            const dot = document.createElement("div");
                            dot.className = "project-dot" + (index === 0 ? " active" : "");
                            dot.style.width = "12px";
                            dot.style.height = "12px";
                            dot.style.borderRadius = "50%";
                            dot.style.background = index === 0 ? "#00d4ff" : "rgba(255, 255, 255, 0.2)";
                            dot.style.cursor = "pointer";
                            dot.style.transition = "all 0.3s ease";
                            dot.addEventListener("click", () => {
                                projectCard.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
                            });
                            paginationContainer.appendChild(dot);
                            dots.push(dot);
                        }
                    }
                });

                // 더보기 카드 추가
                if (!window.isProjectDetailPage && allProjects.length > 6) {
                    const moreCard = document.createElement('div');
                    moreCard.className = `project-card cards reveal-up`;
                    moreCard.style.display = 'flex';
                    moreCard.style.alignItems = 'center';
                    moreCard.style.justifyContent = 'center';
                    moreCard.style.cursor = 'pointer';
                    moreCard.style.minHeight = '200px';
                    moreCard.innerHTML = `
                        <div style="text-align: center; color: #00d4ff;">
                            <i class="ph-bold ph-plus-circle" style="font-size: 3rem; margin-bottom: 1rem; transition: transform 0.3s ease;"></i>
                            <h3 style="margin: 0; color: #fff;">프로젝트 더보기</h3>
                        </div>
                    `;
                    
                    // 호버 효과를 위해 약간의 JS 이벤트 추가
                    moreCard.addEventListener('mouseenter', () => {
                        const icon = moreCard.querySelector('i');
                        if(icon) icon.style.transform = 'rotate(90deg) scale(1.1)';
                    });
                    moreCard.addEventListener('mouseleave', () => {
                        const icon = moreCard.querySelector('i');
                        if(icon) icon.style.transform = 'rotate(0) scale(1)';
                    });

                    moreCard.addEventListener('click', () => {
                        window.location.href = 'projects.html';
                    });

                    setTimeout(() => {
                        moreCard.classList.add('visible');
                    }, 100 * (displayProjects.length + 1));
                    
                    container.appendChild(moreCard);
                    cards.push(moreCard);

                    if (paginationContainer) {
                        const dot = document.createElement("div");
                        dot.className = "project-dot";
                        dot.style.width = "12px";
                        dot.style.height = "12px";
                        dot.style.borderRadius = "50%";
                        dot.style.background = "rgba(255, 255, 255, 0.2)";
                        dot.style.cursor = "pointer";
                        dot.style.transition = "all 0.3s ease";
                        dot.addEventListener("click", () => {
                            moreCard.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
                        });
                        paginationContainer.appendChild(dot);
                        dots.push(dot);
                    }
                }

                // Scroll event listener for active dot
                if (!window.isProjectDetailPage && container && dots.length > 0) {
                    container.addEventListener("scroll", () => {
                        let activeIndex = 0;
                        
                        if (container.scrollLeft <= 10) {
                            activeIndex = 0;
                        } else if (Math.ceil(container.scrollLeft + container.clientWidth) >= container.scrollWidth - 10) {
                            activeIndex = cards.length - 1;
                        } else {
                            let minDiff = Infinity;
                            const containerCenter = container.scrollLeft + container.clientWidth / 2;

                            cards.forEach((card, index) => {
                                const cardCenter = card.offsetLeft + card.clientWidth / 2;
                                const diff = Math.abs(containerCenter - cardCenter);
                                if (diff < minDiff) {
                                    minDiff = diff;
                                    activeIndex = index;
                                }
                            });
                        }

                        dots.forEach((dot, index) => {
                            if (index === activeIndex) {
                                dot.classList.add("active");
                                dot.style.background = "#00d4ff";
                                dot.style.transform = "scale(1.2)";
                            } else {
                                dot.classList.remove("active");
                                dot.style.background = "rgba(255, 255, 255, 0.2)";
                                dot.style.transform = "scale(1)";
                            }
                        });
                    });
                }
            })
            .catch(error => {
                console.error(`Error loading YAML (Attempt ${attempt}):`, error);
                if (attempt < 3) {
                    setTimeout(() => fetchProjects(attempt + 1), 2000);
                } else {
                    const container = document.querySelector('.project-scroll-container');
                    if(container) container.innerHTML = '<p>프로젝트 데이터를 불러오지 못했습니다.</p>';
                }
            });
    };

    fetchProjects();
});
