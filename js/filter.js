document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectItems = document.querySelectorAll('.project-item');
    const searchInput = document.getElementById('projectSearch');

    let currentCategory = 'all';
    let currentSearchTerm = '';

    // Initialize Event Listeners
    initCategoryFilters();
    initSearch();
    initTechPillClicks();

    function initCategoryFilters() {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update active button visual state
                filterButtons.forEach(btn => {
                    btn.classList.remove('bg-primary', 'text-white');
                    btn.classList.add('bg-white', 'dark:bg-[#1c2333]', 'text-slate-600', 'dark:text-slate-300');
                });
                button.classList.remove('bg-white', 'dark:bg-[#1c2333]', 'text-slate-600', 'dark:text-slate-300');
                button.classList.add('bg-primary', 'text-white');

                // Update state and filter
                currentCategory = button.getAttribute('data-filter');
                filterProjects();
            });
        });
    }

    function initSearch() {
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            currentSearchTerm = e.target.value.toLowerCase().trim();
            filterProjects();
        });
    }

    function initTechPillClicks() {
        // Add click handlers to all tech pills (spans inside project items)
        const techPills = document.querySelectorAll('.project-item span.px-2');

        techPills.forEach(pill => {
            pill.classList.add('cursor-pointer', 'hover:bg-primary', 'hover:text-white', 'transition-colors');
            pill.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                applyTechFilter(pill.textContent.trim());
            });
        });

        // Initialize Global Tech Cloud buttons
        const cloudButtons = document.querySelectorAll('.tech-filter-btn');
        cloudButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                applyTechFilter(btn.getAttribute('data-tech'));

                // Active state visual
                cloudButtons.forEach(b => b.classList.remove('bg-primary/10', 'text-primary', 'border-primary'));
                btn.classList.add('bg-primary/10', 'text-primary', 'border-primary');
            });
        });
    }

    function applyTechFilter(tech) {
        if (!searchInput) return;
        searchInput.value = tech;
        currentSearchTerm = tech.toLowerCase();
        filterProjects();
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function filterProjects() {
        projectItems.forEach(item => {
            const category = item.getAttribute('data-category');
            const title = item.querySelector('h3').textContent.toLowerCase();
            const description = item.getAttribute('data-description').toLowerCase();
            const techText = Array.from(item.querySelectorAll('span')).map(s => s.textContent.toLowerCase()).join(' ');

            // Allow searching within visible text content of the card as well
            const fullContent = (title + ' ' + description + ' ' + techText);

            const matchesCategory = currentCategory === 'all' || category === currentCategory;
            const matchesSearch = currentSearchTerm === '' || fullContent.includes(currentSearchTerm);

            if (matchesCategory && matchesSearch) {
                item.classList.remove('hidden');
                item.classList.add('animate-fade-in');
            } else {
                item.classList.add('hidden');
                item.classList.remove('animate-fade-in');
            }
        });
    }
});
