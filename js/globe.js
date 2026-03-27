/**
 * globe.js
 * Interactive 3D Globe with clickable tech stack nodes using Three.js
 */

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('globe-container');
    if (!container || typeof THREE === 'undefined') return;

    // 1. Setup Scene, Camera, Renderer
    const scene = new THREE.Scene();
    
    // Make background transparent
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 250;

    // Handle Resize
    window.addEventListener('resize', () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    // 2. Create the Globe (Particle/Wireframe hybrid)
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const radius = 90;
    
    // Core Wireframe Sphere
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    // Use a custom material that looks like a hologram/wireframe
    const material = new THREE.MeshBasicMaterial({
        color: 0x1e293b,
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });
    const globeMesh = new THREE.Mesh(geometry, material);
    globeGroup.add(globeMesh);

    // Add some particles to make it look "techy"
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 1000;
    const posArray = new Float32Array(particleCount * 3);
    
    for(let i=0; i < particleCount * 3; i+=3) {
        // Random spherical distribution
        const r = radius * 1.02; // slightly larger than wireframe
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        posArray[i] = r * Math.sin(phi) * Math.cos(theta); // x
        posArray[i+1] = r * Math.sin(phi) * Math.sin(theta); // y
        posArray[i+2] = r * Math.cos(phi); // z
    }
    
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
        size: 1.5,
        color: 0x2563eb, // primary blue
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(particleGeo, particleMat);
    globeGroup.add(particles);

    // 3. Create Tech Stack Nodes
    const nodesData = [
        { label: "Python", lat: 20, lon: 30, color: 0xfacc15, url: "projects.html" },
        { label: "React", lat: -15, lon: -40, color: 0x38bdf8, url: "skills.html" },
        { label: "Predictive ML", lat: 45, lon: 120, color: 0x10b981, url: "projects.html" },
        { label: "PostgreSQL", lat: -30, lon: 90, color: 0x60a5fa, url: "skills.html" },
        { label: "AWS", lat: 10, lon: -150, color: 0xf97316, url: "skills.html" },
        { label: "Docker", lat: -45, lon: -90, color: 0x0ea5e9, url: "projects.html" }
    ];

    const nodes = [];
    const htmlOverlays = [];

    // Container for HTML overlays so they sit on top of the canvas
    const overlayContainer = document.createElement('div');
    overlayContainer.style.position = 'absolute';
    overlayContainer.style.top = '0';
    overlayContainer.style.left = '0';
    overlayContainer.style.width = '100%';
    overlayContainer.style.height = '100%';
    overlayContainer.style.pointerEvents = 'none'; // let drag pass through
    container.appendChild(overlayContainer);

    function latLonToVector3(lat, lon, r) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        
        const x = -(r * Math.sin(phi) * Math.cos(theta));
        const z = (r * Math.sin(phi) * Math.sin(theta));
        const y = (r * Math.cos(phi));
        return new THREE.Vector3(x, y, z);
    }

    nodesData.forEach(data => {
        // Create 3D Node (glowing sphere)
        const nodeGeo = new THREE.SphereGeometry(3, 16, 16);
        const nodeMat = new THREE.MeshBasicMaterial({ 
            color: data.color,
        });
        const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
        
        // Add outer glow wrapper
        const glowGeo = new THREE.SphereGeometry(5, 16, 16);
        const glowMat = new THREE.MeshBasicMaterial({ 
            color: data.color, 
            transparent: true, 
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });
        const glowMesh = new THREE.Mesh(glowGeo, glowMat);
        nodeMesh.add(glowMesh);

        const pos = latLonToVector3(data.lat, data.lon, radius);
        nodeMesh.position.copy(pos);
        
        globeGroup.add(nodeMesh);
        nodes.push({ mesh: nodeMesh, data: data });

        // Create HTML Label
        const label = document.createElement('div');
        label.className = 'absolute px-2 py-1 text-xs font-bold font-mono rounded bg-slate-900/80 text-white border border-slate-700 backdrop-blur-sm cursor-pointer hover:bg-primary transition-colors opacity-0';
        label.innerText = data.label;
        label.style.pointerEvents = 'auto'; // make clickable
        label.style.transform = 'translate(-50%, -50%)';
        label.onclick = () => window.location.href = data.url;
        
        overlayContainer.appendChild(label);
        htmlOverlays.push({ element: label, mesh: nodeMesh });
    });

    // 4. Interaction (Drag to Rotate)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotationVelocity = { x: 0.002, y: 0.001 }; // auto rotation speed

    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        container.style.cursor = 'grabbing';
    });
    
    window.addEventListener('mouseup', () => {
        isDragging = false;
        container.style.cursor = 'grab';
    });
    
    window.addEventListener('mousemove', (e) => {
        // Drag rotation
        if (isDragging) {
            const deltaMove = {
                x: e.offsetX - previousMousePosition.x,
                y: e.offsetY - previousMousePosition.y
            };

            globeGroup.rotation.y += deltaMove.x * 0.005;
            globeGroup.rotation.x += deltaMove.y * 0.005;
            
            // Limit X rotation to avoid flipping upside down
            globeGroup.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, globeGroup.rotation.x));
            
            // Pause auto rotation on drag
            rotationVelocity = { x: 0, y: 0 };
        }
        
        previousMousePosition = {
            x: e.offsetX,
            y: e.offsetY
        };
    });

    // Touch support for mobiles
    container.addEventListener('touchstart', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, {passive: true});

    window.addEventListener('touchend', () => isDragging = false);
    
    window.addEventListener('touchmove', (e) => {
        if (isDragging) {
            const deltaMove = {
                x: e.touches[0].clientX - previousMousePosition.x,
                y: e.touches[0].clientY - previousMousePosition.y
            };
            globeGroup.rotation.y += deltaMove.x * 0.005;
            globeGroup.rotation.x += deltaMove.y * 0.005;
            globeGroup.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, globeGroup.rotation.x));
            rotationVelocity = { x: 0, y: 0 };
        }
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, {passive: true});

    // 5. Animation Loop
    function animate() {
        requestAnimationFrame(animate);

        // Auto Rotation (restore slowly if not dragging)
        if (!isDragging) {
            rotationVelocity.x += (0.002 - rotationVelocity.x) * 0.05;
            rotationVelocity.y += (0.001 - rotationVelocity.y) * 0.05;
            globeGroup.rotation.y += rotationVelocity.x;
            globeGroup.rotation.x += rotationVelocity.y;
        }

        // Pulse effect for nodes
        const time = performance.now() * 0.003;
        nodes.forEach((node, i) => {
            const scale = 1 + Math.sin(time + i) * 0.2;
            node.mesh.scale.set(scale, scale, scale);
        });

        // Update HTML Overlay Positions
        htmlOverlays.forEach(overlay => {
            // Get 3D position of the node
            const vector = new THREE.Vector3();
            overlay.mesh.getWorldPosition(vector);
            
            // Project to 2D screen space
            vector.project(camera);
            
            // Convert to CSS coordinates
            const x = (vector.x *  .5 + .5) * container.clientWidth;
            const y = (vector.y * -.5 + .5) * container.clientHeight;
            
            overlay.element.style.left = `${x}px`;
            overlay.element.style.top = `${y}px`;
            
            // Hide labels that are on the back of the globe (Z > 0 in clip space usually means front, but we map it manually)
            // Since camera is looking at -Z, positive Z world positions are closest
            overlay.mesh.getWorldPosition(vector); // get absolute again
            // distance from center of globe to camera
            const cameraDist = camera.position.length();
            const nodeDist = vector.distanceTo(camera.position);
            
            // If the node is further from camera than the center of the globe, it's on the back
            if (nodeDist > cameraDist) {
                overlay.element.style.opacity = '0';
                overlay.element.style.pointerEvents = 'none';
            } else {
                overlay.element.style.opacity = '1';
                overlay.element.style.pointerEvents = 'auto';
                
                // Scale based on z depth for perspective effect
                const depthScale = Math.max(0.5, 1 - ((nodeDist - (cameraDist - radius)) / (2 * radius)));
                overlay.element.style.transform = `translate(-50%, -50%) scale(${depthScale})`;
            }
        });

        renderer.render(scene, camera);
    }

    animate();
});
