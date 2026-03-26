/**
 * Theme handling for the portfolio website.
 * Manages dark/light mode preference using localStorage and system preferences.
 */

const themeController = (() => {
    // Constants
    const STORAGE_KEY = 'theme-preference';
    const DARK_CLASS = 'dark';

    /**
     * Get the initial theme based on storage or system preference
     * @returns {string} 'dark' or 'light'
     */
    const getInitialTheme = () => {
        // Check local storage
        const persistedPreference = localStorage.getItem(STORAGE_KEY);
        if (persistedPreference) {
            return persistedPreference;
        }

        // Check system preference
        const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        return systemPreference;
    };

    /**
     * Apply the theme to the HTML element
     * @param {string} theme - 'dark' or 'light'
     */
    const applyTheme = (theme) => {
        const root = document.documentElement;

        if (theme === 'dark') {
            root.classList.add(DARK_CLASS);
        } else {
            root.classList.remove(DARK_CLASS);
        }

        // Save to storage
        localStorage.setItem(STORAGE_KEY, theme);

        // Update button icons if they exist
        updateToggleButtons(theme);
    };

    /**
     * Update all toggle buttons on the page with the correct icon
     * @param {string} currentTheme 
     */
    const updateToggleButtons = (currentTheme) => {
        const buttons = document.querySelectorAll('.theme-toggle');

        buttons.forEach(btn => {
            const iconSpan = btn.querySelector('.material-symbols-outlined');
            if (iconSpan) {
                // If current theme is dark, show 'light_mode' (sun) to switch to light
                // If current theme is light, show 'dark_mode' (moon) to switch to dark
                // OR: Show the icon representing the CURRENT mode? 
                // Convention: Show the icon of the mode you will SWITCH TO.
                // Light mode -> Show Moon. Dark mode -> Show Sun.
                iconSpan.textContent = currentTheme === 'dark' ? 'light_mode' : 'dark_mode';
            }
        });
    };

    /**
     * Initialize the theme
     */
    const init = () => {
        const currentTheme = getInitialTheme();
        applyTheme(currentTheme);

        // Listen for system changes if no override is set? 
        // For simplicity, we just stick to manual toggle once usage happens.
    };

    /**
     * Toggle the theme
     */
    const toggle = () => {
        const root = document.documentElement;
        const isDark = root.classList.contains(DARK_CLASS);
        const newTheme = isDark ? 'light' : 'dark';
        applyTheme(newTheme);

        // Play sound if controller exists
        if (typeof soundController !== 'undefined') {
            soundController.play('click');
        }
    };

    // Initialize immediately to prevent flash
    init();

    // Return public API
    return {
        toggle
    };
})();

// Expose to window for button onclick handlers
window.toggleTheme = themeController.toggle;

// Re-run icon update on DOMContentLoaded in case script runs before buttons exist
document.addEventListener('DOMContentLoaded', () => {
    // Current state check
    const isDark = document.documentElement.classList.contains('dark');
    // Using internal function isn't cleaner without exposing it, but we can infer state
    // Just force a UI update based on current class
    const buttons = document.querySelectorAll('.theme-toggle');
    buttons.forEach(btn => {
        const iconSpan = btn.querySelector('.material-symbols-outlined');
        if (iconSpan) {
            iconSpan.textContent = isDark ? 'light_mode' : 'dark_mode';
        }
    });

    // Initialize Back to Top Button
    backToTopController.init();
});

/**
 * Back to Top Button Controller
 */
const backToTopController = (() => {
    const init = () => {
        // Create button element
        const btn = document.createElement('button');
        btn.innerHTML = '<span class="material-symbols-outlined text-xl">arrow_upward</span>';
        btn.className = 'fixed bottom-6 right-6 md:bottom-10 md:right-10 p-3 rounded-full bg-primary text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:bg-blue-600 hover:-translate-y-1 transition-all duration-300 z-50 opacity-0 translate-y-10 invisible';
        btn.ariaLabel = 'Back to Top';

        document.body.appendChild(btn);

        // Scroll handler
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                btn.classList.remove('opacity-0', 'translate-y-10', 'invisible');
                btn.classList.add('opacity-100', 'translate-y-0', 'visible');
            } else {
                btn.classList.add('opacity-0', 'translate-y-10', 'invisible');
                btn.classList.remove('opacity-100', 'translate-y-0', 'visible');
            }
        });

        // Click handler
        btn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    };

    return { init };
})();

