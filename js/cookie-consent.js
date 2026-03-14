/**
 * Cookie Consent & Analytics Manager (Phase 6)
 * UK/EU compliant cookie consent with Google Analytics 4 integration
 * 
 * Features:
 * - localStorage-based consent persistence
 * - GA4 dynamically loaded only after consent
 * - Non-blocking UI
 * - Privacy-first approach
 */

(function () {
    'use strict';

    const CONSENT_KEY = 'flux_cookie_consent';
    const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // REPLACE WITH ACTUAL GA4 ID

    /**
     * Cookie Consent Manager
     */
    const CookieConsent = {
        /**
         * Initialize consent manager
         */
        init() {
            // Check if consent already given
            const consent = this.getConsent();

            if (consent === null) {
                // No consent yet - show banner
                this.showBanner();
            } else if (consent === 'accepted') {
                // Consent accepted - load analytics
                this.loadAnalytics();
            }
            // If declined, do nothing (no banner, no analytics)
        },

        /**
         * Get stored consent value
         * @returns {string|null} 'accepted', 'declined', or null
         */
        getConsent() {
            return localStorage.getItem(CONSENT_KEY);
        },

        /**
         * Store consent choice
         * @param {string} choice - 'accepted' or 'declined'
         */
        setConsent(choice) {
            localStorage.setItem(CONSENT_KEY, choice);
        },

        /**
         * Show cookie consent banner
         */
        showBanner() {
            // Create banner HTML
            const banner = document.createElement('div');
            banner.id = 'cookie-banner';
            banner.setAttribute('role', 'dialog');
            banner.setAttribute('aria-live', 'polite');
            banner.setAttribute('aria-label', 'Cookie consent');

            banner.innerHTML = `
                <div class="cookie-banner__container">
                    <div class="cookie-banner__text">
                        <p>
                            This site uses cookies for analytics to improve performance. 
                            <a href="privacy.html" target="_blank" rel="noopener">Privacy Policy</a>
                        </p>
                    </div>
                    <div class="cookie-banner__actions">
                        <button class="cookie-banner__btn cookie-banner__btn--accept" id="cookie-accept">
                            Accept
                        </button>
                        <button class="cookie-banner__btn cookie-banner__btn--decline" id="cookie-decline">
                            Decline
                        </button>
                    </div>
                </div>
            `;

            // Append to body
            document.body.appendChild(banner);

            // Add event listeners
            document.getElementById('cookie-accept').addEventListener('click', () => {
                this.handleAccept();
            });

            document.getElementById('cookie-decline').addEventListener('click', () => {
                this.handleDecline();
            });

            // Small delay for animation
            setTimeout(() => {
                banner.classList.remove('hidden');
            }, 100);
        },

        /**
         * Hide banner with animation
         */
        hideBanner() {
            const banner = document.getElementById('cookie-banner');
            if (banner) {
                banner.classList.add('hidden');
                setTimeout(() => {
                    banner.remove();
                }, 300);
            }
        },

        /**
         * Handle accept button click
         */
        handleAccept() {
            this.setConsent('accepted');
            this.hideBanner();
            this.loadAnalytics();
        },

        /**
         * Handle decline button click
         */
        handleDecline() {
            this.setConsent('declined');
            this.hideBanner();
            // Do NOT load analytics
        },

        /**
         * Load Google Analytics 4
         * Only called after explicit consent
         */
        loadAnalytics() {
            // Prevent multiple loads
            if (window.ga || window.gtag) return;

            // Create script element for gtag.js
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;

            // Insert before first script tag
            const firstScript = document.getElementsByTagName('script')[0];
            firstScript.parentNode.insertBefore(script, firstScript);

            // Initialize gtag
            window.dataLayer = window.dataLayer || [];
            function gtag() {
                dataLayer.push(arguments);
            }
            window.gtag = gtag;

            gtag('js', new Date());
            gtag('config', GA_MEASUREMENT_ID, {
                'anonymize_ip': true,  // IP anonymization for privacy
                'cookie_flags': 'SameSite=None;Secure'
            });

            console.log('Google Analytics loaded (consent given)');
        }
    };

    /**
     * Initialize on DOM ready
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            CookieConsent.init();
        });
    } else {
        CookieConsent.init();
    }

    // Expose to window for manual testing if needed
    window.FluxCookieConsent = CookieConsent;

})();
