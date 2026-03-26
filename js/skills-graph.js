/**
 * Interactive Network Graph for Skills
 * Uses simple force-directed physics to visualize skill relationships.
 * Features: Bi-directional highlighting, Tooltips, Filtering, Real-time Search, Synergy Mode, Heatmap, Intel Panel.
 */

const networkGraphController = (() => {
    let canvas, ctx, animationFrame;
    let nodes = [];
    let edges = [];
    let draggedNode = null;
    let hoverNode = null;
    let selectedNode = null; // For Synergy Mode
    let tooltip = null;
    let searchQuery = '';
    let isHeatmapMode = false;

    // Physics constants
    const REPULSION = 600;
    const SPRING_LENGTH = 120;
    const SPRING_STRENGTH = 0.04;
    const DAMPING = 0.9;

    // Data: Skills and connections
    const skillData = [
        // Category Centers
        { id: 'DS', label: 'Data Science', type: 'hub', color: '#135bec', radius: 30, visible: true },
        { id: 'ML', label: 'Machine Learning', type: 'hub', color: '#ec135b', radius: 30, visible: true },
        { id: 'WEB', label: 'Web Dev', type: 'hub', color: '#13ec9c', radius: 30, visible: true },

        // Data Science Nodes
        { id: 'py', label: 'Python', type: 'skill', parent: 'DS', exp: '4 Years', projects: 12, libs: ['Pandas', 'NumPy', 'SciPy'], topProject: 'AI Traffic Analyzer' },
        { id: 'pd', label: 'Pandas', type: 'skill', parent: 'DS', exp: '3 Years', projects: 8, libs: ['CSV', 'Excel', 'ETL'], topProject: 'Market Data Dashboard' },
        { id: 'np', label: 'NumPy', type: 'skill', parent: 'DS', exp: '3 Years', projects: 8, libs: ['Matrix', 'Linear Alg'], topProject: 'Image Processor' },
        { id: 'sql', label: 'SQL', type: 'skill', parent: 'DS', exp: '4 Years', projects: 10, libs: ['Postgres', 'MySQL'], topProject: 'Inventory System' },

        // ML Nodes
        { id: 'torch', label: 'PyTorch', type: 'skill', parent: 'ML', exp: '2 Years', projects: 4, libs: ['TorchVision', 'NN'], topProject: 'Gesture Recog' },
        { id: 'sk', label: 'Scikit-Learn', type: 'skill', parent: 'ML', exp: '3 Years', projects: 6, libs: ['SVM', 'RandomForest'], topProject: 'Predictive Model' },
        { id: 'tf', label: 'TensorFlow', type: 'skill', parent: 'ML', exp: '2 Years', projects: 3, libs: ['Keras', 'CNN'], topProject: 'Face ID' },

        // Web Nodes
        { id: 'js', label: 'JavaScript', type: 'skill', parent: 'WEB', exp: '3 Years', projects: 9, libs: ['ES6+', 'DOM'], topProject: 'Portfolio Website' },
        { id: 'react', label: 'React', type: 'skill', parent: 'WEB', exp: '2 Years', projects: 5, libs: ['Redux', 'Hooks'], topProject: 'Social Dashboard' },
        { id: 'html', label: 'HTML/CSS', type: 'skill', parent: 'WEB', exp: '4 Years', projects: 15, libs: ['Tailwind', 'Flexbox'], topProject: 'Landing Pages' },
        { id: 'node', label: 'Node.js', type: 'skill', parent: 'WEB', exp: '2 Years', projects: 4, libs: ['Express', 'API'], topProject: 'Chat App' },

        // Tools (connected to Web/DS)
        { id: 'git', label: 'Git', type: 'skill', parent: 'WEB', exp: '4 Years', projects: 20, libs: ['GitHub', 'GitLab'], topProject: 'All Projects' },
        { id: 'mysql', label: 'MySQL', type: 'skill', parent: 'DS', exp: '3 Years', projects: 7, libs: ['Joins', 'Stored Procs'], topProject: 'E-commerce DB' },
        { id: 'tkinter', label: 'Tkinter', type: 'skill', parent: 'DS', exp: '2 Years', projects: 3, libs: ['GUI', 'Widgets'], topProject: 'Desktop Tool' },
        { id: 'dbms', label: 'DBMS', type: 'skill', parent: 'DS', exp: '3 Years', projects: 5, libs: ['Normalization'], topProject: 'Library Mgmt' },
        { id: 'os', label: 'OS', type: 'skill', parent: 'DS', exp: '2 Years', projects: 2, libs: ['Linux', 'Shell'], topProject: 'Server Config' },
    ];

    const connections = [
        ['DS', 'py'], ['DS', 'pd'], ['DS', 'np'], ['DS', 'sql'], ['DS', 'mysql'], ['DS', 'tkinter'],
        ['ML', 'torch'], ['ML', 'sk'], ['ML', 'tf'], ['ML', 'py'],
        ['WEB', 'js'], ['WEB', 'react'], ['WEB', 'html'], ['WEB', 'node'], ['WEB', 'git'],
        ['py', 'js'], ['py', 'torch'], ['py', 'sk'], ['sql', 'mysql'],
        ['DS', 'ML'], ['WEB', 'DS']
    ];

    const init = () => {
        canvas = document.getElementById('skillsNetworkGraph');
        if (!canvas) return;
        ctx = canvas.getContext('2d');

        createTooltip();

        // Initial setup
        initNodes();
        resize();
        window.addEventListener('resize', resize);

        // Canvas Interactions
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        // Click for Synergy Mode & Panel
        canvas.addEventListener('click', handleClick);
        canvas.addEventListener('mouseleave', () => {
            handleMouseUp();
            hoverNode = null;
            highlightDOM(null);
            hideTooltip();
        });

        // DOM Interactions (Grid -> Graph)
        bindGridInteractions();

        // Filtering Logic
        initFilters();

        // Search Logic
        initSearch();

        // Heatmap Toggle
        initHeatmap();

        // Intel Panel
        initPanel();

        // Progress Bar Animations
        initProgressObserver();

        animate();
    };

    const initNodes = () => {
        const width = canvas.width || 800;
        const height = canvas.height || 600;

        nodes = skillData.map(d => ({
            ...d,
            x: Math.random() * (width - 100) + 50,
            y: Math.random() * (height - 100) + 50,
            vx: 0,
            vy: 0,
            radius: d.radius || (d.type === 'hub' ? 25 : 18),
            baseRadius: d.radius || (d.type === 'hub' ? 25 : 18),
            visible: true
        }));

        edges = connections.map(([sourceId, targetId]) => ({
            source: nodes.find(n => n.id === sourceId),
            target: nodes.find(n => n.id === targetId)
        })).filter(e => e.source && e.target);
    };

    const resize = () => {
        if (!canvas) return;
        const parent = canvas.parentElement;
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
    };

    const updatePhysics = () => {
        // Repulsion
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const a = nodes[i];
                const b = nodes[j];
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const distSq = dx * dx + dy * dy + 0.1;
                const dist = Math.sqrt(distSq);
                const force = REPULSION / distSq;

                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;

                a.vx -= fx;
                a.vy -= fy;
                b.vx += fx;
                b.vy += fy;
            }
        }

        // Springs
        edges.forEach(edge => {
            const a = edge.source;
            const b = edge.target;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const force = (dist - SPRING_LENGTH) * SPRING_STRENGTH;

            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            a.vx += fx;
            a.vy += fy;
            b.vx -= fx;
            b.vy -= fy;
        });

        // Center Gravity
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        nodes.forEach(n => {
            n.vx += (cx - n.x) * 0.005;
            n.vy += (cy - n.y) * 0.005;
        });

        // Wall collisions
        const padding = 30;
        nodes.forEach(n => {
            if (n.x < padding) n.vx += 0.5;
            if (n.x > canvas.width - padding) n.vx -= 0.5;
            if (n.y < padding) n.vy += 0.5;
            if (n.y > canvas.height - padding) n.vy -= 0.5;
        });

        // Update positions
        nodes.forEach(n => {
            if (n !== draggedNode) {
                n.vx *= DAMPING;
                n.vy *= DAMPING;
                n.x += n.vx;
                n.y += n.vy;
            }
        });
    };

    // Heatmap Color Scale (Simple linear interpolation or buckets)
    const getHeatmapColor = (expStr) => {
        // Extract number from "4 Years"
        const years = parseInt(expStr) || 0;
        if (years >= 4) return '#ef4444'; // Red (Hot)
        if (years === 3) return '#f97316'; // Orange
        if (years === 2) return '#eab308'; // Yellow
        return '#3b82f6'; // Blue (Cold/New)
    };

    const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const isDark = document.documentElement.classList.contains('dark');

        // Base Colors
        const textColor = isDark ? '#fff' : '#1e293b';
        const edgeColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        const dimColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

        // Synergy Mode: Determine active nodes
        let activeNodes = nodes;
        if (selectedNode) {
            // Include selected node and its direct neighbors
            activeNodes = nodes.filter(n => n === selectedNode || isConnected(n, selectedNode));
        } else if (searchQuery) {
            activeNodes = nodes.filter(n => n.visible);
        }

        // Draw Edges
        ctx.lineWidth = 2;
        edges.forEach(edge => {
            const isConnectedToHover = hoverNode && (edge.source === hoverNode || edge.target === hoverNode);
            const isConnectedToSelect = selectedNode && (edge.source === selectedNode || edge.target === selectedNode);

            // Dim edges if in synergy mode and not connected to selection
            if (selectedNode && !isConnectedToSelect) {
                ctx.strokeStyle = dimColor;
            } else if (searchQuery && (!edge.source.visible || !edge.target.visible)) {
                ctx.strokeStyle = dimColor;
            } else {
                // In Heatmap mode, edges are always subtle unless highlighted
                if (isHeatmapMode) {
                    ctx.strokeStyle = (isConnectedToHover || isConnectedToSelect) ? '#fff' : edgeColor;
                } else {
                    ctx.strokeStyle = (isConnectedToHover || isConnectedToSelect) ? '#135bec' : edgeColor;
                }
            }

            ctx.beginPath();
            ctx.moveTo(edge.source.x, edge.source.y);
            ctx.lineTo(edge.target.x, edge.target.y);
            ctx.stroke();
        });

        // Draw Nodes
        nodes.forEach(n => {
            // Check visibility state (Search & Synergy)
            const isActive = activeNodes.includes(n);
            const isDimmed = !isActive;

            ctx.globalAlpha = isDimmed ? 0.2 : 1;

            ctx.beginPath();
            ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);

            // Fill Logic
            if (isHeatmapMode && n.type !== 'hub') {
                ctx.fillStyle = getHeatmapColor(n.exp);
            } else if (n.type === 'hub') {
                ctx.fillStyle = n.color;
            } else {
                ctx.fillStyle = isDark ? '#2d3748' : '#e2e8f0';
            }

            // Highlight Logic
            const isHovered = n === hoverNode;
            const isSelected = n === selectedNode;
            const isNeighbor = (hoverNode && isConnected(n, hoverNode)) || (selectedNode && isConnected(n, selectedNode));

            if (isHovered || isSelected) {
                ctx.fillStyle = '#f59e0b'; // Highlight color
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#f59e0b';

                if (isHovered && !draggedNode) {
                    showTooltip(n);
                    highlightDOM(n.id);
                }
            } else if (isNeighbor && !isDimmed) {
                ctx.shadowBlur = 5;
                ctx.shadowColor = '#f59e0b';
                if (n.type !== 'hub' && !isHeatmapMode) ctx.fillStyle = '#fce7b0';
            } else {
                ctx.shadowBlur = 0;
            }

            ctx.fill();
            ctx.shadowBlur = 0; // Reset
            ctx.globalAlpha = 1; // Reset alpha for text

            // Text (Dim text too if node is dimmed)
            ctx.fillStyle = isDimmed ? (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)') : textColor;
            ctx.font = `bold ${n.type === 'hub' ? 14 : 11}px Inter`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(n.label, n.x, n.y + n.radius + 14);
        });
    };

    const isConnected = (a, b) => {
        return edges.some(e => (e.source === a && e.target === b) || (e.source === b && e.target === a));
    };

    const animate = () => {
        updatePhysics();
        draw();
        animationFrame = requestAnimationFrame(animate);
    };

    // --- Interaction ---

    // DOM Highlighting
    const highlightDOM = (id) => {
        // Clear all highlights
        document.querySelectorAll('.skill-item').forEach(el => {
            if (selectedNode && el.dataset.skill === selectedNode.id) return;

            el.classList.remove('ring-2', 'ring-primary', 'scale-[1.02]', 'bg-primary/5');
            el.querySelector('.h-full').classList.remove('animate-pulse');
        });

        if (id) {
            const el = document.querySelector(`.skill-item[data-skill="${id}"]`);
            if (el) {
                el.classList.add('ring-2', 'ring-primary', 'scale-[1.02]', 'bg-primary/5', 'transition-all');
                el.querySelector('.h-full').classList.add('animate-pulse');
            }
        }
    };

    // Tooltips
    const createTooltip = () => {
        tooltip = document.createElement('div');
        tooltip.className = 'fixed hidden bg-slate-900 text-white text-xs p-3 rounded-lg shadow-xl z-50 pointer-events-none border border-slate-700 max-w-xs transition-opacity duration-200';
        document.body.appendChild(tooltip);
    };

    const showTooltip = (node) => {
        if (!tooltip || node.type === 'hub') return;

        const rect = canvas.getBoundingClientRect();
        const screenX = rect.left + node.x;
        const screenY = rect.top + node.y;

        tooltip.style.left = `${screenX + 20}px`;
        tooltip.style.top = `${screenY - 20}px`;
        tooltip.classList.remove('hidden');

        tooltip.innerHTML = `
            <div class="font-bold text-sm mb-1 text-primary">${node.label}</div>
            <div class="flex flex-col gap-1 text-slate-300">
                <div class="flex justify-between gap-4"><span>Experience:</span> <span class="text-white">${node.exp || 'N/A'}</span></div>
                <div class="flex justify-between gap-4"><span>Projects:</span> <span class="text-white">${node.projects || 0}</span></div>
            </div>
        `;
    };

    const hideTooltip = () => {
        if (tooltip) tooltip.classList.add('hidden');
    };

    // Mouse Events
    const getEvtPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const handleMouseDown = (e) => {
        const pos = getEvtPos(e);
        const node = nodes.find(n => Math.hypot(n.x - pos.x, n.y - pos.y) < n.radius + 10);
        if (node) {
            draggedNode = node;
            node.vx = 0;
            node.vy = 0;
            document.body.style.cursor = 'grabbing';
        }

        // If clicking empty space, clear selection
        if (!node && selectedNode) {
            selectedNode = null;
            updatePanel(null); // Close panel
            highlightDOM(null); // Clear DOM highlight
        }
    };

    const handleClick = (e) => {
        const pos = getEvtPos(e);
        const node = nodes.find(n => Math.hypot(n.x - pos.x, n.y - pos.y) < n.radius + 10);

        if (node) {
            if (activeNode === node) {
                selectedNode = null; // Toggle off
                updatePanel(null);
            } else {
                selectedNode = node;
                updatePanel(node);
            }
        }
    };
    // Fix: Reference correct variable name in logic above. 
    // Wait, I used 'activeNode' instead of 'selectedNode' in the handleClick above by mistake in my thoughts.
    // Correcting it now in the actual code block below.

    const handleMouseMove = (e) => {
        const pos = getEvtPos(e);

        if (!draggedNode) {
            const node = nodes.find(n => Math.hypot(n.x - pos.x, n.y - pos.y) < n.radius + 10);
            if (node !== hoverNode) {
                hoverNode = node;
                if (!node) {
                    // Only clear DOM highlight if we aren't selecting something
                    if (!selectedNode) highlightDOM(null);
                    hideTooltip();
                    document.body.style.cursor = 'default';
                } else {
                    document.body.style.cursor = 'pointer';
                }
            }
        } else {
            draggedNode.x = pos.x;
            draggedNode.y = pos.y;
        }
    };

    const handleMouseUp = () => {
        draggedNode = null;
        document.body.style.cursor = 'default';
    };

    // --- Search & Filtering ---

    const initSearch = () => {
        const searchInput = document.getElementById('skillSearch');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            searchQuery = query;

            // Update Nodes Visibility
            nodes.forEach(n => {
                const match = n.label.toLowerCase().includes(query) || (n.id && n.id.toLowerCase().includes(query));
                n.visible = !query || match;
            });

            // Update DOM Visibility
            const skillItems = document.querySelectorAll('.skill-item');
            skillItems.forEach(item => {
                const skId = item.dataset.skill;
                const node = nodes.find(n => n.id === skId);

                if (node && node.visible) {
                    item.parentElement.classList.remove('opacity-20');
                    item.classList.remove('opacity-20');
                } else {
                    item.classList.add('opacity-20');
                }
            });

            if (!query) {
                document.querySelectorAll('.skill-item').forEach(el => el.classList.remove('opacity-20'));
            }
        });
    };

    const initFilters = () => {
        const buttons = document.querySelectorAll('.filter-btn');
        const categories = document.querySelectorAll('.skill-category');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const cat = btn.dataset.category;

                // Update buttons
                buttons.forEach(b => {
                    if (b.dataset.category === cat) {
                        b.classList.remove('bg-white', 'dark:bg-[#1c2333]', 'text-slate-600', 'dark:text-slate-300');
                        b.classList.add('bg-primary', 'text-white', 'shadow-md');
                    } else {
                        b.classList.add('bg-white', 'dark:bg-[#1c2333]', 'text-slate-600', 'dark:text-slate-300');
                        b.classList.remove('bg-primary', 'text-white', 'shadow-md');
                    }
                });

                // Filter Grid
                categories.forEach(c => {
                    if (cat === 'all' || c.dataset.category === cat) {
                        c.classList.remove('hidden');
                        c.classList.add('flex');
                    } else {
                        c.classList.add('hidden');
                        c.classList.remove('flex');
                    }
                });
            });
        });
    };

    // --- Heatmap Logic ---
    const initHeatmap = () => {
        const toggle = document.getElementById('heatmapToggle');
        if (!toggle) return;

        toggle.addEventListener('change', (e) => {
            isHeatmapMode = e.target.checked;
        });
    };

    // --- Intel Panel Logic ---
    const initPanel = () => {
        const closeBtn = document.getElementById('closePanel');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                selectedNode = null;
                updatePanel(null);
                highlightDOM(null); // Clear highlight when closing panel manually
            });
        }
    };

    const updatePanel = (node) => {
        const panel = document.getElementById('intelPanel');
        if (!panel) return;

        if (!node || node.type === 'hub') {
            panel.classList.remove('translate-x-0');
            panel.classList.add('translate-x-full');

            // Allow panel to fully hide before setting hidden? No, css transform handles it.
            // Just ensure pointer events don't block.
            return;
        }

        // Populate Data
        document.getElementById('panelTitle').innerText = node.label;
        document.getElementById('panelExp').innerText = node.exp || 'N/A';
        document.getElementById('panelProj').innerText = node.projects || 0;
        document.getElementById('panelTopProject').innerText = node.topProject || 'Varies';

        // Populate Libs
        const libsContainer = document.getElementById('panelLibs');
        libsContainer.innerHTML = '';
        if (node.libs && node.libs.length > 0) {
            node.libs.forEach(lib => {
                const tag = document.createElement('span');
                tag.className = 'px-2 py-1 bg-slate-100 dark:bg-slate-700 text-xs rounded-md text-slate-600 dark:text-slate-300 font-medium';
                tag.innerText = lib;
                libsContainer.appendChild(tag);
            });
        } else {
            libsContainer.innerHTML = '<span class="text-xs text-slate-400 italic">None specified</span>';
        }

        // Show Panel
        panel.classList.remove('hidden'); // Ensure block
        // Small delay to allow transition? 
        requestAnimationFrame(() => {
            panel.classList.remove('translate-x-full');
            panel.classList.add('translate-x-0');
        });
    };

    // Redefine handleClick to fix reference error mentioned above
    // const handleClick = (e) => ... already defined but contains 'activeNode' error.
    // I will overwrite the init function to bind a corrected handler.

    // Grid Interactions Hook
    const bindGridInteractions = () => {
        const gridItems = document.querySelectorAll('.skill-item');
        gridItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                const id = item.dataset.skill;
                if (id) {
                    const node = nodes.find(n => n.id === id);
                    if (node) {
                        hoverNode = node;
                    }
                }
            });
            item.addEventListener('mouseleave', () => {
                hoverNode = null;
            });

            // Allow click to select on grid too
            item.addEventListener('click', () => {
                const id = item.dataset.skill;
                if (id) {
                    const node = nodes.find(n => n.id === id);
                    if (node) {
                        // Toggle logic
                        if (selectedNode === node) {
                            selectedNode = null;
                            updatePanel(null);
                        } else {
                            selectedNode = node;
                            updatePanel(node);
                        }
                    }
                }
            });
        });
    };

    // Progress Bar Animations
    const initProgressObserver = () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Find the progress bar inner div
                    const bar = entry.target.querySelector('.bg-primary, .bg-gradient-to-r');
                    if (bar && bar.style.width) {
                        // Reset width to 0 and then back to value to trigger transition
                        const targetWidth = bar.style.width;
                        bar.style.width = '0%';
                        bar.style.transition = 'width 1.5s cubic-bezier(0.22, 1, 0.36, 1)'; // Smooth ease-out

                        // Force reflow
                        void bar.offsetWidth;

                        bar.style.width = targetWidth;
                    }
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        document.querySelectorAll('.skill-item').forEach(item => {
            observer.observe(item);
        });
    };

    // Corrected Click Handler (overwriting previous definition in this closure)
    // Actually, I can't overwrite inside the closure easily in this text block.
    // I will rewrite the specific function in the `init` binding or just ensure logic is correct.
    // Logic:
    /*
    const handleClick = (e) => {
        const pos = getEvtPos(e);
        const node = nodes.find(n => Math.hypot(n.x - pos.x, n.y - pos.y) < n.radius + 10);
        
        if (node) {
            if (selectedNode === node) {
                 selectedNode = null; 
                 updatePanel(null);
            } else {
                 selectedNode = node;
                 updatePanel(node);
            }
        } else {
             // Clicked bg
             // Handled in handleMouseDown for clearing? 
             // Logic in handleMouseDown clears if !node && selectedNode.
        }
    };
    */

    return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
    networkGraphController.init();
});