/**
 * Reading Progress Bar Controller
 */
const readingProgressController = (() => {
    const init = () => {
        const progressBar = document.createElement('div');
        progressBar.className = 'fixed top-0 left-0 h-1 bg-gradient-to-r from-primary to-purple-500 z-[100] transition-all duration-100 ease-out';
        progressBar.style.width = '0%';
        document.body.appendChild(progressBar);

        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            progressBar.style.width = `${scrollPercent}%`;
        });
    };

    return { init };
})();



/**
 * Project Like Button Controller
 */
const likeButtonController = (() => {
    const init = () => {
        // Delegate event listener for dynamic buttons
        document.body.addEventListener('click', (e) => {
            const btn = e.target.closest('.like-btn');
            if (btn) {
                const projectId = btn.dataset.id;
                toggleLike(projectId, btn);
            }
        });

        // Restore state on load
        restoreLikes();
    };

    const toggleLike = (id, btn) => {
        const icon = btn.querySelector('.material-symbols-outlined');
        const likes = JSON.parse(localStorage.getItem('project-likes') || '{}');

        if (likes[id]) {
            delete likes[id];
            icon.classList.remove('fill-current', 'text-red-500');
            icon.classList.add('text-slate-600', 'dark:text-slate-300');
            btn.classList.remove('bg-red-50', 'dark:bg-red-900/20');
        } else {
            likes[id] = true;
            icon.classList.add('fill-current', 'text-red-500');
            icon.classList.remove('text-slate-600', 'dark:text-slate-300');
            btn.classList.add('bg-red-50', 'dark:bg-red-900/20');

            // Animation
            icon.animate([
                { transform: 'scale(1)' },
                { transform: 'scale(1.5)' },
                { transform: 'scale(1)' }
            ], { duration: 300 });
            soundController.play('success'); // Special sound for liking
        }

        localStorage.setItem('project-likes', JSON.stringify(likes));
    };

    const restoreLikes = () => {
        const likes = JSON.parse(localStorage.getItem('project-likes') || '{}');
        document.querySelectorAll('.like-btn').forEach(btn => {
            if (likes[btn.dataset.id]) {
                const icon = btn.querySelector('.material-symbols-outlined');
                icon.classList.add('fill-current', 'text-red-500');
                icon.classList.remove('text-slate-600', 'dark:text-slate-300');
                btn.classList.add('bg-red-50', 'dark:bg-red-900/20');
            }
        });
    };

    return { init };
})();

/**
 * Keyboard Shortcuts Controller
 */
const shortcutController = (() => {
    const init = () => {
        document.addEventListener('keydown', (e) => {
            // Ignore if typing in an input
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
                if (e.key === 'Escape') {
                    document.activeElement.blur();
                }
                return;
            }

            // Theme Toggle (T)
            if (e.key.toLowerCase() === 't') {
                themeController.toggle();
            }

            // Search Focus (/)
            if (e.key === '/') {
                e.preventDefault();
                const searchInput = document.getElementById('projectSearch');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    };

    return { init };
})();

// Initialize new features on load
const soundController = (() => {
    let audioCtx;

    const init = () => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) audioCtx = new AudioContext();
        } catch (e) { console.warn('Web Audio API not supported'); }

        // Attach hover sounds to interactive elements
        document.querySelectorAll('a, button, .project-item').forEach(el => {
            el.addEventListener('mouseenter', () => play('hover'));
        });
    };

    const play = (type) => {
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        const now = audioCtx.currentTime;

        if (type === 'click') {
            // Satisfying 'pop' or 'blip'
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'hover') {
            // Very subtle high tick
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(400, now);
            gain.gain.setValueAtTime(0.005, now); // Extremely quiet
            gain.gain.linearRampToValueAtTime(0, now + 0.03);
            osc.start(now);
            osc.stop(now + 0.03);
        } else if (type === 'success') {
            // High ping
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        }
    };

    return { init, play };
})();

