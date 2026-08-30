/* ==========================================================================
   UNIFIED PRIVACY & TERMS ROUTER AND CONTROLLER
   Renders Legal Views dynamically from Central Language Dictionary
   Flow: Policies Overview (Landing) <-> Privacy Policy (Full) <-> Terms (Full)
   Reactivity: Reacts to language changes instantly from window.languageDictionary
   ========================================================================== */

(function() {
    'use strict';

    // Global navigation handler
    window.navigateTo = function(route) {
        if (route === 'privacy') {
            window.location.hash = '#privacy-policy';
        } else if (route === 'terms') {
            window.location.hash = '#terms-and-conditions';
        } else {
            if (window.location.hash) {
                try {
                    history.pushState(null, '', window.location.pathname + window.location.search);
                } catch (e) {
                    window.location.hash = '';
                }
            }
        }

        renderRoute(route);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', () => {
        renderRoute(getRouteFromLocation());
    });

    window.addEventListener('hashchange', () => {
        renderRoute(getRouteFromLocation());
    });

    function getRouteFromLocation() {
        const hash = (window.location.hash || '').toLowerCase();
        const path = (window.location.pathname || '').toLowerCase();

        if (hash.includes('privacy') || path.includes('privacy-policy')) return 'privacy';
        if (hash.includes('terms') || path.includes('terms-and-conditions')) return 'terms';
        return 'landing';
    }

    function renderRoute(route) {
        const heroContainer = document.getElementById('hero-dynamic-content');
        const mainContainer = document.getElementById('main-content');
        const titleElement = document.getElementById('page-title');
        const metaDesc = document.getElementById('meta-desc') || document.querySelector('meta[name="description"]');

        if (!heroContainer || !mainContainer) return;

        const currentLang = (window.getLanguage && window.getLanguage()) || localStorage.getItem('preferred-language') || 'en';
        const currentDict = window.languageDictionary && window.languageDictionary[currentLang] && window.languageDictionary[currentLang].privacy_page;
        const enDict = window.languageDictionary && window.languageDictionary['en'] && window.languageDictionary['en'].privacy_page;
        const dict = currentDict || enDict;

        if (!dict) return;

        if (route === 'privacy') {
            const title = dict.privacy_title || (enDict && enDict.privacy_title) || 'Privacy Policy - Munendra Singh';
            const meta = dict.privacy_meta || (enDict && enDict.privacy_meta) || '';
            const hero = dict.privacy_hero_html || (enDict && enDict.privacy_hero_html) || '';
            const main = dict.privacy_main_html || (enDict && enDict.privacy_main_html) || '';

            if (titleElement) titleElement.textContent = title;
            if (metaDesc && meta) metaDesc.setAttribute("content", meta);

            heroContainer.innerHTML = hero;
            mainContainer.innerHTML = main;
        } else if (route === 'terms') {
            const title = dict.terms_title || (enDict && enDict.terms_title) || 'Terms & Conditions - Munendra Singh';
            const meta = dict.terms_meta || (enDict && enDict.terms_meta) || '';
            const hero = dict.terms_hero_html || (enDict && enDict.terms_hero_html) || '';
            const main = dict.terms_main_html || (enDict && enDict.terms_main_html) || '';

            if (titleElement) titleElement.textContent = title;
            if (metaDesc && meta) metaDesc.setAttribute("content", meta);

            heroContainer.innerHTML = hero;
            mainContainer.innerHTML = main;
        } else {
            const title = dict.landing_title || (enDict && enDict.landing_title) || 'Our Policies - Munendra Singh';
            const meta = dict.landing_meta || (enDict && enDict.landing_meta) || '';
            const hero = dict.landing_hero_html || (enDict && enDict.landing_hero_html) || '';
            const main = dict.landing_main_html || (enDict && enDict.landing_main_html) || '';

            if (titleElement) titleElement.textContent = title;
            if (metaDesc && meta) metaDesc.setAttribute("content", meta);

            heroContainer.innerHTML = hero;
            mainContainer.innerHTML = main;
        }

        // Apply translations to any dynamically inserted or header/footer elements
        if (window.applyLanguageTranslations) {
            window.applyLanguageTranslations();
        }

        setupSidebarObserver();
    }

    function setupSidebarObserver() {
        const links = document.querySelectorAll('.sidebar-link');
        if (links.length === 0) return;

        window.addEventListener('scroll', () => {
            let fromTop = window.scrollY + 120;
            links.forEach(link => {
                if (!link.hash) return;
                let section = document.querySelector(link.hash);
                if (section) {
                    if (section.offsetTop <= fromTop && section.offsetTop + section.offsetHeight > fromTop) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                }
            });
        });
    }

    // Re-render when languageChanged event fires
    window.addEventListener('languageChanged', (e) => {
        renderRoute(getRouteFromLocation());
    });

    // Re-render when localStorage changes
    window.addEventListener('storage', (e) => {
        if (e.key === 'preferred-language' || e.key === 'language-selected') {
            renderRoute(getRouteFromLocation());
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        // Dark / Light Mode Switcher
        const themeToggleBtn = document.getElementById('theme-toggle');
        if (themeToggleBtn) {
            const themeIcon = themeToggleBtn.querySelector('i');
            const savedTheme = localStorage.getItem('site-theme') || 'dark';

            document.documentElement.setAttribute('data-theme', savedTheme);
            if (themeIcon) {
                themeIcon.className = savedTheme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
            }

            themeToggleBtn.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('site-theme', newTheme);

                if (themeIcon) {
                    themeIcon.className = newTheme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
                }
            });
        }

        // Mobile Menu
        const hamburgerBtn = document.getElementById('hamburger-btn');
        const navMenu = document.getElementById('nav-menu');
        if (hamburgerBtn && navMenu) {
            const hamburgerIcon = hamburgerBtn.querySelector('i');

            hamburgerBtn.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                if (hamburgerIcon) {
                    hamburgerIcon.className = navMenu.classList.contains('active') ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
                }
            });
        }

        // Smart Navbar
        const header = document.getElementById('site-header');
        let lastScrollY = window.scrollY;

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            if (navMenu && navMenu.classList.contains('active')) return;

            if (header) {
                if (currentScrollY > lastScrollY && currentScrollY > 80) {
                    header.classList.add('nav-hidden');
                } else {
                    header.classList.remove('nav-hidden');
                }
            }
            lastScrollY = currentScrollY;
        });

        // Scroll to Top
        const scrollTopBtn = document.getElementById('scrollTopBtn');
        if (scrollTopBtn) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 300) {
                    scrollTopBtn.classList.add('show');
                } else {
                    scrollTopBtn.classList.remove('show');
                }
            });

            scrollTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // Initial Route Render
        renderRoute(getRouteFromLocation());
    });
})();
