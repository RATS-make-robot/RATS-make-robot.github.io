
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
                if (experienceContainer) {
                    experienceContainer.innerHTML = "";
                    
                    // Make it scrollable left-to-right
                    experienceContainer.style.display = "flex";
                    experienceContainer.style.overflowX = "auto";
                    experienceContainer.style.scrollSnapType = "x mandatory";
                    experienceContainer.style.gap = "1.5rem";
                    experienceContainer.style.padding = "1rem 0 2rem 0";
                    experienceContainer.style.msOverflowStyle = "none"; // IE/Edge
                    experienceContainer.style.scrollbarWidth = "none"; // Firefox

                    if (!paginationContainer) {
                        paginationContainer = document.createElement("div");
                        paginationContainer.className = "experience-pagination";
                        paginationContainer.style.display = "flex";
                        paginationContainer.style.justifyContent = "center";
                        paginationContainer.style.gap = "0.8rem";
                        paginationContainer.style.marginTop = "1rem";
                        experienceContainer.parentNode.insertBefore(paginationContainer, experienceContainer.nextSibling);
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
                        card.style.scrollSnapAlign = "start";
                        
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
                                    card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
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
                            
                            if (experienceContainer.scrollLeft <= 10) {
                                activeIndex = 0;
                            } else if (Math.ceil(experienceContainer.scrollLeft + experienceContainer.clientWidth) >= experienceContainer.scrollWidth - 10) {
                                activeIndex = cards.length - 1;
                            } else {
                                let minDiff = Infinity;
                                const containerCenter = experienceContainer.scrollLeft + experienceContainer.clientWidth / 2;

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

