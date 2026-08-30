function selectLanguage(lang) {
    if (!lang) return;

    // Normalize lang ('en', 'hi', 'hinglish')
    let normalized = lang;
    if (lang === 'english') normalized = 'en';
    if (lang === 'hindi') normalized = 'hi';

    try {
        localStorage.setItem('preferred-language', normalized);
        localStorage.setItem('language-selected', 'true');
    } catch (e) {
        console.warn('Storage write error:', e);
    }

    // Identify return destination
    let destination = './home.html';

    // 1. Check URL query params for returnUrl
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const returnParam = urlParams.get('returnUrl') || urlParams.get('return') || urlParams.get('redirect');
        if (returnParam) {
            destination = resolveDestination(returnParam);
        }
    } catch (e) {}

    // 2. Check sessionStorage if not found in query params
    if (destination === './home.html') {
        try {
            const pendingUrl = sessionStorage.getItem('pending-language-return-url');
            if (pendingUrl) {
                sessionStorage.removeItem('pending-language-return-url');
                destination = resolveDestination(pendingUrl);
            }
        } catch (e) {}
    }

    // 3. Check document.referrer if still home.html
    if (destination === './home.html' && document.referrer) {
        try {
            const refUrl = new URL(document.referrer);
            if (refUrl.origin === window.location.origin) {
                const refPath = refUrl.pathname;
                if (!refPath.endsWith('/index.html') && refPath !== '/' && !refPath.endsWith('\index.html')) {
                    destination = resolveDestination(refPath + refUrl.search + refUrl.hash);
                }
            }
        } catch (e) {}
    }

    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.35s ease';
    setTimeout(() => {
        window.location.href = destination;
    }, 350);
}

function resolveDestination(rawUrl) {
    if (!rawUrl) return './home.html';

    // Clean legacy language folder prefixes if present
    let url = rawUrl.replace(/\/(english|hindi|hinglish)(\/|$)/i, '/');
    
    let path = url;
    let searchAndHash = '';

    if (url.startsWith('http://') || url.startsWith('https://')) {
        try {
            const parsed = new URL(url);
            path = parsed.pathname;
            searchAndHash = parsed.search + parsed.hash;
        } catch (e) {
            path = url;
        }
    } else {
        const hashIdx = path.indexOf('#');
        const qIdx = path.indexOf('?');
        if (hashIdx !== -1 || qIdx !== -1) {
            const splitIdx = (qIdx !== -1 && hashIdx !== -1) ? Math.min(qIdx, hashIdx) : (qIdx !== -1 ? qIdx : hashIdx);
            searchAndHash = path.substring(splitIdx);
            path = path.substring(0, splitIdx);
        }
    }

    path = path.replace(/\\/g, '/');

    // Filter out gateway / root
    if (path.endsWith('/index.html') || path === 'index.html' || path === '/') {
        return './home.html' + searchAndHash;
    }

    // Inner page matches
    if (path.includes('about_me.html') || path.endsWith('about_me.html')) {
        return './pages/about_me.html' + searchAndHash;
    }
    if (path.includes('service.html') || path.endsWith('service.html')) {
        return './pages/service.html' + searchAndHash;
    }
    if (path.includes('project.html') || path.endsWith('project.html')) {
        return './pages/project.html' + searchAndHash;
    }
    if (path.includes('packages.html') || path.endsWith('packages.html')) {
        return './pages/packages.html' + searchAndHash;
    }
    if (path.includes('contact.html') || path.endsWith('contact.html')) {
        return './pages/contact.html' + searchAndHash;
    }
    if (path.toLowerCase().includes('privacy.html')) {
        return './pages/Privacy.html' + searchAndHash;
    }
    if (path.includes('home.html') || path.endsWith('home.html')) {
        return './home.html' + searchAndHash;
    }

    if (path.includes('/pages/')) {
        const sub = path.substring(path.indexOf('/pages/'));
        return '.' + sub + searchAndHash;
    }

    return './home.html' + searchAndHash;
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Theme Switcher Logic
    const themeBtn = document.getElementById('theme-toggle');
    const htmlEl = document.documentElement;

    function updateThemeIcon(theme) {
        if (!themeBtn) return;
        const icon = themeBtn.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
        }
    }

    const currentTheme = htmlEl.getAttribute('data-theme') || 'dark';
    updateThemeIcon(currentTheme);

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const activeTheme = htmlEl.getAttribute('data-theme');
            const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
            htmlEl.setAttribute('data-theme', newTheme);
            localStorage.setItem('site-theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }

    // 2. Language Cards Event Listener
    const langCards = document.querySelectorAll('.lang-card');

    langCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const chosenLang = card.getAttribute('data-lang');
            selectLanguage(chosenLang);
        });

        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const chosenLang = card.getAttribute('data-lang');
                selectLanguage(chosenLang);
            }
        });

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // 3. Scroll Navbar Hide/Show & Scroll-To-Top Button
    let lastScrollY = window.pageYOffset;
    let ticking = false;
    const scrollThreshold = 8;
    const header = document.getElementById('site-header');
    const scrollTopBtn = document.getElementById('scrollTopBtn');

    function updateScrollState() {
        const currentScrollY = window.pageYOffset;

        if (currentScrollY <= 10) {
            if (header) header.classList.remove('nav-hidden');
        } else if (Math.abs(currentScrollY - lastScrollY) > scrollThreshold) {
            if (currentScrollY > lastScrollY) {
                if (header) header.classList.add('nav-hidden');
            } else {
                if (header) header.classList.remove('nav-hidden');
            }
            lastScrollY = currentScrollY;
        }

        if (scrollTopBtn) {
            if (currentScrollY > 300) {
                scrollTopBtn.classList.add('show');
            } else {
                scrollTopBtn.classList.remove('show');
            }
        }

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateScrollState);
            ticking = true;
        }
    });

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 4. Initial Entrance Timeline Animations
    const loadTimeline = [
        { id: 'site-header', delay: 100 },
        { id: 'hero-welcome-en', delay: 350 },
        { id: 'hero-desc-en', delay: 550 },
        { id: 'hero-desc-hi', delay: 600 },
        { id: 'hero-prompt', delay: 650 },
        { id: 'card-hindi', delay: 750 },
        { id: 'card-hinglish', delay: 850 },
        { id: 'card-english', delay: 950 }
    ];

    loadTimeline.forEach(item => {
        const el = document.getElementById(item.id);
        if (el) {
            setTimeout(() => {
                el.classList.add('animate-in');
            }, item.delay);
        }
    });

    const dividers = document.querySelectorAll('.or-divider');
    dividers.forEach((divider, index) => {
        setTimeout(() => {
            divider.classList.add('animate-in');
        }, 800 + (index * 100));
    });

    // 5. Scroll Reveal Observer
    const revealElements = document.querySelectorAll('.scroll-reveal');
    revealElements.forEach(el => el.classList.add('animate-ready'));

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.15
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => revealObserver.observe(el));
});
