(function() {
    const container = document.getElementById('project-carousel-container');
    if (!container || typeof THREE === 'undefined') return;

    // Projects data matching the repositories
    const projects = [
        { title: "Age & Gender Detection", category: "ML", repo: "age-gender-detection", color: 0x8b5cf6 },
        { title: "Heart Disease Prediction", category: "ML", repo: "heart-disease", color: 0xf43f5e },
        { title: "Fruit Leaf Disease", category: "ML", repo: "fruit-leaf-disease", color: 0x10b981 },
        { title: "Hospital Management", category: "WEB", repo: "Hospital-Management-System", color: 0x0ea5e9 },
        { title: "Credit Card Fraud", category: "ML", repo: "credit-card-fraud", color: 0x8b5cf6 },
        { title: "Library Management", category: "SYSTEM", repo: "Library-Management-System", color: 0x10b981 }
    ];

    // Setup Scene
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 8.5;
    camera.position.y = 0;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group for carousel
    const carouselGroup = new THREE.Group();
    scene.add(carouselGroup);

    // Cards
    const cards = [];
    const radius = 5.5;
    const cardGeom = new THREE.PlaneGeometry(3.5, 4.8);

    // Function to create text canvas texture for the 3D Cards
    function createCardTexture(proj) {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 700;
        const ctx = c.getContext('2d');
        
        // Background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 512, 700);
        
        // Border
        const colorStr = '#' + proj.color.toString(16).padStart(6, '0');
        ctx.strokeStyle = colorStr;
        ctx.lineWidth = 12;
        ctx.strokeRect(6, 6, 500, 688);

        // Header strip
        ctx.fillStyle = colorStr;
        ctx.globalAlpha = 0.15;
        ctx.fillRect(0, 0, 512, 140);
        ctx.globalAlpha = 1.0;

        // Category Tag
        ctx.fillStyle = colorStr;
        ctx.font = 'bold 28px monospace';
        ctx.fillText(proj.category + ' PROJECT', 40, 80);

        // Title (Wrap text)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 44px sans-serif';
        const words = proj.title.split(' ');
        let line = '';
        let y = 240;
        for(let i = 0; i < words.length; i++) {
            let testLine = line + words[i] + ' ';
            let metrics = ctx.measureText(testLine);
            if(metrics.width > 420 && i > 0) {
                ctx.fillText(line, 40, y);
                line = words[i] + ' ';
                y += 55;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, 40, y);

        // Decorative lines
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(40, 480);
        ctx.lineTo(472, 480);
        ctx.stroke();

        // Footer prompt
        ctx.fillStyle = '#94a3b8';
        ctx.font = '24px monospace';
        ctx.fillText('> Click to read README.md', 40, 550);
        ctx.fillText('> Fetching from GitHub...', 40, 600);

        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        return tex;
    }

    projects.forEach((proj, i) => {
        const tex = createCardTexture(proj);
        const mat = new THREE.MeshBasicMaterial({ 
            map: tex, 
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.95
        });
        const mesh = new THREE.Mesh(cardGeom, mat);

        const angle = (i / projects.length) * Math.PI * 2;
        mesh.position.x = Math.cos(angle) * radius;
        mesh.position.z = Math.sin(angle) * radius;
        mesh.rotation.y = -angle + Math.PI / 2;

        mesh.userData = proj;
        cards.push(mesh);
        carouselGroup.add(mesh);
    });

    // Interaction Variables
    let isDragging = false;
    let prevX = 0;
    let velocity = 0;
    let hasDragged = false;
    
    container.addEventListener('mousedown', e => { 
        isDragging = true; 
        hasDragged = false;
        prevX = e.clientX; 
        container.style.cursor = 'grabbing';
    });
    
    window.addEventListener('mouseup', () => { 
        isDragging = false; 
        container.style.cursor = 'grab';
    });
    
    window.addEventListener('mousemove', e => {
        if (!isDragging) return;
        const delta = e.clientX - prevX;
        if (Math.abs(delta) > 2) hasDragged = true;
        velocity += delta * 0.0003;
        prevX = e.clientX;
    });

    // Touch Support
    let lastTouchX = 0;
    container.addEventListener('touchstart', e => { 
        isDragging = true; 
        hasDragged = false;
        lastTouchX = e.touches[0].clientX; 
    });
    window.addEventListener('touchend', () => { isDragging = false; });
    window.addEventListener('touchmove', e => {
        if(!isDragging) return;
        const delta = e.touches[0].clientX - lastTouchX;
        if (Math.abs(delta) > 2) hasDragged = true;
        velocity += delta * 0.0003;
        lastTouchX = e.touches[0].clientX;
        e.preventDefault();
    }, {passive: false});

    // Raycast for Clicking to Open Modal
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    container.addEventListener('click', e => {
        // Prevent click if we were just dragging
        if (hasDragged || Math.abs(velocity) > 0.02) return;

        const rect = container.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(cards);

        if (intersects.length > 0) {
            const data = intersects[0].object.userData;
            
            // Build a 2D HTML Mock Card for the Modal Controller
            const mockCard = document.createElement('div');
            mockCard.className = 'project-item hidden';
            mockCard.dataset.repo = data.repo;
            mockCard.dataset.category = data.category.toLowerCase();
            
            const titleH3 = document.createElement('h3');
            titleH3.textContent = data.title;
            const titleWrap = document.createElement('div');
            titleWrap.className = 'p-5';
            titleWrap.appendChild(titleH3);
            mockCard.appendChild(titleWrap);

            // Temporarily add to document body so modal controller can find it
            document.body.appendChild(mockCard); 
            
            if (window.projectModalController && typeof window.projectModalController.open === 'function') {
                window.projectModalController.open(mockCard);
            }
            
            // Clean up
            setTimeout(() => {
                if(document.body.contains(mockCard)) {
                    document.body.removeChild(mockCard);
                }
            }, 100);
        }
    });

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);
        
        if (!isDragging) {
            velocity *= 0.96; // Friction
        }
        carouselGroup.rotation.y += velocity;
        
        // Auto rotate slowly if untouched
        if (Math.abs(velocity) < 0.001 && !isDragging) {
            carouselGroup.rotation.y -= 0.002;
        }

        renderer.render(scene, camera);
    }
    animate();

    // Responsive
    window.addEventListener('resize', () => {
        if(container.clientWidth > 0){
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }
    });
})();
