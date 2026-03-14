/**
 * Utilities
 * Helper functions for safe selectors and motion detection
 */

/**
 * Safe querySelector that returns null instead of throwing
 * @param {string} selector - CSS selector
 * @param {HTMLElement} context - Context element (defaults to document)
 * @returns {HTMLElement|null}
 */
function safeQuery(selector, context = document) {
    try {
        return context.querySelector(selector);
    } catch (e) {
        console.warn(`Invalid selector: ${selector}`, e);
        return null;
    }
}

/**
 * Safe querySelectorAll that returns empty array instead of throwing
 * @param {string} selector - CSS selector
 * @param {HTMLElement} context - Context element (defaults to document)
 * @returns {NodeList|Array}
 */
function safeQueryAll(selector, context = document) {
    try {
        return context.querySelectorAll(selector);
    } catch (e) {
        console.warn(`Invalid selector: ${selector}`, e);
        return [];
    }
}

/**
 * Debounce function for performance
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function}
 */
function debounce(func, wait = 250) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Check if element is in viewport
 * @param {HTMLElement} el - Element to check
 * @param {number} offset - Offset from viewport edge
 * @returns {boolean}
 */
function isInViewport(el, offset = 0) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= -offset &&
        rect.left >= -offset &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) + offset
    );
}

/**
 * Check device capabilities
 * @returns {object} Device capability flags
 */
function getDeviceCapabilities() {
    return {
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        hasHover: window.matchMedia('(hover: hover)').matches,
        hasPointer: window.matchMedia('(pointer: fine)').matches,
        isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        isDesktop: window.innerWidth >= 1024,
        isTablet: window.innerWidth >= 641 && window.innerWidth < 1024,
        isMobile: window.innerWidth < 641
    };
}

console.log('Flux Web Studio: Utils Loaded');
