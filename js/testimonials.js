/**
 * testimonials.js
 * Handles the testimonials carousel with responsive display.
 */

document.addEventListener('DOMContentLoaded', () => {
    initTestimonialsCarousel();
});

async function initTestimonialsCarousel() {
    const container = document.getElementById('testimonials-track');
    if (!container) return;

    try {
        const response = await fetch('data/testimonials.json');
        if (!response.ok) throw new Error('Failed to load testimonials');
        const testimonials = await response.json();

        new TestimonialCarousel(testimonials, container);
    } catch (error) {
        console.error('Error loading testimonials:', error);
    }
}

class TestimonialCarousel {
    constructor(data, container) {
        this.data = data;
        this.container = container;
        this.currentIndex = 0;
        this.autoPlayInterval = null;
        this.itemsPerPage = 1; // Default

        this.resizeObserver = new ResizeObserver(() => this.updateLayout());
        this.resizeObserver.observe(this.container.parentElement);

        this.init();
    }

    init() {
        this.createControls();
        this.updateLayout();
        this.startAutoPlay();

        // Pause on hover
        const wrapper = document.getElementById('testimonials-wrapper');
        wrapper.addEventListener('mouseenter', () => this.stopAutoPlay());
        wrapper.addEventListener('mouseleave', () => this.startAutoPlay());
    }

    createControls() {
        const wrapper = document.getElementById('testimonials-wrapper');

        // Prev/Next Buttons
        const prevBtn = document.createElement('button');
        prevBtn.className = 'absolute top-1/2 -left-4 md:-left-12 transform -translate-y-1/2 p-2 rounded-full bg-white dark:bg-[#1c2333] shadow-lg text-primary hover:scale-110 transition-transform z-10';
        prevBtn.innerHTML = '<span class="material-symbols-outlined">chevron_left</span>';
        prevBtn.onclick = () => this.slide('prev');

        const nextBtn = document.createElement('button');
        nextBtn.className = 'absolute top-1/2 -right-4 md:-right-12 transform -translate-y-1/2 p-2 rounded-full bg-white dark:bg-[#1c2333] shadow-lg text-primary hover:scale-110 transition-transform z-10';
        nextBtn.innerHTML = '<span class="material-symbols-outlined">chevron_right</span>';
        nextBtn.onclick = () => this.slide('next');

        wrapper.appendChild(prevBtn);
        wrapper.appendChild(nextBtn);

        // Dots Container
        this.dotsContainer = document.getElementById('testimonial-dots');
    }

    updateLayout() {
        const width = window.innerWidth;
        if (width >= 1024) this.itemsPerPage = 3;
        else if (width >= 768) this.itemsPerPage = 2;
        else this.itemsPerPage = 1;

        this.render();
    }

    render() {
        this.container.innerHTML = '';

        const visibleItems = [];
        for (let i = 0; i < this.itemsPerPage; i++) {
            const index = (this.currentIndex + i) % this.data.length;
            visibleItems.push(this.data[index]);
        }

        visibleItems.forEach((item, i) => {
            const card = document.createElement('div');
            // Flex basis logic
            const flexBasis = 100 / this.itemsPerPage;
            card.className = 'flex-shrink-0 px-4 transition-all duration-500';
            card.style.width = `${flexBasis}%`;

            card.innerHTML = `
                <div class="tilt-card h-full p-8 rounded-3xl bg-[#f8fafc] dark:bg-[#1e293b] border border-[#e2e8f0] dark:border-[#334155] shadow-sm flex flex-col items-center text-center">
                    <div class="flex items-center gap-4 mb-6">
                        <div class="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                            ${item.avatar}
                        </div>
                        <div class="text-left">
                            <h4 class="font-bold text-[#172554] dark:text-white">${item.name}</h4>
                            <p class="text-sm text-[#64748b] dark:text-[#94a3b8]">${item.role}</p>
                        </div>
                    </div>
                    <p class="text-[#334155] dark:text-[#cbd5e1] leading-relaxed italic mb-6">
                        "${item.content}"
                    </p>
                    <div class="mt-auto flex text-yellow-400">
                        ${'star '.repeat(item.rating).trim().split(' ').map(s => `<span class="material-symbols-outlined fill-current">${s}</span>`).join('')}
                    </div>
                </div>
            `;
            this.container.appendChild(card);
        });

        // Re-init tilt if needed (assuming tilt logic listens to new DOM elements or uses event delegation)
        if (typeof initTiltEffect === 'function' && window.initTiltEffect) {
            // Often tilt libs need re-init, but our interactions.js uses event delegation (document.querySelectorAll inside initTiltEffect might need re-run or better delegation)
            // Checking interactions.js: it selects on init. So we need to re-run it.
            // But interactions.js 'initTiltEffect' selects elements. 
            // We'll just call it if available globally.
            initTiltEffect();
        }

        this.updateDots();
    }

    updateDots() {
        if (!this.dotsContainer) return;
        this.dotsContainer.innerHTML = '';

        const totalSlides = this.data.length;
        // Depending on logic, dots usually represent start indices or pages. 
        // We'll make dots per item for simplicity.

        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('button');
            const isActive = i === this.currentIndex;
            dot.className = `w-2 h-2 rounded-full transition-all ${isActive ? 'bg-primary w-6' : 'bg-slate-300 dark:bg-slate-700 hover:bg-primary/50'}`;
            dot.onclick = () => {
                this.currentIndex = i;
                this.render();
                this.stopAutoPlay();
                this.startAutoPlay();
            };
            this.dotsContainer.appendChild(dot);
        }
    }

    slide(direction) {
        if (direction === 'next') {
            this.currentIndex = (this.currentIndex + 1) % this.data.length;
        } else {
            this.currentIndex = (this.currentIndex - 1 + this.data.length) % this.data.length;
        }
        this.render();
    }

    startAutoPlay() {
        if (this.autoPlayInterval) clearInterval(this.autoPlayInterval);
        this.autoPlayInterval = setInterval(() => this.slide('next'), 5000);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) clearInterval(this.autoPlayInterval);
    }
}
