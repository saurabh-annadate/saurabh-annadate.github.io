/**
 * Shared page interactions: sticky header state, mobile menu, reveal on scroll.
 */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        const header = document.getElementById('siteHeader');
        const toggle = document.getElementById('navToggle');
        const menu = document.getElementById('navMenu');

        // Header border once the page scrolls
        const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        // Mobile menu
        if (toggle && menu) {
            toggle.addEventListener('click', () => {
                const open = toggle.getAttribute('aria-expanded') === 'true';
                toggle.setAttribute('aria-expanded', String(!open));
                menu.classList.toggle('is-open', !open);
            });
            menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
                toggle.setAttribute('aria-expanded', 'false');
                menu.classList.remove('is-open');
            }));
        }

        // Reveal sections as they enter the viewport
        const sections = document.querySelectorAll('.reveal');
        if (!('IntersectionObserver' in window)) {
            sections.forEach(el => el.classList.add('is-visible'));
            return;
        }
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
        sections.forEach(el => observer.observe(el));
    });
})();
