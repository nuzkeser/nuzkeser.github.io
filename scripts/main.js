/**
 * Main Interactive Scripts
 * Inspired by modern portfolios (tbakie.com) with smooth animations,
 * spotlight cards, reading progress, and interactive counters.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Reading Progress Bar
    const progressBar = document.getElementById('scroll-progress');
    const updateProgress = () => {
        if (!progressBar) return;
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight > 0) {
            const progress = (window.scrollY / totalHeight) * 100;
            progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        }
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    // 2. Header Scroll Blur Transition
    const header = document.querySelector('.site-header');
    const handleHeaderScroll = () => {
        if (!header) return;
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    handleHeaderScroll();

    // 3. Mobile Navigation Drawer
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileDrawer = document.getElementById('mobile-drawer');
    if (mobileToggle && mobileDrawer) {
        mobileToggle.addEventListener('click', () => {
            const isOpen = mobileDrawer.classList.toggle('open');
            mobileToggle.setAttribute('aria-expanded', isOpen);
            const icon = mobileToggle.querySelector('svg');
            if (icon) {
                if (isOpen) {
                    icon.innerHTML = '<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>';
                } else {
                    icon.innerHTML = '<path d="M4 6h16"></path><path d="M4 12h16"></path><path d="M4 18h16"></path>';
                }
            }
        });

        // Close drawer on link click
        mobileDrawer.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileDrawer.classList.remove('open');
                if (mobileToggle) {
                    mobileToggle.setAttribute('aria-expanded', 'false');
                    const icon = mobileToggle.querySelector('svg');
                    if (icon) icon.innerHTML = '<path d="M4 6h16"></path><path d="M4 12h16"></path><path d="M4 18h16"></path>';
                }
            });
        });
    }

    // 4. Spotlight Hover Effect for Cards
    const spotlightCards = document.querySelectorAll('.spotlight-card');
    spotlightCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--spot-x', `${x}px`);
            card.style.setProperty('--spot-y', `${y}px`);
        });
    });

    // 5. Scroll Reveal with IntersectionObserver
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // 6. Number Counter Animation for Stats
    const counterElements = document.querySelectorAll('[data-count-target]');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseFloat(entry.target.getAttribute('data-count-target'));
                const suffix = entry.target.getAttribute('data-count-suffix') || '';
                const prefix = entry.target.getAttribute('data-count-prefix') || '';
                const duration = 1500;
                const start = performance.now();

                const updateCount = (currentTime) => {
                    const elapsed = currentTime - start;
                    const progress = Math.min(elapsed / duration, 1);
                    // easeOutCubic curve
                    const easeProgress = 1 - Math.pow(1 - progress, 3);
                    const currentVal = Math.floor(easeProgress * target);

                    entry.target.textContent = `${prefix}${currentVal}${suffix}`;

                    if (progress < 1) {
                        requestAnimationFrame(updateCount);
                    } else {
                        entry.target.textContent = `${prefix}${target}${suffix}`;
                    }
                };

                requestAnimationFrame(updateCount);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    counterElements.forEach(el => counterObserver.observe(el));

    // 7. Subtle 3D Hero Avatar Tilt Effect
    const avatarWrapper = document.querySelector('.avatar-wrapper');
    const heroSection = document.querySelector('.hero-section');
    if (avatarWrapper && heroSection) {
        heroSection.addEventListener('mousemove', (e) => {
            const rect = avatarWrapper.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const deltaX = (e.clientX - centerX) / (window.innerWidth / 2);
            const deltaY = (e.clientY - centerY) / (window.innerHeight / 2);

            const rotateX = -deltaY * 12;
            const rotateY = deltaX * 12;

            avatarWrapper.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
        });

        heroSection.addEventListener('mouseleave', () => {
            avatarWrapper.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        });
    }

    // 8. Interactive Ambient Cursor Glow
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const glow = document.createElement('div');
        glow.className = 'cursor-glow';
        document.body.appendChild(glow);

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let glowX = mouseX;
        let glowY = mouseY;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        }, { passive: true });

        const animateGlow = () => {
            glowX += (mouseX - glowX) * 0.12;
            glowY += (mouseY - glowY) * 0.12;
            glow.style.left = `${glowX}px`;
            glow.style.top = `${glowY}px`;
            requestAnimationFrame(animateGlow);
        };
        requestAnimationFrame(animateGlow);
    }
});
