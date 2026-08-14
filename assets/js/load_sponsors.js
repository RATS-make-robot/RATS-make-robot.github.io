// load_sponsors.js
document.addEventListener('DOMContentLoaded', () => {
    const fetchSponsors = (retryCount = 3) => {
        fetch('assets/data/sponsors.yaml')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(yamlText => {
                const sponsorsData = jsyaml.load(yamlText);
                const sponsorContainer = document.querySelector('.sponsor-container');

                if (!sponsorContainer) return;

                sponsorContainer.innerHTML = '';

                const groups = (sponsorsData && sponsorsData.sponsors) || [];
                // 로고가 하나도 없으면 섹션 자체를 숨김
                const totalItems = groups.reduce((sum, g) => sum + ((g && g.items) ? g.items.length : 0), 0);
                if (totalItems === 0) {
                    hideSection(sponsorContainer);
                    return;
                }

                groups.forEach((group, groupIndex) => {
                    if (!group || !group.items || group.items.length === 0) return;

                    const groupEl = document.createElement('div');
                    groupEl.className = 'sponsor-tier';

                    if (group.tier) {
                        const tierHead = document.createElement('div');
                        tierHead.className = 'sponsor-tier-head';
                        tierHead.innerHTML = `
                            <span class="sponsor-tier-name">${group.tier}</span>
                            ${group.note ? `<span class="sponsor-tier-note">${group.note}</span>` : ''}
                        `;
                        groupEl.appendChild(tierHead);
                    }

                    const grid = document.createElement('div');
                    grid.className = 'sponsor-grid';

                    group.items.forEach((sponsor, index) => {
                        if (!sponsor || !sponsor.name) return;
                        grid.appendChild(createSponsorCard(sponsor, groupIndex * 10 + index));
                    });

                    groupEl.appendChild(grid);
                    sponsorContainer.appendChild(groupEl);
                });
            })
            .catch(error => {
                console.error('Error loading YAML:', error);
                if (retryCount > 0) {
                    setTimeout(() => fetchSponsors(retryCount - 1), 1000);
                } else {
                    // 데이터를 못 불러오면 빈 껍데기를 남기지 않고 섹션을 숨김
                    hideSection(document.querySelector('.sponsor-container'));
                }
            });
    };

    // 스폰서 카드 1개 생성 (로고 + 이름 + 설명)
    function createSponsorCard(sponsor, index) {
        // link 가 있으면 <a>, 없으면 <div> 로 감쌈
        const card = document.createElement(sponsor.link ? 'a' : 'div');
        card.className = 'sponsor-card';
        card.style.animationDelay = `${Math.min(index, 12) * 0.06}s`;

        if (sponsor.link) {
            card.href = sponsor.link;
            card.target = '_blank';
            card.rel = 'noopener noreferrer';
            card.setAttribute('aria-label', `${sponsor.name} 홈페이지로 이동`);
        }

        const logoBox = document.createElement('div');
        logoBox.className = 'sponsor-logo-box';

        if (sponsor.logo) {
            const img = document.createElement('img');
            img.className = 'sponsor-logo' + (sponsor.invert ? ' invert' : '');
            img.src = sponsor.logo;
            img.alt = `${sponsor.name} 로고`;
            img.loading = 'lazy';
            // 로고 경로가 잘못됐거나 파일이 없을 때: 회사명 텍스트로 대체
            img.addEventListener('error', () => {
                img.remove();
                logoBox.appendChild(createLogoFallback(sponsor.name));
                // 대체 텍스트가 이미 회사명이므로 아래 이름 줄은 숨김 (중복 방지)
                card.classList.add('logo-missing');
            });
            logoBox.appendChild(img);
        } else {
            logoBox.appendChild(createLogoFallback(sponsor.name));
            card.classList.add('logo-missing');
        }

        card.appendChild(logoBox);

        const nameEl = document.createElement('span');
        nameEl.className = 'sponsor-name';
        nameEl.textContent = sponsor.name;
        card.appendChild(nameEl);

        if (sponsor.description) {
            const descEl = document.createElement('span');
            descEl.className = 'sponsor-desc';
            descEl.textContent = sponsor.description;
            card.appendChild(descEl);
        }

        return card;
    }

    // 로고 이미지가 없을 때 표시할 텍스트 대체물
    function createLogoFallback(name) {
        const fallback = document.createElement('span');
        fallback.className = 'sponsor-logo-fallback';
        fallback.textContent = name;
        return fallback;
    }

    function hideSection(container) {
        if (!container) return;
        const section = container.closest('section');
        if (section) section.style.display = 'none';
    }

    fetchSponsors();
});
