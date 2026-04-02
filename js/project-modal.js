/**
 * Project Quick Preview Modal Controller
 * Handles the logic for opening the detailed project view with live GitHub data.
 */

const projectModalController = (() => {
    let dialog, title, repoPath, image, category, readmeContainer, starsText, forksText, techList, descText, repoBtn, linkBtn, filesLink, closeBtn;

    const GITHUB_USERNAME = 'YashwanthNavari';

    const init = () => {
        console.log("Project Modal Controller: Initializing...");
        dialog = document.getElementById('project-modal');

        if (!dialog) {
            console.error("Project Modal Controller: Could not find element with ID 'project-modal'");
            return;
        }

        // Header Elements
        title = document.getElementById('modal-title');
        repoPath = document.getElementById('modal-repo-path');
        closeBtn = document.getElementById('modal-close');

        // Content Elements
        readmeContainer = document.getElementById('modal-readme-container');
        filesLink = document.getElementById('modal-files-link');

        // Sidebar Elements
        image = document.getElementById('modal-image');
        category = document.getElementById('modal-category');
        starsText = document.getElementById('modal-stars');
        forksText = document.getElementById('modal-forks');
        techList = document.getElementById('modal-tech-list');
        descText = document.getElementById('modal-desc');

        // Action Buttons
        repoBtn = document.getElementById('modal-repo-btn');
        linkBtn = document.getElementById('modal-live-btn');

        // Close events
        if (closeBtn) closeBtn.onclick = close;
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) close();
        });

        // Open events (delegate from document for all grid sections)
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.project-item');
            const link = e.target.closest('a');

            // If it's a project card
            if (card) {
                console.log("Project Card Clicked:", card.dataset.repo);

                // If it's NOT a link, OR it's a link to "#" (placeholder)
                if (!link || link.getAttribute('href') === '#' || link.getAttribute('href') === 'javascript:void(0)') {
                    // Only open modal if we didn't click a real external link or a filter button
                    if (!e.target.closest('.filter-btn')) {
                        console.log("Opening modal for:", card.dataset.repo);
                        e.preventDefault();
                        open(card);
                    }
                }
            }
        });

        console.log("Project Modal Controller: Initialization Complete.");
    };

    const open = async (card) => {
        const repo = card.dataset.repo;
        console.log("Starting modal open for repo:", repo);

        if (!dialog || typeof dialog.showModal !== 'function') {
            console.error("Browser error: <dialog>.showModal() is not supported or dialog element is missing.");
            alert("Your browser does not support the project quick-view modal. Please try a newer browser or view the project on GitHub directly.");
            return;
        }

        // Initialize defaults
        let projectTitle = 'Project Details';
        let projectImage = card.dataset.image || '';
        let projectCategory = card.dataset.category || 'Project';
        let projectDesc = '';
        let projectTech = 'Tech Stack';

        // Safe Data Collection
        try {
            // Search for the pretty title in the bottom half first
            const titleEl = card.querySelector('.p-5 h3') || card.querySelector('h3');
            if (titleEl) projectTitle = titleEl.textContent.trim();

            // Match the text-sm or text-[11px] for description
            const descEl = card.querySelector('p.text-sm') || card.querySelector('p.text-\\[11px\\]');
            if (descEl) projectDesc = descEl.textContent.trim();

            // Find Tech Stack (Looking for the Python/JavaScript/etc text)
            // Try different possible structures
            const techEl = card.querySelector('.cursor-pointer .w-2.5')?.parentElement ||
                card.querySelector('div.inline-flex.items-center.px-2.py-0.5'); // Top variant

            if (techEl) {
                projectTech = techEl.textContent.trim();
            }

            console.log("Extracted Metadata:", { projectTitle, projectCategory, projectTech });
        } catch (err) {
            console.warn("Minor error during metadata extraction (non-fatal):", err);
        }

        // Reset UI & Set Context
        if (title) title.textContent = projectTitle;
        if (repoPath) repoPath.textContent = repo ? `${GITHUB_USERNAME} / ${repo}` : `${GITHUB_USERNAME} / portfolio`;
        if (image) image.src = projectImage;
        if (category) category.textContent = projectCategory;
        if (descText) descText.textContent = projectDesc;

        // Stats Reset
        if (starsText) starsText.textContent = '...';
        if (forksText) forksText.textContent = '...';

        // Tech list population
        if (techList) {
            techList.innerHTML = `<span class="px-2.5 py-1 bg-primary/10 text-primary font-bold text-[10px] rounded border border-primary/20">${projectTech}</span>`;
        }

        // Set Links
        if (repoBtn) {
            repoBtn.href = repo ? `https://github.com/${GITHUB_USERNAME}/${repo}` : `https://github.com/${GITHUB_USERNAME}`;
        }
        if (filesLink) {
            filesLink.href = repo ? `https://github.com/${GITHUB_USERNAME}/${repo}` : `https://github.com/${GITHUB_USERNAME}`;
        }
        if (linkBtn) {
            if (repo) {
                linkBtn.classList.remove('hidden');
                linkBtn.href = `https://github.com/${GITHUB_USERNAME}/${repo}`;
            } else {
                linkBtn.classList.add('hidden');
            }
        }

        // Show Modal
        try {
            dialog.showModal();
            document.documentElement.classList.add('modal-open');
            document.body.style.overflow = 'hidden';
            console.log("Modal opened successfully.");
        } catch (err) {
            console.error("Failed to show modal:", err);
        }

        // Fetch Data
        if (repo && readmeContainer) {
            loadReadme(repo);
            loadRepoStats(repo);
        } else if (readmeContainer) {
            readmeContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center py-20 text-slate-400">
                    <span class="material-symbols-outlined text-6xl mb-4 opacity-20">lock</span>
                    <p class="font-mono text-sm uppercase font-bold">Private Repository or Document Unavailable</p>
                    <p class="text-xs mt-2 opacity-60 text-center max-w-xs">Detailed documentation for this project is currently restricted. Please view the card summary for details.</p>
                </div>
            `;
            if (starsText) starsText.textContent = 'N/A';
            if (forksText) forksText.textContent = 'N/A';
        }
    };

    const loadReadme = async (repo) => {
        readmeContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center py-20 text-slate-400">
                <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                <p class="font-mono text-sm tracking-widest uppercase font-bold animate-pulse">Syncing with GitHub...</p>
            </div>
        `;

        try {
            // First try main, then master
            let response = await fetch(`https://raw.githubusercontent.com/${GITHUB_USERNAME}/${repo}/main/README.md`);
            if (!response.ok) {
                response = await fetch(`https://raw.githubusercontent.com/${GITHUB_USERNAME}/${repo}/master/README.md`);
            }

            if (response.ok) {
                const markdown = await response.text();
                // Render with marked
                if (window.marked) {
                    readmeContainer.innerHTML = marked.parse(markdown);
                } else {
                    readmeContainer.innerHTML = `<pre class="whitespace-pre-wrap">${markdown}</pre>`;
                }
            } else {
                throw new Error('README not found');
            }
        } catch (error) {
            readmeContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center py-20 text-slate-400">
                    <span class="material-symbols-outlined text-6xl mb-4 opacity-20">error</span>
                    <p class="font-mono text-sm uppercase font-bold">Failed to load documentation</p>
                    <p class="text-xs mt-2 opacity-60">The README could not be retrieved from GitHub.</p>
                </div>
            `;
        }
    };

    const loadRepoStats = async (repo) => {
        try {
            const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${repo}`);
            if (response.ok) {
                const data = await response.json();
                if (starsText) starsText.textContent = data.stargazers_count;
                if (forksText) forksText.textContent = data.forks_count;
            } else {
                if (starsText) starsText.textContent = '0';
                if (forksText) forksText.textContent = '0';
            }
        } catch (e) {
            if (starsText) starsText.textContent = '?';
            if (forksText) forksText.textContent = '?';
        }
    };

    const close = () => {
        dialog.close();
        document.documentElement.classList.remove('modal-open');
        document.body.style.overflow = '';
    };

    return { init, open };
})();

// Hardened initialization to handle race conditions
(function () {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => projectModalController.init());
    } else {
        projectModalController.init();
    }
})();
