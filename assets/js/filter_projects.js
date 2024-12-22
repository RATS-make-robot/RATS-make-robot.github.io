document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectContainer = document.querySelector('.project-container');

    if (!filterButtons || !projectContainer) {
        console.error('Required elements for filtering not found.');
        return;
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const isActive = button.classList.contains('active');

            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));

            if (!isActive) {
                button.classList.add('active');
                const filter = button.getAttribute('data-filter');

                const projectCards = projectContainer.querySelectorAll('.project-card');
                projectCards.forEach(card => {
                    if (filter === 'all' || card.getAttribute('data-year') === filter) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            } else {
                // Show all cards if the active filter is toggled off
                const projectCards = projectContainer.querySelectorAll('.project-card');
                projectCards.forEach(card => {
                    card.style.display = 'block';
                });
            }
        });
    });
});