const commandPaletteController = (() => {
    let isOpen = false;
    let selectedIndex = 0;

    // Command List
    const commands = [
        { icon: 'home', text: 'Go to Home', action: () => window.location.href = 'index.html' },
        { icon: 'person', text: 'Go to About', action: () => window.location.href = 'about.html' },
        { icon: 'work', text: 'Go to Experience', action: () => window.location.href = 'experience.html' },
        { icon: 'terminal', text: 'Go to Projects', action: () => window.location.href = 'projects.html' },
        { icon: 'mail', text: 'Contact Me', action: () => window.location.href = 'contact.html' },
        { icon: 'dark_mode', text: 'Toggle Theme', action: () => themeController.toggle() },
        {
            icon: 'search', text: 'Search Projects', action: () => {
                window.location.href = 'projects.html';
                setTimeout(() => document.getElementById('projectSearch')?.focus(), 500);
            }
        },
        { icon: 'description', text: 'View Resume', action: () => window.location.href = 'resume.html' }
    ];

    const init = () => {
        // Inject HTML
        const modalHTML = `
            <div id="cmd-palette" class="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm hidden flex items-start justify-center pt-[20vh] transition-opacity duration-200 opacity-0">
                <div class="w-full max-w-lg bg-white dark:bg-[#1c2333] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transform scale-95 transition-all duration-200">
                    <div class="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                        <span class="material-symbols-outlined text-slate-400 mr-2">search</span>
                        <input type="text" id="cmd-input" placeholder="Type a command or search..." 
                            class="w-full bg-transparent border-none text-slate-800 dark:text-white placeholder-slate-400 focus:ring-0 text-lg">
                        <span class="text-xs text-slate-400 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded">ESC</span>
                    </div>
                    <div id="cmd-list" class="max-h-[60vh] overflow-y-auto py-2">
                        <!-- Populated by JS -->
                    </div>
                    <div class="bg-slate-50 dark:bg-[#151b28] px-4 py-2 text-xs text-slate-400 flex justify-between">
                        <span><span class="font-bold">↑↓</span> to navigate</span>
                        <span><span class="font-bold">↵</span> to select</span>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Listeners
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                toggle();
            }
            if (isOpen) {
                if (e.key === 'Escape') toggle(false);
                if (e.key === 'ArrowDown') moveSelection(1);
                if (e.key === 'ArrowUp') moveSelection(-1);
                if (e.key === 'Enter') executeSelected();
            }
        });

        const input = document.getElementById('cmd-input');
        input.addEventListener('input', (e) => renderList(e.target.value));

        // Close on click outside
        document.getElementById('cmd-palette').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) toggle(false);
        });
    };

    const toggle = (force) => {
        const modal = document.getElementById('cmd-palette');
        const input = document.getElementById('cmd-input');

        isOpen = force !== undefined ? force : !isOpen;

        if (isOpen) {
            modal.classList.remove('hidden');
            // Small delay to allow display block to apply before opacity transition
            setTimeout(() => {
                modal.classList.remove('opacity-0');
                modal.querySelector('div').classList.remove('scale-95');
                modal.querySelector('div').classList.add('scale-100');
            }, 10);
            input.value = '';
            input.focus();
            renderList();
        } else {
            modal.classList.add('opacity-0');
            modal.querySelector('div').classList.remove('scale-100');
            modal.querySelector('div').classList.add('scale-95');
            setTimeout(() => modal.classList.add('hidden'), 200);
        }
    };

    const renderList = (filter = '') => {
        const list = document.getElementById('cmd-list');
        list.innerHTML = '';

        const filtered = commands.filter(cmd => cmd.text.toLowerCase().includes(filter.toLowerCase()));
        selectedIndex = 0;

        filtered.forEach((cmd, index) => {
            const item = document.createElement('div');
            item.className = `flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${index === 0 ? 'bg-primary/10 text-primary border-l-2 border-primary' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`;
            item.innerHTML = `
                <span class="material-symbols-outlined text-[20px]">${cmd.icon}</span>
                <span class="font-medium">${cmd.text}</span>
            `;
            item.addEventListener('click', () => {
                cmd.action();
                toggle(false);
            });
            // highlight logic
            item.dataset.index = index;
            list.appendChild(item);
        });

        if (filtered.length === 0) {
            list.innerHTML = `<div class="p-4 text-center text-slate-400">No matching commands</div>`;
        }
    };

    const moveSelection = (dir) => {
        const list = document.getElementById('cmd-list');
        const items = Array.from(list.children);
        if (!items.length) return;

        // Visual update
        items[selectedIndex].classList.remove('bg-primary/10', 'text-primary', 'border-l-2', 'border-primary');
        items[selectedIndex].classList.add('text-slate-600', 'dark:text-slate-300');

        selectedIndex += dir;
        if (selectedIndex < 0) selectedIndex = items.length - 1;
        if (selectedIndex >= items.length) selectedIndex = 0;

        const newItem = items[selectedIndex];
        newItem.classList.remove('text-slate-600', 'dark:text-slate-300', 'hover:bg-slate-50', 'dark:hover:bg-slate-800');
        newItem.classList.add('bg-primary/10', 'text-primary', 'border-l-2', 'border-primary');

        newItem.scrollIntoView({ block: 'nearest' });
    };

    const executeSelected = () => {
        const input = document.getElementById('cmd-input');
        const filter = input.value;
        const filtered = commands.filter(cmd => cmd.text.toLowerCase().includes(filter.toLowerCase()));

        if (filtered[selectedIndex]) {
            filtered[selectedIndex].action();
            toggle(false);
        }
    };

    return { init };
})();

const spotlightController = (() => {
    const init = () => {
        // Inject CSS
        const style = document.createElement('style');
        style.textContent = `
            .spotlight-card {
                position: relative;
                overflow: hidden;
            }
            .spotlight-card::before {
                content: '';
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                background: radial-gradient(600px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(19, 91, 236, 0.06), transparent 40%);
                opacity: 0;
                transition: opacity 0.3s;
                pointer-events: none;
                z-index: 10;
            }
            .spotlight-card:hover::before {
                opacity: 1;
            }
            /* Ensure text is above spotlight */
            .spotlight-card > * {
                position: relative;
                z-index: 20;
            }
        `;
        document.head.appendChild(style);

        // Targets: Project items and Experience cards
        // Experience cards are a bit complex, let's target the inner white/dark div
        const targets = document.querySelectorAll('.project-item, .group > .bg-white');

        targets.forEach(card => {
            card.classList.add('spotlight-card');
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
        });
    };

    return { init };
})();

const aiWidgetController = (() => {
    const init = () => {
        const widgetHTML = `
            <!-- Floating Action Button -->
            <button id="ai-fab" class="fixed bottom-6 right-6 z-[90] w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-full shadow-lg shadow-indigo-500/30 flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 animate-bounce-slow group backdrop-blur-md border border-white/20">
                <span class="material-symbols-outlined text-[28px] group-hover:rotate-12 transition-transform">smart_toy</span>
                <span class="absolute top-0 right-0 w-3.5 h-3.5 bg-[#27c93f] border-2 border-white dark:border-slate-900 rounded-full shadow-[0_0_8px_rgba(39,201,63,0.8)]"></span>
            </button>

            <!-- Chat Window -->
            <div id="ai-chat" class="fixed bottom-24 right-6 z-[90] w-80 md:w-96 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-indigo-500/10 border border-slate-200/50 dark:border-white/10 overflow-hidden text-sm transform origin-bottom-right scale-0 opacity-0 transition-all duration-300 flex flex-col">
                <!-- Header -->
                <div class="bg-gradient-to-r from-primary to-secondary p-4 flex items-center justify-between text-white relative">
                    <div class="absolute inset-0 bg-white/10 mix-blend-overlay"></div>
                    <div class="flex items-center gap-3 relative z-10">
                        <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <span class="material-symbols-outlined text-[18px]">smart_toy</span>
                        </div>
                        <div class="flex flex-col">
                            <span class="font-bold tracking-wide">Navari AI</span>
                            <span class="text-[10px] opacity-90 flex items-center gap-1.5 uppercase tracking-wider"><span class="w-1.5 h-1.5 bg-[#27c93f] rounded-full shadow-[0_0_5px_#27c93f]"></span> Online</span>
                        </div>
                    </div>
                    <button id="close-chat" class="relative z-10 hover:bg-white/20 rounded-full p-1.5 transition-colors"><span class="material-symbols-outlined text-[18px]">close</span></button>
                </div>

                <!-- Messages Area -->
                <div id="ai-messages" class="h-80 overflow-y-auto p-4 flex flex-col gap-3 bg-slate-50/50 dark:bg-slate-800/30">
                    <div class="flex gap-2 items-start">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0 text-white shadow-md">
                            <span class="material-symbols-outlined text-[16px]">smart_toy</span>
                        </div>
                        <div class="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 py-2 px-3.5 rounded-2xl rounded-tl-sm shadow-sm text-slate-700 dark:text-slate-200 leading-relaxed max-w-[85%]">
                            Hi there! I'm the AI assistant for this portfolio. How can I help you discover more about Yashwanth?
                        </div>
                    </div>
                </div>

                <!-- Input Area (Chips) -->
                <div class="p-4 bg-white/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800">
                    <div class="flex flex-wrap gap-2 justify-end" id="ai-chips">
                        <button class="ai-chip text-xs bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white px-3.5 py-1.5 rounded-full transition-all duration-200 border border-transparent hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 text-slate-600 dark:text-slate-300 font-medium tracking-wide">What is your tech stack?</button>
                        <button class="ai-chip text-xs bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white px-3.5 py-1.5 rounded-full transition-all duration-200 border border-transparent hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 text-slate-600 dark:text-slate-300 font-medium tracking-wide">Tell me about your experience</button>
                        <button class="ai-chip text-xs bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white px-3.5 py-1.5 rounded-full transition-all duration-200 border border-transparent hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 text-slate-600 dark:text-slate-300 font-medium tracking-wide">Are you open to work?</button>
                        <button class="ai-chip text-xs bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white px-3.5 py-1.5 rounded-full transition-all duration-200 border border-transparent hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 text-slate-600 dark:text-slate-300 font-medium tracking-wide">Show me a random project</button>
                    </div>
                </div>
                <!-- Dynamic Chat Input -->
                <div class="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2 shrink-0">
                    <input type="text" id="ai-input" placeholder="Ask me anything..." class="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-slate-800 dark:text-slate-200 shadow-sm transition-shadow">
                    <button id="ai-send" class="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white rounded-xl px-4 flex items-center justify-center transition-all shadow-md group">
                        <span class="material-symbols-outlined text-[18px] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">send</span>
                    </button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', widgetHTML);

        // Logic
        const fab = document.getElementById('ai-fab');
        const chat = document.getElementById('ai-chat');
        const close = document.getElementById('close-chat');
        const messages = document.getElementById('ai-messages');
        let isOpen = false;

        const toggleChat = (show) => {
            isOpen = show !== undefined ? show : !isOpen;
            if (isOpen) {
                chat.classList.remove('scale-0', 'opacity-0');
                fab.classList.add('scale-0', 'opacity-0'); // Hide FAB when open
            } else {
                chat.classList.add('scale-0', 'opacity-0');
                fab.classList.remove('scale-0', 'opacity-0');
            }
        };

        fab.addEventListener('click', () => toggleChat(true));
        close.addEventListener('click', () => toggleChat(false));

        // Responses
        const responses = {
            "What is your tech stack?": "I primarily work with Python, PyTorch, and React. I have extensive experience in building scalable ML pipelines and modern web applications.",
            "Tell me about your experience": "I've interned at Tech Corp as an ML Engineer and led the Senior Capstone Project. My focus is on turning data into actionable insights.",
            "Are you open to work?": "Yes! I am currently looking for full-time opportunities in Data Science and Software Engineering. Feel free to contact me!",
            "Show me a random project": "Check out my 'Library Management System' or the 'Sentiment Analysis' project in the Projects section. They showcase my full-stack capabilities."
        };

        document.querySelectorAll('.ai-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const text = chip.textContent;
                addMessage(text, 'user');

                // Simulate typing delay
                showTyping();
                setTimeout(() => {
                    removeTyping();
                    addMessage(responses[text] || "I'm not sure about that, but feel free to check out my Resume!", 'bot');
                }, 1500);
            });
        });

        const aiInput = document.getElementById('ai-input');
        const aiSend = document.getElementById('ai-send');

        const processUserQuery = (query) => {
            if(!query.trim()) return;
            addMessage(query, 'user');
            aiInput.value = '';
            
            showTyping();
            
            // Simple rule-based chatbot logic
            let reply = "That's an interesting question! I continually update my knowledge base to answer such nuanced queries.";
            const q = query.toLowerCase();
            
            if(q.includes("skills") || q.includes("tech") || q.includes("stack")) {
                reply = "Yashwanth excels in Python, Machine Learning (TensorFlow, Scikit-learn), Data Analysis (Pandas, SQL), and full-stack web development (React, Node, Tailwind).";
            } else if(q.includes("project") || q.includes("built") || q.includes("portfolio")) {
                reply = "Check out his 'Heart Disease Predictor' or 'Smart Parking System' in the Projects section. They demonstrate his ability to solve real-world problems.";
            } else if(q.includes("contact") || q.includes("email") || q.includes("hire")) {
                reply = "You can reach out to Yashwanth via the Contact section or email him at your@email.com! He's always open to new opportunities.";
            } else if(q.includes("experience") || q.includes("work") || q.includes("intern")) {
                reply = "He has strong foundational experience acting as an ML Engineering intern and leading massive capstone projects at university.";
            } else if(q.includes("hello") || q.includes("hi") || q.includes("hey")) {
                reply = "Hello there! Feel free to ask me anything about Yashwanth's skills, projects, or how to contact him!";
            }
            
            setTimeout(() => {
                removeTyping();
                addMessage(reply, 'bot');
            }, 1200);
        };

        aiSend.addEventListener('click', () => {
            processUserQuery(aiInput.value);
        });

        aiInput.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') {
                processUserQuery(aiInput.value);
            }
        });

        const addMessage = (text, sender) => {
            const div = document.createElement('div');
            div.className = `flex gap-2 items-start ${sender === 'user' ? 'justify-end' : ''} animate-fade-in`;

            if (sender === 'bot') {
                div.innerHTML = `
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0 text-white shadow-md">
                        <span class="material-symbols-outlined text-[16px]">smart_toy</span>
                    </div>
                    <div class="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 py-2 px-3.5 rounded-2xl rounded-tl-sm shadow-sm text-slate-700 dark:text-slate-200 leading-relaxed max-w-[85%]">
                        ${text}
                    </div>
                `;
            } else {
                div.innerHTML = `
                   <div class="bg-gradient-to-br from-primary to-secondary text-white py-2 px-3.5 rounded-2xl rounded-tr-sm shadow-md shadow-indigo-500/20 max-w-[85%] font-medium">
                        ${text}
                    </div>
                `;
            }
            messages.appendChild(div);
            messages.scrollTop = messages.scrollHeight;
        };

        const showTyping = () => {
            const typing = document.createElement('div');
            typing.id = 'ai-typing';
            typing.className = 'flex gap-2 items-start animate-fade-in';
            typing.innerHTML = `
                <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-primary text-xs">more_horiz</span>
                </div>
            `;
            messages.appendChild(typing);
            messages.scrollTop = messages.scrollHeight;
        };

        const removeTyping = () => {
            document.getElementById('ai-typing')?.remove();
        };
    };

    return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
    readingProgressController.init();
    likeButtonController.init();
    shortcutController.init();
    commandPaletteController.init();
    spotlightController.init();
});



