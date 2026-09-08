/* ==========================================================================
   MOBILE NAVIGATION - ICON ONLY + SCROLL DIRECTION & MULTILINGUAL SUPPORT
   Keeps existing desktop navigation and page functionality unchanged.
   ========================================================================== */

(function () {
    'use strict';

    function initMobileNav() {
        const header = document.getElementById('site-header');
        if (!header) return;

        // Prevent duplicate initialization
        if (document.querySelector('.mobile-bottom-nav')) return;

        const currentPath = window.location.pathname.replace(/\\/g, '/');
        const inPagesFolder = /\/pages\//i.test(currentPath);
        const homeRoot = inPagesFolder ? '../home.html' : 'home.html';
        const pageLink = (file) => inPagesFolder ? `./${file}` : `./pages/${file}`;
        const privacyLink = pageLink('Privacy.html');
        const pageName = currentPath.split('/').pop() || (inPagesFolder ? 'service.html' : 'home.html');
        const returnParam = inPagesFolder ? `pages/${pageName}` : pageName;
        const languageLink = (inPagesFolder ? '../index.html?change=true&returnUrl=' : './index.html?change=true&returnUrl=') + encodeURIComponent(returnParam + window.location.search + window.location.hash);

        const getLabel = (key, fallback) => (window.t && window.t(key, fallback)) || fallback;

        // 1. Create Bottom Navigation Bar
        const nav = document.createElement('nav');
        nav.className = 'mobile-bottom-nav';
        nav.setAttribute('aria-label', 'Mobile navigation');
        nav.innerHTML = `
            <a href="${homeRoot}" class="mobile-nav-icon" data-nav="home" data-i18n-aria-label="common.mobileNav.home" data-i18n-title="common.mobileNav.home" aria-label="${getLabel('common.mobileNav.home', 'Home')}" title="${getLabel('common.mobileNav.home', 'Home')}">
                <i class="fa-solid fa-house"></i>
            </a>
            <a href="${pageLink('service.html')}" class="mobile-nav-icon" data-nav="services" data-i18n-aria-label="common.mobileNav.services" data-i18n-title="common.mobileNav.services" aria-label="${getLabel('common.mobileNav.services', 'Services')}" title="${getLabel('common.mobileNav.services', 'Services')}">
                <i class="fa-solid fa-briefcase"></i>
            </a>
            <a href="${pageLink('project.html')}" class="mobile-nav-icon" data-nav="projects" data-i18n-aria-label="common.mobileNav.projects" data-i18n-title="common.mobileNav.projects" aria-label="${getLabel('common.mobileNav.projects', 'Projects')}" title="${getLabel('common.mobileNav.projects', 'Projects')}">
                <i class="fa-solid fa-diagram-project"></i>
            </a>
            <a href="${pageLink('contact.html')}" class="mobile-nav-icon" data-nav="contact" data-i18n-aria-label="common.mobileNav.contact" data-i18n-title="common.mobileNav.contact" aria-label="${getLabel('common.mobileNav.contact', 'Contact')}" title="${getLabel('common.mobileNav.contact', 'Contact')}">
                <i class="fa-solid fa-phone"></i>
            </a>
            <button type="button" class="mobile-nav-icon mobile-more-toggle" data-nav="more" data-i18n-aria-label="common.mobileNav.more" data-i18n-title="common.mobileNav.more" aria-label="${getLabel('common.mobileNav.more', 'More')}" title="${getLabel('common.mobileNav.more', 'More')}" aria-expanded="false" aria-controls="mobile-more-menu">
                <i class="fa-solid fa-bars"></i>
            </button>
        `;

        // 2. Create More / Menu Popup
        const moreMenu = document.createElement('div');
        moreMenu.id = 'mobile-more-menu';
        moreMenu.className = 'mobile-more-menu';
        moreMenu.setAttribute('aria-hidden', 'true');
        moreMenu.innerHTML = `
            <a href="${pageLink('about_me.html')}"><i class="fa-solid fa-user"></i><span data-i18n="common.mobileNav.about">${getLabel('common.mobileNav.about', 'About')}</span></a>
            <a href="${pageLink('packages.html')}"><i class="fa-solid fa-box-open"></i><span data-i18n="common.mobileNav.packages">${getLabel('common.mobileNav.packages', 'Packages')}</span></a>
            <a href="${privacyLink}"><i class="fa-solid fa-lock"></i><span data-i18n="common.mobileNav.privacy">${getLabel('common.mobileNav.privacy', 'Privacy')}</span></a>
            <a href="${languageLink}"><i class="fa-solid fa-language"></i><span data-i18n="common.mobileNav.language">${getLabel('common.mobileNav.language', 'Language')}</span></a>
            <button type="button" class="mobile-more-theme"><i class="fa-solid fa-circle-half-stroke"></i><span data-i18n="common.mobileNav.theme">${getLabel('common.mobileNav.theme', 'Theme')}</span></button>
        `;

        document.body.appendChild(moreMenu);
        document.body.appendChild(nav);
        document.body.classList.add('has-bottom-nav');

        const updateNavHeight = () => {
            const h = nav.getBoundingClientRect().height || nav.offsetHeight || 64;
            if (h > 0) {
                document.documentElement.style.setProperty('--mobile-nav-height', `${h}px`);
            }
        };
        updateNavHeight();
        window.addEventListener('resize', updateNavHeight);
        window.addEventListener('orientationchange', () => setTimeout(updateNavHeight, 100));

        // 3. Mark active state based on current URL
        const pathLower = currentPath.toLowerCase();
        let active = 'home';
        if (pathLower.includes('service.html')) active = 'services';
        else if (pathLower.includes('project.html')) active = 'projects';
        else if (pathLower.includes('contact.html')) active = 'contact';
        else if (pathLower.includes('about_me.html') || pathLower.includes('packages.html') || pathLower.includes('privacy.html')) active = 'more';
        
        const activeItem = nav.querySelector(`[data-nav="${active}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }

        // 4. Menu Toggle Handlers
        const moreToggle = nav.querySelector('.mobile-more-toggle');
        const closeMore = () => {
            moreMenu.classList.remove('show');
            moreMenu.setAttribute('aria-hidden', 'true');
            if (moreToggle) moreToggle.setAttribute('aria-expanded', 'false');
        };
        const openMore = () => {
            moreMenu.classList.add('show');
            moreMenu.setAttribute('aria-hidden', 'false');
            if (moreToggle) moreToggle.setAttribute('aria-expanded', 'true');
        };

        if (moreToggle) {
            moreToggle.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                if (moreMenu.classList.contains('show')) {
                    closeMore();
                } else {
                    openMore();
                }
            });
        }

        moreMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMore);
        });

        const themeBtn = moreMenu.querySelector('.mobile-more-theme');
        if (themeBtn) {
            themeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const desktopThemeBtn = document.getElementById('theme-toggle');
                if (desktopThemeBtn) {
                    desktopThemeBtn.click();
                } else {
                    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
                    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                    document.documentElement.setAttribute('data-theme', newTheme);
                    localStorage.setItem('site-theme', newTheme);
                }
                closeMore();
            });
        }

        document.addEventListener('click', (event) => {
            if (!moreMenu.contains(event.target) && !moreToggle.contains(event.target)) {
                closeMore();
            }
        });

        // 5. Dynamic Language Reactivity
        function translateMobileNav() {
            if (window.applyLanguageTranslations) {
                window.applyLanguageTranslations(nav);
                window.applyLanguageTranslations(moreMenu);
            }
        }
        translateMobileNav();
        window.addEventListener('languageChanged', translateMobileNav);

        // 6. Hide/show navigation bars on scroll
        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateNavigation = () => {
            const currentScrollY = window.scrollY;
            const goingDown = currentScrollY > lastScrollY;
            const goingUp = currentScrollY < lastScrollY;

            if (currentScrollY <= 0 || goingUp) {
                header.classList.remove('nav-hidden');
                nav.classList.remove('mobile-nav-hidden');
                document.body.classList.remove('mobile-nav-hidden');
                closeMore();
            } else if (goingDown && currentScrollY > 60) {
                header.classList.add('nav-hidden');
                nav.classList.add('mobile-nav-hidden');
                document.body.classList.add('mobile-nav-hidden');
                closeMore();
            }

            lastScrollY = currentScrollY;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateNavigation);
                ticking = true;
            }
        }, { passive: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileNav);
    } else {
        initMobileNav();
    }
})();
