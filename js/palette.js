/**
 * palette.js
 * Implements a VS Code-style Command Palette (Cmd/Ctrl + K)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Inject HTML structure
    const paletteHTML = `
        <div id="cmd-palette-overlay" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] opacity-0 pointer-events-none transition-opacity duration-200 flex py-16 sm:py-32 items-start justify-center">
            <div id="cmd-palette-modal" class="bg-[#1e293b] border border-slate-700 shadow-2xl rounded-xl w-full max-w-2xl overflow-hidden transform scale-95 transition-transform duration-200 flex flex-col mx-4">
                <div class="flex items-center gap-3 px-4 py-3 border-b border-slate-700 bg-[#0f172a]">
                    <span class="material-symbols-outlined text-emerald-500">terminal</span>
                    <input type="text" id="cmd-palette-input" class="w-full bg-transparent border-none text-white text-lg focus:outline-none focus:ring-0 placeholder-slate-500 font-mono" placeholder="Type a command or search..." autocomplete="off">
                    <span class="text-xs text-slate-500 border border-slate-700 rounded px-2 py-1 font-mono uppercase bg-slate-800">ESC</span>
                </div>
                <div id="cmd-palette-results" class="max-h-[60vh] overflow-y-auto py-2">
                    <!-- Results populated dynamically -->
                </div>
                <div class="px-4 py-2 border-t border-slate-700/50 bg-[#0f172a] flex justify-between items-center text-xs text-slate-400 font-mono">
                    <div class="flex gap-4">
                        <span class="flex items-center gap-1"><kbd class="bg-slate-700 rounded px-1 text-white">↑</kbd> <kbd class="bg-slate-700 rounded px-1 text-white">↓</kbd> to navigate</span>
                        <span class="flex items-center gap-1"><kbd class="bg-slate-700 rounded px-1 text-white">↵</kbd> to select</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', paletteHTML);
    
    const overlay = document.getElementById('cmd-palette-overlay');
    const modal = document.getElementById('cmd-palette-modal');
    const input = document.getElementById('cmd-palette-input');
    const resultsContainer = document.getElementById('cmd-palette-results');
    
    let isPaletteOpen = false;
    let selectedIndex = 0;
    
    // Define available commands
    const commands = [
        { title: "Home", shortcut: "H", path: "index.html", icon: "home", type: "Page" },
        { title: "About Me", shortcut: "A", path: "about.html", icon: "person", type: "Page" },
        { title: "Projects & Portfolio", shortcut: "P", path: "projects.html", icon: "code_blocks", type: "Page" },
        { title: "Experience & Timeline", shortcut: "E", path: "experience.html", icon: "work", type: "Page" },
        { title: "Skills & Tech Stack", shortcut: "S", path: "skills.html", icon: "psychology", type: "Page" },
        { title: "Certifications", shortcut: "C", path: "certifications.html", icon: "workspace_premium", type: "Page" },
        { title: "Contact Me", shortcut: "M", path: "contact.html", icon: "mail", type: "Page" },
        { title: "Toggle Dark/Light Theme", shortcut: "T", action: window.toggleTheme || (() => {}), icon: "dark_mode", type: "Action" },
        { title: "View Resume", shortcut: "R", path: "resume.html", icon: "description", type: "Page" },
        { title: "Download Resume PDF", shortcut: "", action: () => window.open('resume.pdf', '_blank'), icon: "download", type: "Action" }
    ];
    
    let filteredCommands = [...commands];
    
    // Toggle Palette
    function togglePalette() {
        isPaletteOpen = !isPaletteOpen;
        if (isPaletteOpen) {
            overlay.classList.remove('opacity-0', 'pointer-events-none');
            modal.classList.remove('scale-95');
            input.value = '';
            filterResults('');
            setTimeout(() => input.focus(), 50);
        } else {
            overlay.classList.add('opacity-0', 'pointer-events-none');
            modal.classList.add('scale-95');
            input.blur();
        }
    }
    
    // Keyboard Listeners
    document.addEventListener('keydown', (e) => {
        // Toggle on Cmd/Ctrl + K
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            togglePalette();
        }
        
        // Handle opened state
        if (isPaletteOpen) {
            if (e.key === 'Escape') {
                e.preventDefault();
                togglePalette();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, filteredCommands.length - 1);
                renderResults();
                scrollSelectedIntoView();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, 0);
                renderResults();
                scrollSelectedIntoView();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                executeCommand(filteredCommands[selectedIndex]);
            }
        }
    });

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            togglePalette();
        }
    });

    // Handle Input
    input.addEventListener('input', (e) => {
        filterResults(e.target.value);
    });

    // Filter Logic
    function filterResults(query) {
        query = query.toLowerCase().trim();
        if (!query) {
            filteredCommands = [...commands];
        } else {
            filteredCommands = commands.filter(cmd => 
                cmd.title.toLowerCase().includes(query) || 
                cmd.type.toLowerCase().includes(query)
            );
        }
        selectedIndex = 0;
        renderResults();
    }

    // Render Logic
    function renderResults() {
        resultsContainer.innerHTML = '';
        
        if (filteredCommands.length === 0) {
            resultsContainer.innerHTML = `
                <div class="px-6 py-8 text-center text-slate-500 font-mono">
                    <span class="material-symbols-outlined text-4xl mb-2 opacity-50">search_off</span>
                    <p>No commands found.</p>
                </div>
            `;
            return;
        }

        filteredCommands.forEach((cmd, index) => {
            const isSelected = index === selectedIndex;
            const item = document.createElement('div');
            item.className = `px-4 py-3 mx-2 rounded-lg cursor-pointer flex items-center justify-between group transition-colors ${isSelected ? 'bg-primary text-white' : 'text-slate-300 hover:bg-slate-800'}`;
            
            // Mouse hover selection tracking
            item.addEventListener('mouseenter', () => {
                selectedIndex = index;
                renderResults();
            });

            item.addEventListener('click', () => {
                executeCommand(cmd);
            });

            item.innerHTML = `
                <div class="flex items-center gap-3">
                    <span class="material-symbols-outlined ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-primary'}">${cmd.icon}</span>
                    <div class="flex flex-col">
                        <span class="font-medium font-sans">${cmd.title}</span>
                        <span class="text-[10px] uppercase tracking-wider font-bold ${isSelected ? 'text-blue-200' : 'text-slate-500'}">${cmd.type}</span>
                    </div>
                </div>
                ${cmd.shortcut ? `<kbd class="hidden sm:inline-block text-xs font-mono font-bold px-2 py-1 rounded bg-black/20 ${isSelected ? 'text-white border border-white/20' : 'text-slate-500 border border-slate-700'}">${cmd.shortcut}</kbd>` : ''}
            `;
            
            resultsContainer.appendChild(item);
        });
    }

    function scrollSelectedIntoView() {
        const selectedEl = resultsContainer.children[selectedIndex];
        if (selectedEl) {
            selectedEl.scrollIntoView({ block: 'nearest' });
        }
    }

    // Execute Command
    function executeCommand(cmd) {
        if (!cmd) return;
        togglePalette();
        if (cmd.path) {
            // Give a slight delay for the modal to animate closing before unmounting
            setTimeout(() => { window.location.href = cmd.path; }, 150);
        } else if (cmd.action) {
            setTimeout(() => { cmd.action(); }, 150);
        }
    }
});