const particleController = (() => {
    let canvas, ctx, animationFrame;
    let particles = [];
    const particleCount = 60;
    const connectionDistance = 150;
    const mouseParams = { x: null, y: null, radius: 150 };

    const init = () => {
        // Only run on desktop for performance
        if (window.innerWidth < 768) return;

        canvas = document.createElement('canvas');
        canvas.id = 'particle-canvas';
        canvas.className = 'fixed top-0 left-0 w-full h-full pointer-events-none z-[-15] opacity-30';
        document.body.prepend(canvas);
        ctx = canvas.getContext('2d');

        resize();
        window.addEventListener('resize', resize);
        document.addEventListener('mousemove', (e) => {
            mouseParams.x = e.x;
            mouseParams.y = e.y;
        });
        document.addEventListener('mouseleave', () => {
            mouseParams.x = null;
            mouseParams.y = null;
        });

        initParticles();
        animate();
    };

    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };

    const initParticles = () => {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1
            });
        }
    };

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const isDark = document.documentElement.classList.contains('dark');
        ctx.fillStyle = isDark ? '#ffffff' : '#3b82f6';
        ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(59, 130, 246, 0.1)';

        particles.forEach(p => {
            // Update
            p.x += p.vx;
            p.y += p.vy;

            // Bounce
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

            // Mouse interaction
            if (mouseParams.x != null) {
                let dx = mouseParams.x - p.x;
                let dy = mouseParams.y - p.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouseParams.radius) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (mouseParams.radius - distance) / mouseParams.radius;
                    const directionX = forceDirectionX * force * 0.6;
                    const directionY = forceDirectionY * force * 0.6;
                    p.x -= directionX;
                    p.y -= directionY;
                }
            }

            // Draw
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Connect
        connect();

        animationFrame = requestAnimationFrame(animate);
    };

    const connect = () => {
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                let dx = particles[a].x - particles[b].x;
                let dy = particles[a].y - particles[b].y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectionDistance) {
                    ctx.lineWidth = 1 - (distance / connectionDistance);
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    };

    return { init };
})();

