document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const isActive = button.classList.contains('active');

            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));

            if (!isActive) {
                button.classList.add('active');
                const filter = button.getAttribute('data-filter');

                projectCards.forEach(card => {
                    if (filter === 'all' || card.getAttribute('data-year') === filter) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            } else {
                // Show all cards if the active filter is toggled off
                projectCards.forEach(card => {
                    card.style.display = 'block';
                });
            }
        });
    });
});
