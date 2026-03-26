/**
 * blog-feed.js
 * Fetches and displays the latest blog posts on the landing page.
 */

document.addEventListener('DOMContentLoaded', () => {
    loadLatestPosts();
});

async function loadLatestPosts() {
    const container = document.getElementById('latest-posts-container');
    if (!container) return;

    try {
        const response = await fetch('data/blog-posts.json');
        if (!response.ok) throw new Error('Failed to load posts');

        const posts = await response.json();

        // Take top 3
        const recentPosts = posts.slice(0, 3);

        renderPosts(recentPosts, container);
    } catch (error) {
        console.error('Error loading blog posts:', error);
        container.innerHTML = '<p class="text-center text-slate-500">Failed to load latest insights.</p>';
    }
}

function renderPosts(posts, container) {
    container.innerHTML = posts.map((post, index) => `
        <article class="reveal flex flex-col h-full bg-white dark:bg-[#1c2333] rounded-2xl border border-slate-200 dark:border-[#283045] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group" style="transition-delay: ${index * 100}ms">
            <a href="${post.link}" class="block h-48 overflow-hidden relative">
                <img src="${post.image}" alt="${post.title}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                <div class="absolute top-4 left-4">
                    <span class="px-3 py-1 bg-white/90 dark:bg-black/80 backdrop-blur text-xs font-bold text-primary rounded-full uppercase tracking-wider shadow-sm">
                        ${post.category}
                    </span>
                </div>
            </a>
            <div class="p-6 flex flex-col flex-1">
                <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium">
                    <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">calendar_today</span> ${post.date}</span>
                    <span>•</span>
                    <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">schedule</span> ${post.readTime}</span>
                </div>
                <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-primary transition-colors leading-tight">
                    <a href="${post.link}">${post.title}</a>
                </h3>
                <p class="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-4 flex-1 leading-relaxed">
                    ${post.excerpt}
                </p>
                <a href="${post.link}" class="inline-flex items-center gap-1 text-sm font-bold text-primary group-hover:underline decoration-2 underline-offset-4">
                    Read Article <span class="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">arrow_forward</span>
                </a>
            </div>
        </article>
    `).join('');

    // Trigger scroll reveal for new elements if using the existing observer logic
    // But since they are added async, we might need to re-observe or manually add 'active' if already in view.
    // Ideally, the global IntersectionObserver observes these if we call it again.
    if (typeof initScrollReveal === 'function') {
        initScrollReveal();
    } else {
        // Fallback manual trigger
        setTimeout(() => {
            document.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
        }, 100);
    }
}
