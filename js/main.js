/**
 * Main JavaScript File
 * Handles Navigation, Template Filtering, and Template Detail Injection
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initCurrentPageHighlight();

    // Detect current page with robust normalization for live/Cloudflare env
    const currentPage = document.body.getAttribute('data-page');
    const pathname = window.location.pathname;
    const cleanPath = pathname.toLowerCase().replace('.html', '').replace(/\/$/, '') || '/';

    // Page Specific Constants
    const isHome = currentPage === 'home' || cleanPath === '/' || cleanPath === '/index';
    const isTemplates = cleanPath.endsWith('/templates');
    const isTemplateDetail = cleanPath.endsWith('/template');
    const isServices = cleanPath.endsWith('/services');

    // Initialize motion system (Phase 4)
    if (isHome) {
        // Handle video playback based on reduced motion/mobile
        if (typeof handleVideoPlayback === 'function') {
            handleVideoPlayback();
        }

        // Initialize home motion system (Phase 4)
        if (typeof initHomeMotion === 'function') {
            initHomeMotion();
        }
    }

    // Starter Sites (Templates) page
    if (isTemplates) {
        initTemplateFilter();

        // Add card tilt effect (Phase 4)
        if (typeof templatesCardTilt === 'function') {
            // Delay to ensure cards are rendered
            setTimeout(templatesCardTilt, 100);
        }
    }

    // Template detail page
    if (isTemplateDetail) {
        initTemplateDetail();
    }

    // Services page - Init FAQ Accordion (Phase C)
    if (isServices) {
        initFAQAccordion();
    }
});

/* Navigation Toggle */
function initNavigation() {
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.main-nav');

    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            nav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', nav.classList.contains('is-open'));
        });
    }
}

