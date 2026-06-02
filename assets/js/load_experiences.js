
// load_experiences.js
document.addEventListener('DOMContentLoaded', () => {
    const MAX_RETRIES = 3;
    let retryCount = 0;

    const load = () => {
        fetch('assets/data/experiences.yaml')
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.text();
            })
            .then(yamlText => {
                const experiencesData = jsyaml.load(yamlText);
                const experienceContainer = document.querySelector('.experience-container');

                let paginationContainer = document.querySelector(".experience-pagination");
                let navWrapper = document.querySelector(".experience-nav-wrapper");

                if (experienceContainer) {
                    experienceContainer.innerHTML = "";
                    
                    // Add a wrapper for arrows if not exists
                    if (!navWrapper) {
                        navWrapper = document.createElement("div");
                        navWrapper.className = "experience-nav-wrapper";
                        navWrapper.style.position = "relative";
                        navWrapper.style.display = "flex";
                        navWrapper.style.alignItems = "center";
                        navWrapper.style.margin = "0 calc(-1 * var(--spacing-lg, 2rem))";
                        experienceContainer.parentNode.insertBefore(navWrapper, experienceContainer);
                        navWrapper.appendChild(experienceContainer);
                        
                        // Left Arrow
                        const leftBtn = document.createElement("button");
                        leftBtn.className = "experience-nav-btn left-btn";
                        leftBtn.innerHTML = '<i class="ph-bold ph-caret-left"></i>';
                        Object.assign(leftBtn.style, {
                            position: "absolute", left: "10px", top: "120px", zIndex: "10",
                            background: "rgba(10, 14, 26, 0.8)", border: "1px solid rgba(0, 212, 255, 0.3)",
                            color: "#00d4ff", width: "40px", height: "40px", borderRadius: "50%",
                            display: "flex", justifyContent: "center", alignItems: "center",
                            cursor: "pointer", fontSize: "1.2rem", backdropFilter: "blur(4px)",
                            transition: "all 0.3s",
                            opacity: "0", pointerEvents: "none" // Initially hide left arrow
                        });
                        leftBtn.onmouseover = () => { leftBtn.style.background = "#00d4ff"; leftBtn.style.color = "#fff"; leftBtn.style.transform = "scale(1.1)"; };
                        leftBtn.onmouseout = () => { leftBtn.style.background = "rgba(10, 14, 26, 0.8)"; leftBtn.style.color = "#00d4ff"; leftBtn.style.transform = "scale(1)"; };
                        leftBtn.onclick = () => experienceContainer.scrollBy({ left: -350, behavior: 'smooth' });
                        navWrapper.appendChild(leftBtn);
                        
                        // Right Arrow
                        const rightBtn = document.createElement("button");
                        rightBtn.className = "experience-nav-btn right-btn";
                        rightBtn.innerHTML = '<i class="ph-bold ph-caret-right"></i>';
                        Object.assign(rightBtn.style, {
                            position: "absolute", right: "10px", top: "120px", zIndex: "10",
                            background: "rgba(10, 14, 26, 0.8)", border: "1px solid rgba(0, 212, 255, 0.3)",
                            color: "#00d4ff", width: "40px", height: "40px", borderRadius: "50%",
                            display: "flex", justifyContent: "center", alignItems: "center",
                            cursor: "pointer", fontSize: "1.2rem", backdropFilter: "blur(4px)",
                            transition: "all 0.3s"
                        });
                        rightBtn.onmouseover = () => { rightBtn.style.background = "#00d4ff"; rightBtn.style.color = "#fff"; rightBtn.style.transform = "scale(1.1)"; };
                        rightBtn.onmouseout = () => { rightBtn.style.background = "rgba(10, 14, 26, 0.8)"; rightBtn.style.color = "#00d4ff"; rightBtn.style.transform = "scale(1)"; };
                        rightBtn.onclick = () => experienceContainer.scrollBy({ left: 350, behavior: 'smooth' });
                        navWrapper.appendChild(rightBtn);
                        
                        // Dynamic vertical positioning for arrows
                        window.addEventListener("scroll", () => {
                            if (!navWrapper || !leftBtn || !rightBtn) return;
                            const rect = navWrapper.getBoundingClientRect();
                            const idealTop = Math.max(120, (window.innerHeight / 2) - rect.top);
                            const maxTop = rect.height - 80;
                            const finalTop = Math.min(idealTop, maxTop);
                            
                            leftBtn.style.top = finalTop + "px";
                            rightBtn.style.top = finalTop + "px";
                        });
                    }
                    
                    // Make it scrollable left-to-right
                    experienceContainer.style.display = "flex";
                    experienceContainer.style.overflowX = "auto";
                    experienceContainer.style.scrollSnapType = "x mandatory";
                    experienceContainer.style.scrollBehavior = "smooth";
                    // 모바일 스크롤 관성 줄이기: 터치 시 멈춤, 부드러운 여운 제거
                    experienceContainer.style.overscrollBehaviorX = "contain"; 
                    experienceContainer.style.gap = "1.5rem";
                    
                    const isMobile = window.innerWidth <= 768;
                    if (isMobile) {
                        experienceContainer.style.padding = "5rem max(0px, calc(50% - 175px)) 5rem max(0px, calc(50% - 175px))";
                    } else {
                        // Desktop: left-aligned cards to fit as many as possible
                        experienceContainer.style.padding = "5rem 2rem";
                    }
                    experienceContainer.style.margin = "-2rem 0";
                    experienceContainer.style.msOverflowStyle = "none"; // IE/Edge
                    experienceContainer.style.scrollbarWidth = "none"; // Firefox
                    // 스크롤바 숨기기 CSS 클래스 추가 가능
                    experienceContainer.classList.add('no-scrollbar');

                    if (!paginationContainer) {
                        paginationContainer = document.createElement("div");
                        paginationContainer.className = "experience-pagination";
                        paginationContainer.style.display = "flex";
                        paginationContainer.style.justifyContent = "center";
                        paginationContainer.style.gap = "0.8rem";
                        paginationContainer.style.marginTop = "1rem";
                        navWrapper.parentNode.insertBefore(paginationContainer, navWrapper.nextSibling);
                    } else {
                        paginationContainer.innerHTML = "";
                    }
                }

                const awardIcons = {
                    "대상": "🏆", "최우수상": "🏆", "우수상": "🏅", "금상": "🥇",
                    "은상": "🥈", "동상": "🥉", "입선": "✨", "장려상": "✨", "포스터상": "📜"
                };

                let schoolCount = 0;
                let externalCount = 0;
                const cards = [];
                const dots = [];

                if (experiencesData.experiences) {
                    experiencesData.experiences.forEach((experience, index) => {
                        
                        // Create card for this year
                        const card = document.createElement("div");
                        card.className = "experience-card";
                        card.style.flex = "0 0 auto"; // Prevent shrinking
                        card.style.width = "350px";
                        const isMobile = window.innerWidth <= 768;
                        card.style.scrollSnapAlign = isMobile ? "center" : "start";
                        card.style.scrollSnapStop = "always"; // 모바일에서 확 넘어가지 않고 하나씩 멈추도록 설정
                        
                        let cardHTML = `<h3>${experience.year}</h3>`;

                        if (experience.competitions) {
                            experience.competitions.forEach(comp => {
                                let totalAwardsInComp = 0;
                                let awardTexts = [];

                                comp.awards.forEach(award => {
                                    const count = award.count || 1;
                                    const isSchool = /교내|명지대|학과|공학입문설계|SEP/.test(comp.name);

                                    if (isSchool) schoolCount += count;
                                    else externalCount += count;

                                    totalAwardsInComp += count;
                                    const icon = awardIcons[award.type] || "✨";
                                    awardTexts.push(`<code>${icon} ${award.type}${count > 1 ? `(${count})` : ""}</code>`);
                                });

                                cardHTML += `
                                    <div class="competition-row">
                                        <div class="competition-title">${comp.name}</div>
                                        <div class="award-list">
                                            ${awardTexts.join("")}
                                        </div>
                                    </div>
                                `;
                            });
                        }
                        
                        card.innerHTML = cardHTML;
                        if (index === 0) card.classList.add("active");
                        if (experienceContainer) {
                            experienceContainer.appendChild(card);
                            cards.push(card);

                            // Create dot
                            if (paginationContainer) {
                                const dot = document.createElement("div");
                                dot.className = "experience-dot" + (index === 0 ? " active" : "");
                                dot.style.width = "12px";
                                dot.style.height = "12px";
                                dot.style.borderRadius = "50%";
                                dot.style.background = index === 0 ? "#00d4ff" : "rgba(255, 255, 255, 0.2)";
                                dot.style.cursor = "pointer";
                                dot.style.transition = "all 0.3s ease";
                                dot.addEventListener("click", () => {
                                    const isMobile = window.innerWidth <= 768;
                                    if (isMobile) {
                                        card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
                                    } else {
                                        // On desktop, scroll left to align with the 2rem padding (32px)
                                        experienceContainer.scrollTo({
                                            left: card.offsetLeft - 32,
                                            behavior: "smooth"
                                        });
                                    }
                                });
                                paginationContainer.appendChild(dot);
                                dots.push(dot);
                            }
                        }
                    });

                    // Scroll event listener for active dot
                    if (experienceContainer && dots.length > 0) {
                        experienceContainer.addEventListener("scroll", () => {
                            let activeIndex = 0;
                            
                            const isMobile = window.innerWidth <= 768;
                            
                            if (experienceContainer.scrollLeft <= 10) {
                                activeIndex = 0;
                            } else if (Math.ceil(experienceContainer.scrollLeft + experienceContainer.clientWidth) >= experienceContainer.scrollWidth - 10) {
                                activeIndex = cards.length - 1;
                            } else {
                                let minDiff = Infinity;
                                const targetPos = isMobile 
                                    ? experienceContainer.scrollLeft + experienceContainer.clientWidth / 2
                                    : experienceContainer.scrollLeft + 32; // 32 is padding-left

                                cards.forEach((card, index) => {
                                    const cardPos = isMobile 
                                        ? card.offsetLeft + card.clientWidth / 2
                                        : card.offsetLeft;
                                    
                                    const diff = Math.abs(targetPos - cardPos);
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
                                    if(cards[index]) cards[index].classList.add("active");
                                } else {
                                    dot.classList.remove("active");
                                    dot.style.background = "rgba(255, 255, 255, 0.2)";
                                    dot.style.transform = "scale(1)";
                                    if(cards[index]) cards[index].classList.remove("active");
                                }
                            });
                            
                            // Toggle arrow visibility
                            const leftBtn = document.querySelector(".experience-nav-btn.left-btn");
                            const rightBtn = document.querySelector(".experience-nav-btn.right-btn");

                            if (leftBtn && rightBtn) {
                                if (experienceContainer.scrollLeft <= 10) {
                                    leftBtn.style.opacity = "0";
                                    leftBtn.style.pointerEvents = "none";
                                } else {
                                    leftBtn.style.opacity = "1";
                                    leftBtn.style.pointerEvents = "auto";
                                }

                                if (Math.ceil(experienceContainer.scrollLeft + experienceContainer.clientWidth) >= experienceContainer.scrollWidth - 10) {
                                    rightBtn.style.opacity = "0";
                                    rightBtn.style.pointerEvents = "none";
                                } else {
                                    rightBtn.style.opacity = "1";
                                    rightBtn.style.pointerEvents = "auto";
                                }
                            }
                        });
                    }

                    // Handle window resize layout changes
                    window.addEventListener("resize", () => {
                        const isMobile = window.innerWidth <= 768;
                        if (isMobile) {
                            experienceContainer.style.padding = "5rem max(0px, calc(50% - 175px)) 5rem max(0px, calc(50% - 175px))";
                            cards.forEach(card => card.style.scrollSnapAlign = "center");
                        } else {
                            experienceContainer.style.padding = "5rem 2rem";
                            cards.forEach(card => card.style.scrollSnapAlign = "start");
                        }
                    });

                    // Update Counters
                    const schoolCounterEls = document.querySelectorAll(".school-counter");
                    const externalCounterEls = document.querySelectorAll(".external-counter");

                    schoolCounterEls.forEach(el => el.setAttribute("data-target", schoolCount));
                    externalCounterEls.forEach(el => el.setAttribute("data-target", externalCount));

                    // IntersectionObserver
                    const counterContainers = document.querySelectorAll(".counter-animate-trigger");
                    if (counterContainers.length > 0) {
                        const observer = new IntersectionObserver((entries) => {
                            entries.forEach(entry => {
                                if (entry.isIntersecting) {
                                    animateCounters(entry.target);
                                } else {
                                    const counters = entry.target.querySelectorAll(".counter-number");
                                    counters.forEach(counter => {
                                        counter.innerText = "0";
                                        counter.removeAttribute("data-animating");
                                    });
                                }
                            });
                        }, { threshold: 0.1 });

                        counterContainers.forEach(container => observer.observe(container));
                    }
                }
            })
            .catch(error => {
                console.error(`Error loading YAML (Attempt ${retryCount + 1}):`, error);
                if (retryCount < MAX_RETRIES) {
                    retryCount++;
                    setTimeout(load, 2000);
                } else {
                    const experienceContainer = document.querySelector(".experience-container");
                    if (experienceContainer) {
                        experienceContainer.innerHTML = "<p>Error loading experiences. Please try again later.</p>";
                    }
                }
            });
    };

    function animateCounters(container) {
        const counters = container.querySelectorAll(".counter-number");
        const speed = 200;

        counters.forEach(counter => {
            if (counter.getAttribute("data-animating")) return;
            counter.setAttribute("data-animating", "true");

            const updateCount = () => {
                if (!counter.getAttribute("data-animating")) return;

                const target = +counter.getAttribute("data-target");
                const count = +counter.innerText;
                const inc = target / speed;

                if (count < target) {
                    counter.innerText = Math.ceil(count + inc);
                    setTimeout(updateCount, 20);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
        });
    }

    load();
});

