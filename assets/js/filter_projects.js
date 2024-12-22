const initializeFilters = () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectContainer = document.querySelector('.project-container');

    if (!filterButtons || !projectContainer) {
        console.error('Required elements for filtering not found.');
        return;
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to the clicked button
            button.classList.add('active');

            const filter = button.getAttribute('data-filter');
            const projectCards = projectContainer.querySelectorAll('.project-card');

            // Show or hide project cards based on the filter
            projectCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-year') === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
};
