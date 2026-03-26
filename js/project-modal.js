/**
 * Project Quick Preview Modal Controller
 * Handles the logic for opening the detailed project view without navigating away.
 */

const projectModalController = (() => {
    let dialog, title, image, category, categoryMobile, tech, desc, outcome, linkBtn, repoBtn, closeBtn;

    const init = () => {
        dialog = document.getElementById('project-modal');
        if (!dialog) return;

        // Elements
        title = document.getElementById('modal-title');
        image = document.getElementById('modal-image');
        category = document.getElementById('modal-category');
        categoryMobile = document.getElementById('modal-category-mobile');
        tech = document.getElementById('modal-tech');
        desc = document.getElementById('modal-desc');
        outcome = document.getElementById('modal-outcome');
        linkBtn = document.getElementById('modal-link');
        repoBtn = document.getElementById('modal-repo');
        closeBtn = document.getElementById('modal-close');

        // Close events
        closeBtn.addEventListener('click', close);
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) close();
        });

        // Open events (delegate)
        document.getElementById('projects-list-container').addEventListener('click', (e) => {
            const card = e.target.closest('.project-item');
            if (card && !e.target.closest('a') && !e.target.closest('button')) {
                open(card);
            }
        });
    };

    const open = (card) => {
        // Extract data
        const data = {
            title: card.querySelector('h3').textContent.trim(),
            category: card.dataset.category || 'Project',
            desc: card.dataset.description || '',
            outcome: card.dataset.outcome || '',
            tech: card.querySelector('p.text-slate-500').textContent.trim(), // Heuristic: subtitle
            image: card.dataset.image ||
                card.querySelector('.bg-cover').style.backgroundImage.slice(5, -2).replace(/['"]/g, ""),
            link: card.dataset.link || '#',
            repo: card.dataset.repo || '#'
        };

        // Populate
        title.textContent = data.title;
        image.src = data.image;
        category.textContent = data.category.replace('-', ' ');
        categoryMobile.textContent = data.category.replace('-', ' ');
        tech.textContent = data.tech;
        desc.textContent = data.desc;
        outcome.textContent = data.outcome;

        linkBtn.href = data.link;
        repoBtn.href = data.repo;

        // Show
        dialog.showModal();
        document.body.style.overflow = 'hidden'; // Prevent bg scroll
    };

    const close = () => {
        dialog.close();
        document.body.style.overflow = '';
    };

    return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
    projectModalController.init();
});
