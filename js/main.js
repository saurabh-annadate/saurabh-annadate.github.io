/**
 * Main site JavaScript
 * Navigation, scroll effects, counters, and general interactions
 */

(function () {
    'use strict';

    /* =============================================
       NAVBAR
       ============================================= */

    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    // Scroll effect
    function handleNavScroll() {
        if (!navbar) return;
        if (window.scrollY > 50 || !document.querySelector('.hero')) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleNavScroll);
    window.addEventListener('load', handleNavScroll);

    // Mobile toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close on link click
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    // Active link highlighting
    function setActiveNavLink() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');

            if (href === page ||
                href.endsWith('/' + page) ||
                href.endsWith(page) ||
                (page === '' && (href === 'index.html' || href.endsWith('/index.html'))) ||
                (page === 'index.html' && (href === 'index.html' || href === '../index.html'))) {
                link.classList.add('active');
            }
        });
    }

    /* =============================================
       SCROLL ANIMATIONS (Intersection Observer)
       ============================================= */

    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const selectors = [
            '.news-item',
            '.featured-card',
            '.pub-item',
            '.research-project',
            '.software-card',
            '.cv-entry',
            '.stat-item',
            '.plume-showcase'
        ];

        document.querySelectorAll(selectors.join(', ')).forEach(el => {
            el.classList.add('fade-in');
            observer.observe(el);
        });
    }

    /* =============================================
       ANIMATED COUNTERS (Climate Stats)
       ============================================= */

    function animateCounter(element, target, duration) {
        const startTime = performance.now();
        const isFloat = target % 1 !== 0;
        const startVal = 0;

        function easeOutQuart(t) {
            return 1 - Math.pow(1 - t, 4);
        }

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutQuart(progress);
            const currentVal = startVal + (target - startVal) * easedProgress;

            if (isFloat) {
                element.textContent = currentVal.toFixed(1);
            } else {
                element.textContent = Math.floor(currentVal);
            }

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = isFloat ? target.toFixed(1) : target;
            }
        }

        requestAnimationFrame(update);
    }

    function initCounters() {
        const statNumbers = document.querySelectorAll('.stat-number[data-target]');
        if (statNumbers.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseFloat(entry.target.dataset.target);
                    animateCounter(entry.target, target, 2000);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statNumbers.forEach(el => observer.observe(el));
    }

    /* =============================================
       TEMPERATURE BAR ANIMATION
       ============================================= */

    function initTempBar() {
        const tempFill = document.getElementById('tempFill');
        if (!tempFill) return;

        // Animate after a delay
        setTimeout(() => {
            tempFill.style.width = '75%';
        }, 1500);
    }

    /* =============================================
       SMOOTH SCROLL for anchor links
       ============================================= */

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    /* =============================================
       PARALLAX EFFECT (subtle on hero)
       ============================================= */

    function initParallax() {
        const hero = document.querySelector('.hero');
        const heroContent = document.querySelector('.hero-content');
        if (!hero || !heroContent) return;

        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrolled = window.scrollY;
                    const heroHeight = hero.offsetHeight;

                    if (scrolled < heroHeight) {
                        const opacity = 1 - (scrolled / heroHeight) * 1.2;
                        const translateY = scrolled * 0.3;
                        heroContent.style.opacity = Math.max(0, opacity);
                        heroContent.style.transform = `translateY(${translateY}px)`;
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    /* =============================================
       TYPING EFFECT (optional for hero subtitle)
       ============================================= */

    function initTypingEffect() {
        const subtitle = document.querySelector('.hero-subtitle');
        if (!subtitle || !subtitle.dataset.typing) return;

        const text = subtitle.textContent;
        subtitle.textContent = '';
        subtitle.style.borderRight = '2px solid rgba(255,255,255,0.7)';

        let i = 0;
        function type() {
            if (i < text.length) {
                subtitle.textContent += text.charAt(i);
                i++;
                setTimeout(type, 50 + Math.random() * 30);
            } else {
                // Remove cursor after typing
                setTimeout(() => {
                    subtitle.style.borderRight = 'none';
                }, 1000);
            }
        }

        // Start after hero animation
        setTimeout(type, 1200);
    }

    /* =============================================
       DARK MODE SUPPORT (prefers-color-scheme)
       ============================================= */

    function checkDarkMode() {
        // The site is already dark-themed, but this can be extended
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.dataset.theme = prefersDark ? 'dark' : 'light';
    }

    /* =============================================
       BACK TO TOP BUTTON (optional)
       ============================================= */

    function initBackToTop() {
        // Create button if it doesn't exist
        let btn = document.getElementById('backToTop');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'backToTop';
            btn.innerHTML = '<i class="fas fa-chevron-up"></i>';
            btn.setAttribute('aria-label', 'Back to top');
            btn.style.cssText = `
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 44px;
                height: 44px;
                border-radius: 50%;
                background: var(--accent, #e63946);
                color: white;
                border: none;
                cursor: pointer;
                font-size: 1rem;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                z-index: 999;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            `;
            document.body.appendChild(btn);
        }

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                btn.style.opacity = '1';
                btn.style.visibility = 'visible';
            } else {
                btn.style.opacity = '0';
                btn.style.visibility = 'hidden';
            }
        });
    }

    /* =============================================
       PAGE LOAD PERFORMANCE
       ============================================= */

    function onPageLoad() {
        // Remove loading state
        document.body.classList.add('loaded');

        // Log performance (dev only)
        if (window.performance) {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log(`Page loaded in ${pageLoadTime}ms`);
        }
    }

    /* =============================================
       INITIALIZE EVERYTHING
       ============================================= */

    function init() {
        setActiveNavLink();
        initScrollAnimations();
        initCounters();
        initTempBar();
        initSmoothScroll();
        initParallax();
        initBackToTop();
        checkDarkMode();
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Run on full load
    window.addEventListener('load', onPageLoad);

})();