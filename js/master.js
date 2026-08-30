/* ==========================================================================
   MASTER JAVASCRIPT - MUNENDRA SINGH PORTFOLIO (SERVES ALL PAGES)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
        setupFaqAccordion();

    /* --- 1. DARK / LIGHT MODE SWITCHER --- */
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

    /* --- 2. MOBILE MENU (HAMBURGER) --- */
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');
    if (hamburgerBtn && navMenu) {
        const hamburgerIcon = hamburgerBtn.querySelector('i');

        hamburgerBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            if (hamburgerIcon) {
                hamburgerIcon.className = navMenu.classList.contains('active')
                    ? 'fa-solid fa-xmark'
                    : 'fa-solid fa-bars';
            }
        });

        // Close menu when a link is clicked
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                if (hamburgerIcon) hamburgerIcon.className = 'fa-solid fa-bars';
            });
        });
    }

    /* --- 3. SMART NAVBAR (HIDE ON SCROLL DOWN, SHOW ON SCROLL UP) --- */
    const header = document.getElementById('site-header');
    let lastScrollY = window.scrollY;

    if (header) {
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;

            if (navMenu && navMenu.classList.contains('active')) return;

            if (currentScrollY > lastScrollY && currentScrollY > 80) {
                header.classList.add('nav-hidden');
            } else {
                header.classList.remove('nav-hidden');
            }
            lastScrollY = currentScrollY;
        });
    }

    /* --- 4. SCROLL TO TOP BUTTON --- */
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
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    /* --- 5. DYNAMIC PROJECT RENDER & FILTERING FROM JS DATA --- */
    const projectsGrid = document.querySelector('.projects-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');

    if (projectsGrid) {
        const viewProjectText = (window.t && window.t('projects_page.viewProject', 'View Project')) || 'View Project';

        // 1. Function to render projects HTML
        function renderProjects(projects) {
            const viewText = (window.t && window.t('projects_page.viewProject', 'View Project')) || 'View Project';
            projectsGrid.innerHTML = projects.map(project => `
                <div class="project-card" data-category="${project.category}">
                    <div class="project-thumb" style="background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url('${project.image}'); color: white; padding: 16px;">
                        ${project.brandName ? `<span style="font-size: 0.65rem; font-weight: bold; background: rgba(0,0,0,0.5); padding: 2px 6px; border-radius: 3px;">${project.brandName}</span>` : ''}
                        <h4 style="font-size: 0.85rem; font-weight: bold; margin-top: ${project.brandName ? '35px' : '45px'}; color: #ffffff;">${project.tagline}</h4>
                    </div>
                    <div class="project-content">
                        <span class="category-badge ${project.categoryBadge.class}">${project.categoryBadge.text}</span>
                        <h3>${project.title}</h3>
                        <p>${project.description}</p>
                        <div class="tech-tags">
                            ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                        </div>
                        <a href="${project.projectUrl}" target="_blank" rel="noopener noreferrer" class="view-project-link">${viewText} <i class="fa-solid fa-arrow-right"></i></a>
                    </div>
                </div>
            `).join('');
        }

        // 2. Main Filter Function
        window.applyCategoryFilter = function(category) {
            if (!category) category = 'all';

            // Update Active Button UI
            filterButtons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${category}'`)) {
                    btn.classList.add('active');
                }
            });

            // Show / Hide Project Cards
            const cards = document.querySelectorAll('.project-card');
            cards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                if (category === 'all' || cardCategory === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        };

        // Click Handler for Filter Buttons
        window.filterProjects = function(event, category) {
            if (event) event.preventDefault();
            window.applyCategoryFilter(category);
        };

        // 3. Helper to Check URL Parameter and Apply
        function checkUrlAndFilter() {
            const urlParams = new URLSearchParams(window.location.search);
            const filterParam = urlParams.get('filter');
            
            window.applyCategoryFilter(filterParam || 'all');

            if (filterParam) {
                setTimeout(() => {
                    const filterSection = document.getElementById('project-filters');
                    if (filterSection) {
                        filterSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 100);
            }
        }

        // 4. Initial Render
        if (typeof projectsData !== 'undefined') {
            renderProjects(projectsData);
            checkUrlAndFilter();
        }

        // Re-render when language changes
        window.addEventListener('languageChanged', () => {
            if (typeof projectsData !== 'undefined') {
                const currentFilter = document.querySelector('.filter-btn.active');
                const category = currentFilter ? currentFilter.getAttribute('onclick').match(/'([^']+)'/)[1] : 'all';
                renderProjects(projectsData);
                window.applyCategoryFilter(category);
            }
        });

        // 5. Listen for URL changes without page reload
        window.addEventListener('popstate', checkUrlAndFilter);
    }
    
    /* --- 6. WHATSAPP FORM SUBMISSION HANDLER (CONTACT PAGE) --- */
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('user-name') ? document.getElementById('user-name').value.trim() : '';
            const email = document.getElementById('user-email') ? document.getElementById('user-email').value.trim() : '';
            const phone = document.getElementById('user-phone') ? document.getElementById('user-phone').value.trim() : '';
            const subject = document.getElementById('user-subject') ? document.getElementById('user-subject').value.trim() : '';
            const message = document.getElementById('user-message') ? document.getElementById('user-message').value.trim() : '';

            // Form Validations with Multilingual Alert Messages
            if (!name) {
                alert((window.t && window.t('common.alerts.nameReq', 'Please enter your name.')) || 'Please enter your name.');
                return;
            }

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email || !emailPattern.test(email)) {
                alert((window.t && window.t('common.alerts.emailReq', 'Please enter a valid email address.')) || 'Please enter a valid email address.');
                return;
            }

            if (!message) {
                alert((window.t && window.t('common.alerts.msgReq', 'Please enter your message.')) || 'Please enter your message.');
                return;
            }

            // Format message for WhatsApp
            const titleText = (window.t && window.t('common.alerts.waEnquiryTitle', '*New Website Enquiry*')) || '*New Website Enquiry*';
            const nameLabel = (window.t && window.t('common.alerts.waName', '*Name:*')) || '*Name:*';
            const emailLabel = (window.t && window.t('common.alerts.waEmail', '*Email:*')) || '*Email:*';
            const phoneLabel = (window.t && window.t('common.alerts.waPhone', '*Phone:*')) || '*Phone:*';
            const subjectLabel = (window.t && window.t('common.alerts.waSubject', '*Subject:*')) || '*Subject:*';
            const msgLabel = (window.t && window.t('common.alerts.waMessage', '*Message:*')) || '*Message:*';

            let formattedMessage = `${titleText}\n\n` +
                `${nameLabel} ${name}\n` +
                `${emailLabel} ${email}\n`;

            if (phone) formattedMessage += `${phoneLabel} ${phone}\n`;
            if (subject) formattedMessage += `${subjectLabel} ${subject}\n`;
            formattedMessage += `\n${msgLabel}\n${message}`;

            const targetNumber = '919105523282';
            const encodedMessage = encodeURIComponent(formattedMessage);
            const whatsappUrl = `https://wa.me/${targetNumber}?text=${encodedMessage}`;

            window.open(whatsappUrl, '_blank');
            alert((window.t && window.t('common.alerts.waReady', 'Your message is ready to send on WhatsApp.')) || 'Your message is ready to send on WhatsApp.');
            contactForm.reset();
        });
    }
});

/* --- 7. AUTO SCROLL TO SECTION FROM URL HASH --- */
if (window.location.hash) {
    const targetElement = document.querySelector(window.location.hash);
    if (targetElement) {
        setTimeout(() => {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 300);
    }
}


    // FAQ Accordion Handler
    function setupFaqAccordion() {
        const faqItems = document.querySelectorAll('.faq-item');
        if (!faqItems || faqItems.length === 0) return;

        faqItems.forEach(item => {
            const questionBtn = item.querySelector('.faq-question');
            if (!questionBtn) return;

            questionBtn.addEventListener('click', () => {
                const isOpen = item.classList.contains('active');

                // Close other items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        const otherBtn = otherItem.querySelector('.faq-question');
                        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                    }
                });

                // Toggle current item
                if (isOpen) {
                    item.classList.remove('active');
                    questionBtn.setAttribute('aria-expanded', 'false');
                } else {
                    item.classList.add('active');
                    questionBtn.setAttribute('aria-expanded', 'true');
                }
            });
        });
    }
