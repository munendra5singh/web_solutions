/* ==========================================================================
   CENTRAL LANGUAGE ENGINE - MUNENDRA SINGH PORTFOLIO
   Handles dynamic translation, attribute binding, icon preservation & events.
   ========================================================================== */

(function() {
    'use strict';

    const DEFAULT_LANG = 'en';
    const STORAGE_KEY = 'preferred-language';

    // Normalize language codes
    function normalizeLang(lang) {
        if (!lang) return DEFAULT_LANG;
        const l = lang.toLowerCase().trim();
        if (l === 'english' || l === 'en') return 'en';
        if (l === 'hindi' || l === 'hi') return 'hi';
        if (l === 'hinglish') return 'hinglish';
        return l;
    }

    // Get active language
    function getActiveLanguage() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const urlLang = urlParams.get('lang');
            if (urlLang) {
                const normalized = normalizeLang(urlLang);
                if (window.languageDictionary && window.languageDictionary[normalized]) {
                    return normalized;
                }
            }

            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const normalized = normalizeLang(stored);
                if (window.languageDictionary && window.languageDictionary[normalized]) {
                    return normalized;
                }
            }
        } catch (e) {
            console.warn('Language preference storage error:', e);
        }

        return DEFAULT_LANG;
    }

    let currentLanguage = getActiveLanguage();

    // Deep lookup helper
    function lookup(obj, path) {
        if (!obj || !path) return undefined;
        const keys = path.split('.');
        let val = obj;
        for (let i = 0; i < keys.length; i++) {
            if (val === null || val === undefined || typeof val !== 'object') {
                return undefined;
            }
            val = val[keys[i]];
        }
        return val;
    }

    // Translation function with fallback: Current Lang -> English -> Fallback Text -> Key
    function t(keyPath, fallback) {
        if (!window.languageDictionary) return fallback !== undefined ? fallback : keyPath;

        const currentDict = window.languageDictionary[currentLanguage];
        let val = lookup(currentDict, keyPath);

        // Fallback to English if not found or empty
        if ((val === undefined || val === null || val === '') && currentLanguage !== DEFAULT_LANG) {
            val = lookup(window.languageDictionary[DEFAULT_LANG], keyPath);
        }

        if (val !== undefined && val !== null && val !== '') {
            return val;
        }

        return fallback !== undefined ? fallback : keyPath;
    }

    // Smart content updater that preserves child icons like <i class="..."></i>
    function updateElementText(el, translation) {
        if (typeof translation !== 'string') return;

        // If translation has HTML markup (like <span>, <br>, <strong>), use innerHTML
        if (/<[a-z][\s\S]*>/i.test(translation)) {
            el.innerHTML = translation;
            return;
        }

        // Check if element has <i> child icon
        const icons = el.querySelectorAll('i');
        if (icons.length > 0) {
            // Check whether first or last child is an icon
            const firstIsIcon = el.firstElementChild && el.firstElementChild.tagName.toLowerCase() === 'i';
            const lastIsIcon = el.lastElementChild && el.lastElementChild.tagName.toLowerCase() === 'i';

            if (firstIsIcon && lastIsIcon && el.firstElementChild !== el.lastElementChild) {
                // Both sides have icons
                const iconStart = el.firstElementChild.cloneNode(true);
                const iconEnd = el.lastElementChild.cloneNode(true);
                el.innerHTML = '';
                el.appendChild(iconStart);
                el.appendChild(document.createTextNode(' ' + translation.trim() + ' '));
                el.appendChild(iconEnd);
            } else if (firstIsIcon) {
                const iconStart = el.firstElementChild.cloneNode(true);
                el.innerHTML = '';
                el.appendChild(iconStart);
                el.appendChild(document.createTextNode(' ' + translation.trim()));
            } else if (lastIsIcon) {
                const iconEnd = el.lastElementChild.cloneNode(true);
                el.innerHTML = '';
                el.appendChild(document.createTextNode(translation.trim() + ' '));
                el.appendChild(iconEnd);
            } else {
                el.textContent = translation;
            }
        } else {
            el.textContent = translation;
        }
    }

    // Apply translations across the document
    function applyTranslations(root) {
        const doc = root || document;
        if (!doc) return;

        // 1. Update <html lang="..."> and data-lang attribute
        document.documentElement.lang = currentLanguage;
        document.documentElement.setAttribute('data-lang', currentLanguage);

        // 2. Translate Text & HTML elements: [data-i18n]
        const textElements = doc.querySelectorAll('[data-i18n]');
        textElements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (!key) return;
            const translation = t(key, null);
            if (translation !== null) {
                updateElementText(el, translation);
            }
        });

        // 3. Translate Placeholders: [data-i18n-placeholder]
        const placeholderElements = doc.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (!key) return;
            const translation = t(key, null);
            if (translation !== null) {
                el.placeholder = translation;
            }
        });

        // 4. Translate Titles: [data-i18n-title]
        const titleElements = doc.querySelectorAll('[data-i18n-title]');
        titleElements.forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            if (!key) return;
            const translation = t(key, null);
            if (translation !== null) {
                el.title = translation;
            }
        });

        // 5. Translate Aria-Labels: [data-i18n-aria-label]
        const ariaElements = doc.querySelectorAll('[data-i18n-aria-label]');
        ariaElements.forEach(el => {
            const key = el.getAttribute('data-i18n-aria-label');
            if (!key) return;
            const translation = t(key, null);
            if (translation !== null) {
                el.setAttribute('aria-label', translation);
            }
        });

        // 6. Translate Alt text: [data-i18n-alt]
        const altElements = doc.querySelectorAll('[data-i18n-alt]');
        altElements.forEach(el => {
            const key = el.getAttribute('data-i18n-alt');
            if (!key) return;
            const translation = t(key, null);
            if (translation !== null) {
                el.alt = translation;
            }
        });

        // 7. Translate Values: [data-i18n-value]
        const valueElements = doc.querySelectorAll('[data-i18n-value]');
        valueElements.forEach(el => {
            const key = el.getAttribute('data-i18n-value');
            if (!key) return;
            const translation = t(key, null);
            if (translation !== null) {
                el.value = translation;
            }
        });

        // 8. Translate Page Title if attribute exists
        const pageTitleKey = document.querySelector('[data-i18n-page-title]');
        if (pageTitleKey) {
            const key = pageTitleKey.getAttribute('data-i18n-page-title');
            const translation = t(key, null);
            if (translation !== null) {
                document.title = translation;
            }
        }

        // 9. Translate Meta Description if attribute exists
        const metaDescEl = document.querySelector('meta[name="description"][data-i18n-meta-desc]');
        if (metaDescEl) {
            const key = metaDescEl.getAttribute('data-i18n-meta-desc');
            const translation = t(key, null);
            if (translation !== null) {
                metaDescEl.setAttribute('content', translation);
            }
        }

                // 10. Translate Dynamic Language Name Indicators: [data-lang-current-name]
        const activeLang = currentLanguage;
        const langDisplayNames = {
            'en': 'English',
            'hi': 'हिंदी',
            'hinglish': 'Hinglish'
        };
        const langDisplayName = (window.languageDictionary && window.languageDictionary[activeLang] && window.languageDictionary[activeLang].meta && window.languageDictionary[activeLang].meta.langName) ||
                               langDisplayNames[activeLang] ||
                               (activeLang.charAt(0).toUpperCase() + activeLang.slice(1));

        const langNameElements = doc.querySelectorAll('[data-lang-current-name]');
        langNameElements.forEach(el => {
            el.textContent = langDisplayName;
        });
    }

    // Switch active language and update UI
    function setLanguage(lang) {
        const normalized = normalizeLang(lang);
        currentLanguage = normalized;
        try {
            localStorage.setItem(STORAGE_KEY, normalized);
            localStorage.setItem('language-selected', 'true');
        } catch (e) {
            console.warn('Unable to save language preference:', e);
        }

        applyTranslations();

        // Dispatch event for dynamic sub-components
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: normalized }
        }));
    }

    // Expose API globally
    window.t = t;
    window.getTranslation = t;
    window.getLanguage = () => currentLanguage;
    window.setLanguage = setLanguage;

    // Language link click interceptor to preserve exact current page + state
    document.addEventListener('click', (e) => {
        const target = e.target.closest('a');
        if (!target) return;
        const href = target.getAttribute('href');
        if (href && (href.includes('index.html?change=true') || target.getAttribute('data-i18n') === 'common.footer.language' || target.getAttribute('data-i18n') === 'common.mobileNav.language')) {
            try {
                const currentPath = window.location.pathname.replace(/\\/g, '/');
                const inPagesFolder = /\/pages\//i.test(currentPath);
                const pageName = currentPath.split('/').pop() || 'home.html';
                const returnVal = (inPagesFolder ? `pages/${pageName}` : (pageName === 'index.html' ? 'home.html' : pageName)) + window.location.search + window.location.hash;
                sessionStorage.setItem('pending-language-return-url', returnVal);
            } catch (err) {}
        }
    });

    window.applyLanguageTranslations = applyTranslations;

    // Apply translations immediately
    currentLanguage = getActiveLanguage();
    if (document.body) {
        applyTranslations();
    }

    // Also run on DOMContentLoaded and Load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            currentLanguage = getActiveLanguage();
            applyTranslations();
        });
    }

    window.addEventListener('load', () => {
        currentLanguage = getActiveLanguage();
        applyTranslations();
    });
})();
