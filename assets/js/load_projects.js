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

                const displayProjects = window.isProjectDetailPage ? allProjects : allProjects.slice(0, 6);
                const cards = [];
                const dots = [];

                // --- 카드 생성 헬퍼 함수 ---
                const createProjectCard = (project, index, isDetail) => {
                    const projectCard = document.createElement('div');
                    const delayClass = `reveal-delay-${(index % 3) + 1}`; 
                    projectCard.className = `project-card cards reveal-up ${delayClass}`;
                    if (!isDetail) {
                        projectCard.style.flex = "0 0 auto";
                        projectCard.style.width = "350px";
                        projectCard.style.scrollSnapAlign = "start";
                    }
                    setTimeout(() => { projectCard.classList.add('visible'); }, 100 * (index + 1));

                    // Background Image Overlay
                    if (project.image) {
                        const bgDiv = document.createElement('div');
                        bgDiv.className = 'card-bg-image';
                        bgDiv.style.backgroundImage = `url('${project.image}')`;
                        projectCard.appendChild(bgDiv);
                    }

                    // Content wrapper
                    const contentDiv = document.createElement('div');
                    contentDiv.className = 'card-content';
                    projectCard.appendChild(contentDiv);

                    const title = document.createElement('h3');
                    title.textContent = project.title;
                    contentDiv.appendChild(title);

                    const desc = document.createElement('p');
                    desc.textContent = project.description;
                    contentDiv.appendChild(desc);

                    const duration = document.createElement('p');
                    duration.innerHTML = `<strong>[기간]</strong> ${project.duration}`;
                    duration.style.marginTop = 'auto';
                    duration.style.paddingTop = '1rem';
                    contentDiv.appendChild(duration);

                    const linksContainer = document.createElement('div');
                    linksContainer.className = 'links-container';
                    linksContainer.style.display = 'flex';
                    linksContainer.style.gap = '0.8rem';
                    linksContainer.style.justifyContent = 'center';

                    if (project.links) {
                        if (project.links.github) {
                            const githubLink = document.createElement('a');
                            githubLink.href = project.links.github;
                            githubLink.target = '_blank';
                            githubLink.className = 'link-icon';
                            githubLink.style.color = '#fff';
                            githubLink.style.fontSize = '1.5rem';
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
                            customLink.innerHTML = `<i class="ph-bold ph-link"></i>`;
                            linksContainer.appendChild(customLink);
                        }
                    }
                    contentDiv.appendChild(linksContainer);
                    return projectCard;
                };

                if (window.isProjectDetailPage) {
                    const parentContainer = container.parentNode;
                    parentContainer.innerHTML = ''; // 기본 컨테이너 제거

                    // 1. 모든 프로젝트의 시작-끝 연도 추출 및 전체 연도 목록 생성
                    let allProjectsWithYear = [];
                    let uniqueYears = new Set();

                    if (projectsData.projects) {
                        projectsData.projects.forEach(group => {
                            if (!group.projects) return;
                            group.projects.forEach(p => {
                                // duration에서 "20xx" 연도를 모두 추출
                                const yearMatches = p.duration ? p.duration.match(/20\d{2}/g) : null;
                                let startY, endY;
                                if (yearMatches && yearMatches.length > 0) {
                                    const years = yearMatches.map(Number);
                                    startY = Math.min(...years);
                                    endY = Math.max(...years);
                                } else {
                                    // fallback: 그룹의 year 값 사용 (예: "2024년도" -> 2024)
                                    const fallback = parseInt(group.year);
                                    startY = endY = isNaN(fallback) ? 2025 : fallback;
                                }
                                p.startYear = startY;
                                p.endYear = endY;
                                p.originalGroup = group.year;
                                allProjectsWithYear.push(p);

                                for(let y = startY; y <= endY; y++) {
                                    uniqueYears.add(y);
                                }
                            });
                        });
                    }

                    // 연도 내림차순 정렬 (최신순)
                    const sortedYears = Array.from(uniqueYears).sort((a, b) => b - a);

                    // 2. 칩 필터 UI 생성
                    const filterContainer = document.createElement('div');
                    filterContainer.className = 'project-filter-container reveal-up visible';
                    filterContainer.style.display = 'flex';
                    filterContainer.style.flexWrap = 'wrap';
                    filterContainer.style.gap = '0.8rem';
                    filterContainer.style.marginBottom = '3rem';
                    filterContainer.style.justifyContent = 'center';
                    
                    const createChip = (text, value) => {
                        const chip = document.createElement('button');
                        chip.textContent = text;
                        chip.className = 'filter-chip';
                        chip.dataset.year = value;
                        chip.style.padding = '0.6rem 1.5rem';
                        chip.style.borderRadius = '30px';
                        chip.style.border = '1px solid rgba(0, 212, 255, 0.5)';
                        chip.style.background = 'transparent';
                        chip.style.color = '#fff';
                        chip.style.cursor = 'pointer';
                        chip.style.fontWeight = '600';
                        chip.style.fontSize = '1rem';
                        chip.style.transition = 'all 0.3s ease';
                        
                        // 호버 효과
                        chip.addEventListener('mouseenter', () => {
                            if (!chip.classList.contains('active-chip')) {
                                chip.style.background = 'rgba(0, 212, 255, 0.2)';
                            }
                        });
                        chip.addEventListener('mouseleave', () => {
                            if (!chip.classList.contains('active-chip')) {
                                chip.style.background = 'transparent';
                            }
                        });
                        return chip;
                    };

                    const chips = [];
                    const allChip = createChip('All', 'all');
                    allChip.classList.add('active-chip');
                    allChip.style.background = '#00d4ff';
                    allChip.style.color = '#000';
                    chips.push(allChip);
                    filterContainer.appendChild(allChip);

                    sortedYears.forEach(year => {
                        const chip = createChip(`${year}년`, year.toString());
                        chips.push(chip);
                        filterContainer.appendChild(chip);
                    });

                    parentContainer.appendChild(filterContainer);

                    // 3. 렌더링 컨테이너
                    const renderContainer = document.createElement('div');
                    parentContainer.appendChild(renderContainer);

                    const renderProjects = (filterValue) => {
                        renderContainer.innerHTML = ''; // 지우기

                        if (filterValue === 'all') {
                            // All일 때는 기존처럼 그룹별로 렌더링
                            projectsData.projects.forEach((group, groupIdx) => {
                                if (!group.projects || group.projects.length === 0) return;
                                
                                const yearHeading = document.createElement('h2');
                                yearHeading.className = 'year-heading reveal-up visible';
                                yearHeading.textContent = group.year + ' Projects';
                                yearHeading.style.color = '#fff';
                                yearHeading.style.fontSize = '2rem';
                                yearHeading.style.marginTop = groupIdx === 0 ? '0' : '4rem';
                                yearHeading.style.marginBottom = '2rem';
                                yearHeading.style.borderBottom = '2px solid rgba(0, 212, 255, 0.3)';
                                yearHeading.style.paddingBottom = '0.5rem';
                                renderContainer.appendChild(yearHeading);

                                const yearGrid = document.createElement('div');
                                yearGrid.className = 'project-scroll-container';
                                renderContainer.appendChild(yearGrid);

                                group.projects.forEach((project, index) => {
                                    const card = createProjectCard(project, index, true);
                                    yearGrid.appendChild(card);
                                });
                            });
                        } else {
                            // 특정 연도일 때는 해당 연도 범위 내에 있는 프로젝트만 필터링
                            const targetYear = parseInt(filterValue);
                            const filtered = allProjectsWithYear.filter(p => targetYear >= p.startYear && targetYear <= p.endYear);

                            const yearHeading = document.createElement('h2');
                            yearHeading.className = 'year-heading reveal-up visible';
                            yearHeading.textContent = `${targetYear}년 활동 프로젝트`;
                            yearHeading.style.color = '#fff';
                            yearHeading.style.fontSize = '2rem';
                            yearHeading.style.marginTop = '0';
                            yearHeading.style.marginBottom = '2rem';
                            yearHeading.style.borderBottom = '2px solid rgba(0, 212, 255, 0.3)';
                            yearHeading.style.paddingBottom = '0.5rem';
                            renderContainer.appendChild(yearHeading);

                            if (filtered.length === 0) {
                                const emptyMsg = document.createElement('p');
                                emptyMsg.style.textAlign = 'center';
                                emptyMsg.style.color = '#888';
                                emptyMsg.textContent = '해당 연도에 진행된 프로젝트가 없습니다.';
                                renderContainer.appendChild(emptyMsg);
                                return;
                            }

                            const yearGrid = document.createElement('div');
                            yearGrid.className = 'project-scroll-container';
                            renderContainer.appendChild(yearGrid);

                            filtered.forEach((project, index) => {
                                const card = createProjectCard(project, index, true);
                                yearGrid.appendChild(card);
                            });
                        }
                    };

                    // 4. 클릭 이벤트 바인딩
                    chips.forEach(chip => {
                        chip.addEventListener('click', () => {
                            chips.forEach(c => {
                                c.classList.remove('active-chip');
                                c.style.background = 'transparent';
                                c.style.color = '#fff';
                            });
                            chip.classList.add('active-chip');
                            chip.style.background = '#00d4ff';
                            chip.style.color = '#000';

                            renderProjects(chip.dataset.year);
                        });
                    });

                    // 최초 렌더링
                    renderProjects('all');
                } else {
                    // 메인 페이지: 기존처럼 스크롤 컨테이너에 카드 추가
                    displayProjects.forEach((project, index) => {
                        const projectCard = createProjectCard(project, index, false);
                        container.appendChild(projectCard);
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
                    });
                }

                // 더보기 카드 추가
                if (!window.isProjectDetailPage && allProjects.length > 6) {
                    const moreCard = document.createElement('div');
                    moreCard.className = `project-card more-card reveal-up`;
                    moreCard.style.display = 'flex';
                    moreCard.style.alignItems = 'center';
                    moreCard.style.justifyContent = 'center';
                    moreCard.style.cursor = 'pointer';
                    moreCard.style.minHeight = '200px';
                    moreCard.style.flex = '0 0 auto';
                    moreCard.style.width = '350px';
                    moreCard.style.scrollSnapAlign = 'start';
                    moreCard.style.background = 'transparent';
                    moreCard.style.border = 'none';
                    moreCard.style.boxShadow = 'none';
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
