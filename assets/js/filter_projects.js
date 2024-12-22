document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectContainer = document.querySelector('.project-container');

    const filterProjects = (filter) => {
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            if (filter === 'all' || card.getAttribute('data-year') === filter) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    };

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const filter = button.getAttribute('data-filter');
            filterProjects(filter);
        });
    });

    // MutationObserver: 요소가 동적으로 로드될 경우 대응
    const observer = new MutationObserver(() => {
        const activeButton = document.querySelector('.filter-btn.active');
        if (activeButton) {
            const activeFilter = activeButton.getAttribute('data-filter');
            filterProjects(activeFilter);
        }
    });

    observer.observe(projectContainer, { childList: true, subtree: true });
});