const tiltController = (() => {
    const init = () => {
        const cards = document.querySelectorAll('.tilt-card, .project-item');

        cards.forEach(card => {
            card.addEventListener('mousemove', handleMove);
            card.addEventListener('mouseleave', handleLeave);
        });
    };

    const handleMove = (e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const centerX = rect.left + width / 2;
        const centerY = rect.top + height / 2;

        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;

        const rotateX = (mouseY / (height / 2)) * -5; // Max 5 deg
        const rotateY = (mouseX / (width / 2)) * 5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        card.style.transition = 'none'; // Removing transition for instant response
    };

    const handleLeave = (e) => {
        const card = e.currentTarget;
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        card.style.transition = 'transform 0.5s ease';
    };

    return { init };
})();

const typerController = (() => {
    const init = () => {
        const container = document.getElementById('typewriter-content');
        if (!container) return;

        const codeSnippets = [
            `import torch
import torch.nn as nn

class NeuralNet(nn.Module):
    def __init__(self):
        super(NeuralNet, self).__init__()
        self.conv1 = nn.Conv2d(1, 32, 3, 1)
        self.fc1 = nn.Linear(9216, 128)

    def forward(self, x):
        x = self.conv1(x)
        return x`,
            `const portfolio = {
    owner: "Navari Yashwanth Reddy",
    skills: ["Python", "React", "ML"],
    availableForHire: true,
    contact: () => {
        email.send("hire@me.com");
    }
};`,
            `def train_model(model, data):
    optimizer = optim.Adam(model.parameters())
    loss_fn = nn.CrossEntropyLoss()
    
    for epoch in range(100):
        optimizer.zero_grad()
        output = model(data)
        loss = loss_fn(output, target)
        loss.backward()
        optimizer.step()`
        ];

        let snippetIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        const type = () => {
            const currentSnippet = codeSnippets[snippetIndex];

            if (isDeleting) {
                container.textContent = currentSnippet.substring(0, charIndex - 1);
                charIndex--;
            } else {
                container.textContent = currentSnippet.substring(0, charIndex + 1);
                charIndex++;
            }

            let typeSpeed = isDeleting ? 30 : 50;

            if (!isDeleting && charIndex === currentSnippet.length) {
                typeSpeed = 2000; // Pause at end
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                snippetIndex = (snippetIndex + 1) % codeSnippets.length;
                typeSpeed = 500; // Pause before next
            }

            // Randomize typing speed slightly for realism
            if (!isDeleting) typeSpeed += Math.random() * 50;

            setTimeout(type, typeSpeed);
        };

        type();
    };

    return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
    readingProgressController.init();
    likeButtonController.init();
    shortcutController.init();
    soundController.init();
    commandPaletteController.init();
    spotlightController.init();
    aiWidgetController.init();
    particleController.init();
    tiltController.init();
    return { init };
})();

