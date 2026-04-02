document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    loadCertifications();
});

const projectsData = [
    {
        "id": 1,
        "title": "Smart Parking System",
        "category": "Software Eng",
        "description": "A smart parking management system built with Python and Tkinter. It uses data structures to optimize parking slot allocation and provides a user-friendly GUI for administrators.",
        "outcome": "Deepened understanding of GUI development and data structure optimization.",
        "tags": ["Python", "Tkinter", "Data Structures"],
        "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuCuRR8fE9k3E738WyVZaW5QgMhUPzfrpNFM9jjKIFsLBajwstz5Hm2ZgU3HYvawTt73O8Sa7WRGUMTZsf3lCP1wjITEUKdHmIvoXNyKlj1OWiDB8mP9yNzxdILZ3udMTB3HgdpDMhyXJB_x_heHor9tDjX7IAFH4fE0l9tGubSt4qwWCWqEpOFj0hjyd_1rRKjb0s7mzOxEDZVYbQeysBbXOmUjjS4Vko1RCEOy59AirrcdL6b0Qvyd_gh0TBZpMFyYBGy62c7PE7eN",
        "link": "#",
        "repo": "https://github.com/example/smart-parking"
    },
    {
        "id": 2,
        "title": "Water Level Indicator",
        "category": "IoT",
        "description": "Manual monitoring of water tanks results in wastage. This system automates level tracking and alerts using ultrasonic sensors and Arduino.",
        "outcome": "Efficient water management and automated alert system.",
        "tags": ["C++", "Arduino", "Ultrasonic Sensors"],
        "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuBOif_fO0E144mMAG4dCLfzmgE4hRdCT2pwjd5xS6Mg7j2dPlenIc0mZZ5WAd28Nl5pq12mgCT4aWGyp2vS6k-CJiL80gFQqS6Q24UBQXufXGfnAvy5U_WQh-UmBYL4MoskIIKbW1Xo_-E2R8FLw-A0xdW42VD9YkOoSh-7iboooNDS9erEkXcuK53f3gmcrBNi8D49HjAl33YrX2-DGl0IY1Twzcv1Xzuz7X0QG3DxHp3OVEOA0gJMn53THxzasl-AUC4mNvrGxJCs",
        "link": "#",
        "repo": "#"
    },
    {
        "id": 3,
        "title": "Customer Churn Prediction",
        "category": "ML",
        "description": "Identifying at-risk customers early using Random Forest Classifier. This project analyzes customer behavior data to predict churn probability.",
        "outcome": "Accurate churn prediction model to assist in retention strategies.",
        "tags": ["Python", "Scikit-Learn", "Pandas"],
        "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuDOyuNuvSzjAdjeI0dmqdqU0ZzP_BbQnD2RNnHl_WQL5DwGQnV4UyHk6M2kaKkKe79CceAFTZ0uXg_aumxemhXskco9MYgzag9t0IDrC-ylyEK9alVvDqo6TywHoN8lhFfyLASStI7aaPDR9BFcnOw9yvfGFntGHjKZad9y6-M8Lc4AePvr4Juzc5iWuraaQUcQlhmrBLvI9KzQVMSeLq1Rlf-T1xlf_wzGf7BzoQxAZ0mMp45YCaTTiBVbKlUyFpZPBjroUEt4C5dv",
        "link": "#",
        "repo": "#"
    },
    {
        "id": 4,
        "title": "Library Management System",
        "category": "DBMS",
        "description": "Addressed inefficient record-keeping with a normalized database schema. This system uses MySQL and PHP to manage books, members, and transactions efficiently.",
        "outcome": "Improved data integrity and query performance via normalization.",
        "tags": ["MySQL", "PHP", "Normalization"],
        "image": "https://lh3.googleusercontent.com/aida-public/AB6AXuBLgjIvXOp5S44jEsKdUFkQFICBDISjbpTQoXzNeFckthBY-fkNAdiCANmna4Qf3R85f3NAk6jRjrO2Ciq0IYQKHLwxqNpdfsswMZb_4k4wQ-qch7UJi4tqPRDsFImAZkJtNsK4UuAY1YpYFijteZKnJ09_-3r1jh3OjdPsH1ojzHGAYzNdVWFNirpjsAq7NKxxL3rZFp8CY6n9aaDzib90sQDqaQIt6FABun3CfN24e2TEU7u4SuFlrbmnlo4jWtvAHZUy3znrCKG6",
        "link": "#",
        "repo": "#"
    },
    {
        "id": 5,
        "title": "Age & Gender Detection",
        "category": "ML",
        "description": "Automatically predicts a person’s age group and gender from facial images using trained CNN models. Utilizes OpenCV for real-time video processing.",
        "outcome": "Successful implementation of deep learning models for real-time classification.",
        "tags": ["Python", "OpenCV", "CNN"],
        "image": "images/ml.png",
        "link": "#",
        "repo": "#"
    },
    {
        "id": 6,
        "title": "AgriSathi",
        "category": "IoT",
        "description": "Smart digital assistant providing crop recommendations and agricultural guidance using data-driven insights. Integrates IoT sensors for real-time field monitoring.",
        "outcome": "Empowered farmers with actionable data to improve crop yield and resource usage.",
        "tags": ["Python", "ML", "Data Analysis"],
        "image": "images/ml.png",
        "link": "#",
        "repo": "#"
    },
    {
        "id": 7,
        "title": "Campus Shuttle Routing",
        "category": "Software Eng",
        "description": "Routing system optimization for efficient campus shuttle transit and scheduling. Uses graph algorithms to determine the most time-efficient routes.",
        "outcome": "Reduced wait times and optimized fuel consumption for campus transport.",
        "tags": ["Python", "Graph Algorithms"],
        "image": "images/software.png",
        "link": "#",
        "repo": "#"
    },
    {
        "id": 8,
        "title": "Fingerprint Voting System",
        "category": "IoT",
        "description": "Secure electronic voting system using fingerprint authentication to ensure voter identity and integrity.",
        "outcome": "Enhanced election integrity with biometric security.",
        "tags": ["Biometrics", "Database"],
        "image": "images/iot.png",
        "link": "#",
        "repo": "#"
    },
    {
        "id": 9,
        "title": "Foodie — Delivery System",
        "category": "DBMS",
        "description": "Database-driven food delivery platform managing users, restaurants, and orders with complex SQL queries and normalization.",
        "outcome": "Efficient order processing and data management.",
        "tags": ["SQL", "DBMS", "ER Modeling"],
        "image": "images/dbms.png",
        "link": "#",
        "repo": "#"
    },
    {
        "id": 10,
        "title": "IoT Waste Management",
        "category": "IoT",
        "description": "Smart station monitoring waste levels real-time to optimize collection schedules and reduce operational costs.",
        "outcome": "Optimized municipal services through IoT usage.",
        "tags": ["IoT Sensors", "Python", "Cloud"],
        "image": "images/iot.png",
        "link": "#",
        "repo": "#"
    },
    {
        "id": 11,
        "title": "ML Object Detection",
        "category": "ML",
        "description": "Real-time object detection and classification system using deep learning techniques like YOLO and CNNs.",
        "outcome": "High-speed real-time detection for video feeds.",
        "tags": ["Python", "OpenCV", "YOLO/CNN"],
        "image": "images/ml.png",
        "link": "#",
        "repo": "#"
    }
];

