(function () {
    // If language is already selected, allow direct visit
    const selected = localStorage.getItem('language-selected') === 'true' ||
                     !!localStorage.getItem('preferred-language');

    if (selected) return;

    // Remember the exact page the visitor originally requested
    const currentPath = window.location.pathname.replace(/\\/g, '/');
    const returnUrl = currentPath + window.location.search + window.location.hash;
    
    // Don't save return url if already on gateway
    if (!currentPath.endsWith('/index.html') && currentPath !== '/') {
        sessionStorage.setItem('pending-language-return-url', returnUrl);
    }

    // Determine root gateway path
    const inPagesFolder = /\/pages\//i.test(currentPath);
    const rootPath = inPagesFolder ? '../index.html' : './index.html';
    window.location.replace(rootPath);
})();