const achievementController = (() => {
    let unlocked = new Set();
    const achievements = {
        'theme_master': { title: 'Indecisive', desc: 'Toggled theme 5 times', icon: 'palette' },
        'konami_god': { title: 'Retro Gamer', desc: 'Found the Konami Code', icon: 'sports_esports' },
        'stalker': { title: 'Super Fan', desc: 'Visited every page', icon: 'visibility' },
        'night_owl': { title: 'Night Owl', desc: 'Visited after 10 PM', icon: 'bedtime' }
    };

    // State tracking
    let themeToggleCount = 0;

    const init = () => {
        // Load unlocked
        const saved = localStorage.getItem('achievements');
        if (saved) unlocked = new Set(JSON.parse(saved));

        // Listeners for triggers

        // 1. Theme Toggle
        const originalToggle = themeController.toggle;
        themeController.toggle = () => {
            originalToggle();
            themeToggleCount++;
            if (themeToggleCount === 5) unlock('theme_master');
        };

        // 2. Night Owl
        const hour = new Date().getHours();
        if (hour >= 22 || hour <= 4) unlock('night_owl');

        // 3. Konami Code (hook into interactions.js if possible, or just listen independently)
        window.addEventListener('konami-code-activated', () => unlock('konami_god'));

        // 4. Page Visits (simple tracking)
        const path = window.location.pathname;
        let visited = JSON.parse(localStorage.getItem('visited_pages') || '[]');
        if (!visited.includes(path)) {
            visited.push(path);
            localStorage.setItem('visited_pages', JSON.stringify(visited));
        }
        if (visited.length >= 5) unlock('stalker');
    };

    const unlock = (id) => {
        if (unlocked.has(id)) return;
        unlocked.add(id);
        localStorage.setItem('achievements', JSON.stringify([...unlocked]));

        const info = achievements[id];
        showToast(info.title, info.desc, info.icon);
        soundController.play('success');
    };

    const showToast = (title, desc, icon) => {
        const toast = document.createElement('div');
        toast.className = 'fixed top-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 z-[200] animate-bounce-in border border-primary/20 min-w-[300px]';
        toast.innerHTML = `
            <div class="h-12 w-12 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-500 shrink-0">
                <span class="material-symbols-outlined text-2xl">${icon}</span>
            </div>
            <div>
                <h4 class="font-bold text-sm uppercase tracking-wide text-primary">Achievement Unlocked!</h4>
                <p class="font-bold text-lg">${title}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">${desc}</p>
            </div>
        `;
        document.body.appendChild(toast);

        // Remove after 4s
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translate(-50%, -20px)';
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    };

    return { init, unlock }; // Expose unlock for other modules
})();

document.addEventListener('DOMContentLoaded', () => {
    readingProgressController.init();
    likeButtonController.init();
    shortcutController.init();
    soundController.init();
    commandPaletteController.init();
    spotlightController.init();
    aiWidgetController.init();
    particleController.init();
    tiltController.init();
    typerController.init();
    achievementController.init();
});
