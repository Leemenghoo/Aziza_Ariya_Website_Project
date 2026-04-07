/**
 * Ariya — Shared Main Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initRevealAnimations();
});

function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links a');

    // Toggle mobile menu
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            // Animate hamburger to X if desired
        });
    }

    // Set active link based on current path
    const currentPath = window.location.pathname;
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (currentPath.endsWith(href) || (currentPath.endsWith('/') && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function initRevealAnimations() {
    const revealElements = document.querySelectorAll('.reveal');

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => observer.observe(el));
}

// Utility to create a sketch-style celebration
function triggerCelebration() {
    const colors = ['#000000']; // Strictly black per prompt
    const count = 50;

    for (let i = 0; i < count; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = (Math.random() * 8 + 4) + 'px';
        confetti.style.height = (Math.random() * 8 + 4) + 'px';
        confetti.style.animationDuration = (Math.random() * 1 + 1) + 's';
        confetti.style.animationDelay = (Math.random() * 0.5) + 's';

        document.body.appendChild(confetti);

        // Remove after animation
        setTimeout(() => confetti.remove(), 2000);
    }
}