/* Active Link Highlight */
function initCurrentPageHighlight() {
    const links = document.querySelectorAll('.nav-link');
    const currentPath = window.location.pathname;

    links.forEach(link => {
        const href = link.getAttribute('href');
        const cleanPath = currentPath.toLowerCase().replace('.html', '').replace(/\/$/, '') || '/';
        const cleanHref = href.toLowerCase().replace('.html', '').replace(/\/$/, '') || '/';

        if (cleanPath.endsWith(cleanHref) || 
            (currentPath === '/' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

/* Template Data */
const templates = [
    { id: 'trades', name: 'Trades & Services', category: 'trades', image: 'assets/images/templates/thumb-trades.jpg', slug: 'trades' },
    { id: 'salon', name: 'Beauty & Wellness', category: 'beauty', image: 'assets/images/templates/thumb-salon.jpg', slug: 'salon' },
    { id: 'creative', name: 'Creative Portfolio', category: 'creative', image: 'assets/images/templates/thumb-creative.jpg', slug: 'creative' },
    { id: 'corporate', name: 'Corporate Minimal', category: 'professional', image: 'assets/images/templates/thumb-corporate.jpg', slug: 'corporate' },
    { id: 'community', name: 'Community & Retail', category: 'retail', image: 'assets/images/templates/thumb-community.jpg', slug: 'community' },
    { id: 'food', name: 'Restaurant & Food', category: 'food', image: 'assets/images/templates/thumb-food.jpg', slug: 'food' },
    { id: 'fitness', name: 'Fitness & Gym', category: 'fitness', image: 'assets/images/templates/thumb-gym.jpg', slug: 'fitness' },
    { id: 'ecommerce', name: 'E-commerce Store', category: 'ecommerce', image: 'assets/images/templates/thumb-ecommerce.jpg', slug: 'ecommerce' },
    { id: 'creator', name: 'Creator Hub', category: 'creator', image: 'assets/images/templates/thumb-creator.jpg', slug: 'creator' }
];

/* Template Filter */
function initTemplateFilter() {
    const buttons = document.querySelectorAll('.filter-btn');
    const grid = document.querySelector('#template-grid');

    if (!grid) return;

    // Initial Render
    renderTemplates(templates); // Default all

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Active State
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.dataset.category;
            const filtered = category === 'all'
                ? templates
                : templates.filter(t => t.category === category);

            renderTemplates(filtered);
        });
    });
}

function renderTemplates(list) {
    const grid = document.querySelector('#template-grid');
    grid.innerHTML = '';

    if (list.length === 0) {
        grid.innerHTML = '<p class="text-muted text-center" style="grid-column: 1/-1;">No templates found in this category.</p>';
        return;
    }

    list.forEach(t => {
        const card = document.createElement('div');
        card.className = 'card template-card';
        card.innerHTML = `
            <div class="card-image">
                <img src="${t.image}" alt="${t.name}" 
                     onerror="this.onerror=null; this.style.display='none'; this.parentElement.style.background='linear-gradient(135deg, var(--accent-cyan), var(--accent-magenta))';">
                <span class="card-image-fallback" style="font-size: 2rem; opacity: 0.5; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;">${t.name.charAt(0)}</span>
            </div>
            <h3 class="card-title">${t.name}</h3>
            <div class="card-meta">${formatCategory(t.category)}</div>
            <a href="template.html?slug=${t.slug}" class="btn btn-secondary btn-block">View Details</a>
        `;
        grid.appendChild(card);
    });
}

/* Template Detail Injection */
function initTemplateDetail() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');

    if (!slug) {
        window.location.href = 'templates.html';
        return;
    }

    const template = templates.find(t => t.slug === slug);

    if (template) {
        document.getElementById('template-title').textContent = template.name;
        document.getElementById('template-category').textContent = formatCategory(template.category);
        document.title = `${template.name} | Flux Web Studio`;

        // Inject template preview image
        const previewSection = document.querySelector('.template-preview');
        if (previewSection) {
            previewSection.innerHTML = `
                <img src="${template.image}" alt="${template.name} Preview" loading="lazy"
                     onerror="this.onerror=null; this.style.display='none'; this.parentElement.style.background='linear-gradient(135deg, var(--accent-cyan), var(--accent-magenta))'; this.parentElement.innerHTML='<div style=\"display: flex; align-items: center; justify-content: center; height: 100%; color: rgba(255,255,255,0.3); font-size: 2rem;\">${template.name.charAt(0)}</div>';">
            `;
        }

        // Auto-fill contact subject
        const contactBtn = document.getElementById('enquire-btn');
        if (contactBtn) {
            contactBtn.href = `contact.html?subject=Template%20Enquiry%3A%20${encodeURIComponent(template.name)}`;
        }
    } else {
        document.getElementById('template-content').innerHTML = `
            <div class="container text-center" style="padding: 4rem 0;">
                <h1>Template Not Found</h1>
                <p>The template you are looking for does not exist.</p>
                <a href="templates.html" class="btn btn-primary" style="margin-top: 2rem;">Back to Templates</a>
            </div>
        `;
    }
}

function formatCategory(cat) {
    const map = {
        'trades': 'Trades & Services',
        'beauty': 'Beauty & Wellness',
        'creative': 'Creative',
        'professional': 'Professional Services',
        'retail': 'Community & Retail',
        'food': 'Food',
        'fitness': 'Fitness',
        'ecommerce': 'E-commerce',
        'creator': 'Creator'
    };
    return map[cat] || cat;
}

/* FAQ Accordion (Phase C) */
function initFAQAccordion() {
    const faqQuestions = document.querySelectorAll('.faq-question');

    if (!faqQuestions.length) return;

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.closest('.faq-item');
            const wasActive = item.classList.contains('active');

            // Close all FAQ items
            document.querySelectorAll('.faq-item').forEach(faqItem => {
                faqItem.classList.remove('active');
            });

            // Toggle current if it wasn't already open
            if (!wasActive) {
                item.classList.add('active');
            }
        });
    });
}