const certificationsData = [
    {
        "id": 1,
        "title": "Java Programming: Solving Problems with Software",
        "category": "Duke University",
        "description": "An online course authorized by Duke University and offered through Coursera. Completed with honors.",
        "image": "images/certs/4D1TI8E5IT7M.jpeg",
        "link": "https://coursera.org/verify/4D1TI8E5IT7M",
        "createdAt": "2025-04-16"
    },
    {
        "id": 2,
        "title": "Data Structures Using Python - An Introduction",
        "category": "Packt",
        "description": "An online course authorized by Packt and offered through Coursera.",
        "image": "images/certs/ZJHP4YUYR19C.jpeg",
        "link": "https://coursera.org/verify/ZJHP4YUYR19C",
        "createdAt": "2025-03-17"
    },
    {
        "id": 3,
        "title": "Quantum Computing For Everyone - An Introduction",
        "category": "Fractal Analytics",
        "description": "An online course authorized by Fractal Analytics and offered through Coursera.",
        "image": "images/certs/G3U3V5GZURCB.jpeg",
        "link": "https://coursera.org/verify/G3U3V5GZURCB",
        "createdAt": "2025-04-24"
    },
    {
        "id": 4,
        "title": "Interfacing with the Arduino",
        "category": "University of California, Irvine",
        "description": "An online course authorized by University of California, Irvine and offered through Coursera.",
        "image": "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=640&auto=format&fit=crop",
        "link": "https://coursera.org/verify/1S8JSJJZ6AU7",
        "createdAt": "2025-03-29"
    },
    {
        "id": 5,
        "title": "Object-Oriented Design",
        "category": "University of Alberta",
        "description": "An online course authorized by University of Alberta and offered through Coursera.",
        "image": "images/certs/0GBZ4JJCYYUL.jpeg",
        "link": "https://coursera.org/verify/0GBZ4JJCYYUL",
        "createdAt": "2024-11-27"
    },
    {
        "id": 6,
        "title": "The Arduino Platform and C Programming",
        "category": "University of California, Irvine",
        "description": "An online course authorized by University of California, Irvine and offered through Coursera.",
        "image": "images/certs/P7K57RD585O4.jpeg",
        "link": "https://coursera.org/verify/P7K57RD585O4",
        "createdAt": "2025-03-21"
    },
    {
        "id": 7,
        "title": "Introduction to Cyber Attacks",
        "category": "NYU Tandon School of Engineering",
        "description": "An online course authorized by New York University and offered through Coursera.",
        "image": "images/certs/U88BU9H40NG9.jpeg",
        "link": "https://coursera.org/verify/U88BU9H40NG9",
        "createdAt": "2025-03-17"
    },
    {
        "id": 8,
        "title": "Nanotechnology and Nanosensors, Part1",
        "category": "Technion - Israel Institute of Technology",
        "description": "An online course authorized by Technion - Israel Institute of Technology and offered through Coursera.",
        "image": "https://images.unsplash.com/photo-1542482329-158a1bdc9038?q=80&w=640&auto=format&fit=crop",
        "link": "https://coursera.org/verify/0Y0HQ44UUGU1",
        "createdAt": "2024-11-18"
    },
    {
        "id": 9,
        "title": "Write Professional Emails in English",
        "category": "Georgia Institute of Technology",
        "description": "An online course authorized by Georgia Institute of Technology and offered through Coursera.",
        "image": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=640&auto=format&fit=crop",
        "link": "https://coursera.org/verify/H1MKZ3J2RI6L",
        "createdAt": "2024-11-13"
    },
    {
        "id": 10,
        "title": "Frontend Developer (React)",
        "category": "HackerRank",
        "description": "The bearer of this certificate has passed the HackerRank role certification test.",
        "image": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=640&auto=format&fit=crop",
        "link": "https://www.hackerrank.com/certificates/64f0ad32f333",
        "createdAt": "2026-02-25"
    },
    {
        "id": 11,
        "title": "Go (Basic)",
        "category": "HackerRank",
        "description": "The bearer of this certificate has passed the HackerRank skill certification test.",
        "image": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=640&auto=format&fit=crop",
        "link": "https://www.hackerrank.com/certificates/2d20c7ecbc8a",
        "createdAt": "2026-03-01"
    }
];

function loadProjects() {
    const container = document.getElementById('projects-list-container');
    if (!container) return;

    try {
        const projects = projectsData;

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

function loadCertifications() {
    const container = document.getElementById('certifications-list-container');
    if (!container) return;

    try {
        const certs = certificationsData;

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
