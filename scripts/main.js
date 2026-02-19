document.addEventListener('DOMContentLoaded', () => {
    // Reveal performance for project cards
    const projects = document.querySelectorAll('.project');

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    projects.forEach(project => {
        // Set initial state for animation
        project.style.opacity = '0';
        project.style.transform = 'translateY(30px)';
        project.style.transition = 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
        observer.observe(project);
    });

    // Subtle 3D tilt effect for project cards
    projects.forEach(project => {
        project.addEventListener('mousemove', (e) => {
            const rect = project.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;

            project.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-12px) scale(1.02)`;
        });

        project.addEventListener('mouseleave', () => {
            project.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)`;
        });
    });

    // Add a trailing glow effect to the mouse
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);

    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });
});
