document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    loadCertifications();
});

async function loadProjects() {
    const container = document.getElementById('projects-list-container');
    if (!container) return;

    try {
        const response = await fetch('/api/data/projects');
        const projects = await response.json();

        if (!Array.isArray(projects)) return;

        projects.forEach(project => {
            const html = `
            <article data-category="${project.category.toLowerCase().replace(/\s+/g, '-')}"
                data-description="${project.description}"
                class="project-item group relative flex flex-col bg-white dark:bg-[#1c2333] rounded-xl border border-gray-200 dark:border-[#283045] overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 animate-fade-in h-full">
                <div class="w-full h-48 bg-gray-100 dark:bg-[#151a25] relative overflow-hidden shrink-0">
                    <div class="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                        style="background-image: url('${project.image}');">
                    </div>
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                    </div>
                    <div class="absolute bottom-4 left-4">
                        <span class="px-2 py-1 bg-black/50 backdrop-blur text-xs font-bold text-white rounded border border-white/20">
                            ${project.category}
                        </span>
                    </div>
                </div>
                <div class="flex-1 p-6 flex flex-col gap-4">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                                ${project.title}
                            </h3>
                            <p class="text-slate-500 dark:text-slate-400 text-sm mt-1 line-clamp-1">
                                ${project.tags.join(', ')}
                            </p>
                        </div>
                        <div class="flex gap-2">
                             <a aria-label="View Code" href="${project.link}" target="_blank"
                                class="p-2 rounded-lg bg-gray-100 dark:bg-[#283045] text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-colors">
                                <span class="material-symbols-outlined text-xl">open_in_new</span>
                            </a>
                        </div>
                    </div>
                    
                    <div class="space-y-1">
                        <p class="font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-1 text-sm">
                             Description
                        </p>
                        <p class="text-slate-600 dark:text-slate-400 leading-relaxed text-sm line-clamp-3">
                            ${project.description}
                        </p>
                    </div>

                    <div class="space-y-2 pt-2 border-t border-gray-100 dark:border-[#283045] mt-auto">
                        <p class="font-semibold text-slate-900 dark:text-slate-200 text-xs">Key Concepts</p>
                        <div class="flex flex-wrap gap-2">
                             ${project.tags.slice(0, 3).map(tag => `
                                <span class="px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 text-[10px] font-medium">
                                    ${tag}
                                </span>
                             `).join('')}
                        </div>
                    </div>
                </div>
            </article>
            `;
            // Append to container
            container.insertAdjacentHTML('beforeend', html);
        });

    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

async function loadCertifications() {
    const container = document.getElementById('certifications-list-container');
    if (!container) return;

    try {
        const response = await fetch('/api/data/certifications');
        const certs = await response.json();

        if (!Array.isArray(certs)) return;

        certs.forEach(cert => {
            const html = `
            <div class="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
                <div class="relative h-40 w-full overflow-hidden bg-gray-100">
                    <div class="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20"></div>
                    <img alt="${cert.title}"
                        class="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                        src="${cert.image}" />
                    <div class="absolute top-3 left-3 rounded-md bg-white/90 px-2 py-1 text-xs font-bold text-primary shadow-sm backdrop-blur-sm">
                        ${cert.category}
                    </div>
                </div>
                <div class="flex flex-1 flex-col p-5">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                             ${new Date(cert.createdAt).toLocaleDateString()}
                        </span>
                        <span class="material-symbols-outlined text-green-500 text-lg" title="Verified">verified</span>
                    </div>
                    <h3 class="text-lg font-bold text-[#111318] dark:text-white mb-2 group-hover:text-primary transition-colors">
                        ${cert.title}
                    </h3>
                    <p class="text-sm text-[#616f89] dark:text-gray-400 mb-4 line-clamp-2">
                        ${cert.description}
                    </p>
                    <div class="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <span class="text-xs font-medium text-gray-500">ID: CUSTOM-${cert.id}</span>
                        <a class="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
                            href="${cert.link}" target="_blank">
                            View Credential <span class="material-symbols-outlined text-sm">open_in_new</span>
                        </a>
                    </div>
                </div>
            </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        });

    } catch (error) {
        console.error('Error loading certifications:', error);
    }
}
