/**
 * ============================================
 * MOTION SYSTEM - PHASE 4
 * Cinematic scroll animations with GSAP + ScrollTrigger
 * ============================================
 */

// Register GSAP ScrollTrigger plugin
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

/**
 * Check if user prefers reduced motion
 * @returns {boolean}
 */
function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Initialize home page motion system
 * Main orchestrator for all scroll animations
 */
let isHomeMotionInitialized = false;

function initHomeMotion() {
    // Singleton guard
    if (isHomeMotionInitialized) return;
    isHomeMotionInitialized = true;

    // Safety checks
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('Flux: GSAP or ScrollTrigger not loaded.');
        return;
    }

    // Check reduced motion
    if (prefersReducedMotion()) {
        document.documentElement.classList.add('reduced-motion');
        return;
    }

    // Initialize all scene animations
    const scenes = document.querySelectorAll('[data-scene]');
    scenes.forEach(scene => {
        sceneReveal(scene);
        parallaxLayers(scene);
    });

    // Special hero enhancements
    heroProfessionalEnhancements();

    // Optimize video performance with IntersectionObserver
    initVideoObserver();
    
    // Add lifecycle handlers to hero video to prevent flickers
    handleVideoLifecycle();

    // Refresh ScrollTrigger when everything is stable
    if (document.readyState === 'complete') {
        stabilizeMotion();
    } else {
        window.addEventListener('load', stabilizeMotion, { once: true });
    }
}

function stabilizeMotion() {
    // Short delay to ensure layout is final
    setTimeout(() => {
        ScrollTrigger.refresh();
        console.log('Flux: Motion system stabilized.');
    }, 100);
}

/**
 * Handle video load and error states for smooth reveal
 */
function handleVideoLifecycle() {
    const video = document.querySelector('.hero__video');
    if (!video) return;

    // Fade in when ready
    video.addEventListener('canplaythrough', () => {
        video.classList.add('is-loaded');
        video.play().catch(() => {});
    });

    // Handle errors (like 404s) gracefully
    video.addEventListener('error', () => {
        console.warn('Flux: Hero video failed to load. Falling back to static poster.');
        video.style.display = 'none';
    });
}

/**
 * Pause video when not in viewport to save CPU/Battery
 */
function initVideoObserver() {
    const video = document.querySelector('.hero__video');
    if (!video || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                video.play().catch(() => {});
            } else {
                video.pause();
            }
        });
    }, { threshold: 0.1 });

    observer.observe(video);
}

/**
 * Animate scene entrance with staggered reveals
 * @param {HTMLElement} sceneEl - Scene container element
 */
function sceneReveal(sceneEl) {
    if (!sceneEl) return;

    const sceneName = sceneEl.getAttribute('data-scene');

    // Find all animatable children
    const headline = sceneEl.querySelector('[data-animate="headline"]');
    const copy = sceneEl.querySelector('[data-animate="copy"]');
    const cta = sceneEl.querySelector('[data-animate="cta"]');
    const cards = sceneEl.querySelectorAll('[data-animate="card"]');

    // Use matchMedia for responsive animation intensity
    const mm = gsap.matchMedia();

    mm.add({
        isDesktop: "(min-width: 1024px)",
        isTablet: "(min-width: 641px) and (max-width: 1023px)",
        isMobile: "(max-width: 640px)"
    }, (context) => {
        const { isDesktop, isTablet, isMobile } = context.conditions;

        // Adjust animation intensity based on screen size
        const intensity = isMobile ? 0.5 : isTablet ? 0.75 : 1;
        const yOffset = 24 * intensity;
        const duration = isDesktop ? 0.9 : 0.6;

        // Create timeline
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: sceneEl,
                start: "top 75%",
                end: "bottom 35%",
                toggleActions: "play none none none", // Play once
                // markers: true // Uncomment for debugging
            }
        });

        // Animate headline
        if (headline) {
            tl.fromTo(headline, 
                { y: yOffset, opacity: 0 },
                { 
                    y: 0, 
                    opacity: 1, 
                    duration: duration, 
                    ease: "power3.out",
                    onComplete: () => headline.classList.add('is-visible')
                },
                0
            );
        }

        // Animate copy
        if (copy) {
            tl.fromTo(copy,
                { y: yOffset * 0.75, opacity: 0 },
                { 
                    y: 0, 
                    opacity: 1, 
                    duration: duration * 0.8, 
                    ease: "power3.out",
                    onComplete: () => copy.classList.add('is-visible')
                },
                0.1
            );
        }

        // Animate CTA
        if (cta) {
            tl.fromTo(cta,
                { y: yOffset * 0.6, opacity: 0 },
                { 
                    y: 0, 
                    opacity: 1, 
                    duration: duration * 0.7, 
                    ease: "power3.out",
                    onComplete: () => cta.classList.add('is-visible')
                },
                0.2
            );
        }

        // Animate cards with stagger
        if (cards.length > 0) {
            tl.fromTo(cards,
                { y: yOffset * 0.85, opacity: 0, scale: 0.98 },
                { 
                    y: 0, 
                    opacity: 1, 
                    scale: 1, 
                    duration: duration * 0.8, 
                    stagger: 0.08, 
                    ease: "power3.out",
                    onComplete: () => {
                        cards.forEach(card => card.classList.add('is-visible'));
                    }
                },
                0.15
            );
        }

        return () => {
            // Cleanup if needed
        };
    });
}

/**
 * Add parallax movement to background layers
 * @param {HTMLElement} sceneEl - Scene container element
 */
function parallaxLayers(sceneEl) {
    if (!sceneEl) return;

    const bgLayer = sceneEl.querySelector('[data-parallax="bg"]');
    const overlayLayer = sceneEl.querySelector('[data-parallax="overlay"]');

    const mm = gsap.matchMedia();

    mm.add({
        isDesktop: "(min-width: 1024px)",
        isTablet: "(min-width: 641px) and (max-width: 1023px)",
        isMobile: "(max-width: 640px)"
    }, (context) => {
        const { isDesktop, isTablet, isMobile } = context.conditions;

        // No parallax on mobile for performance
        if (isMobile) return;

        // Reduced parallax on tablet
        const bgMove = isDesktop ? -8 : -4;
        const overlayMove = isDesktop ? -4 : -2;

        // Background parallax
        if (bgLayer) {
            gsap.to(bgLayer, {
                yPercent: bgMove,
                ease: "none",
                scrollTrigger: {
                    trigger: sceneEl,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 0.6
                }
            });
        }

        // Overlay parallax
        if (overlayLayer) {
            gsap.to(overlayLayer, {
                yPercent: overlayMove,
                ease: "none",
                scrollTrigger: {
                    trigger: sceneEl,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 0.6
                }
            });
        }
    });
}

/**
 * Hero section cinematic enhancements
 * Subtle animations that don't interfere with existing hero intro
 */
function heroProfessionalEnhancements() {
    const heroContent = document.querySelector('.hero__content');
    const heroOverlay = document.querySelector('.hero__overlay');

    if (!heroContent) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
        // Very subtle floating effect on hero content
        // Only on desktop to avoid performance issues
        gsap.to(heroContent, {
            y: -6,
            duration: 3,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1
        });

        // Subtle overlay breathing
        if (heroOverlay) {
            gsap.to(heroOverlay, {
                opacity: 0.92,
                duration: 4,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1
            });
        }
    });
}

/**
 * Templates card tilt effect (for templates.html)
 * 3D tilt on mouse move for premium feel
 */
function templatesCardTilt() {
    // Only on desktop with mouse
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        return;
    }

    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -6; // Max 6deg
            const rotateY = ((x - centerX) / centerX) * 6;

            gsap.to(card, {
                rotateX: rotateX,
                rotateY: rotateY,
                scale: 1.01,
                duration: 0.3,
                ease: "power2.out",
                transformPerspective: 1000
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                scale: 1,
                duration: 0.5,
                ease: "power2.out"
            });
        });
    });
}

/**
 * Legacy Phase 3 functions (kept for backward compatibility)
 */

/**
 * Initialize hero intro animation (Phase 3)
 * Now integrated into initHomeMotion but kept as standalone
 */
function initHeroIntro() {
    if (prefersReducedMotion()) return;

    if (typeof gsap === 'undefined') {
        console.warn('GSAP not loaded. Skipping hero intro animation.');
        return;
    }

    // Initial states handled by CSS to prevent FOUC ([data-animate])


    // Create timeline
    const tl = gsap.timeline({
        defaults: {
            ease: 'power3.out'
        }
    });

    // Animate in sequence
    tl.fromTo('.hero-title', 
        { opacity: 0, y: 30 },
        { 
            opacity: 1, 
            y: 0, 
            duration: 1, 
            delay: 0.3,
            onComplete: () => document.querySelector('.hero-title')?.classList.add('is-visible')
        }
    )
    .fromTo('.hero-subtitle',
        { opacity: 0, y: 20 },
        { 
            opacity: 1, 
            y: 0, 
            duration: 0.8,
            onComplete: () => document.querySelector('.hero-subtitle')?.classList.add('is-visible')
        },
        '-=0.5'
    )
    .fromTo('.hero-actions .btn',
        { opacity: 0, y: 20 },
        { 
            opacity: 1, 
            y: 0, 
            duration: 0.6, 
            stagger: 0.15,
            onComplete: () => document.querySelectorAll('.hero-actions .btn').forEach(b => b.classList.add('is-visible'))
        },
        '-=0.4'
    );
}

/**
 * Handle video playback based on reduced motion (Phase 3)
 */
function handleVideoPlayback() {
    const video = document.querySelector('.hero__video');
    const poster = document.querySelector('.hero__poster');

    if (!video) return;

    const isMobile = window.innerWidth <= 768;

    if (prefersReducedMotion() || isMobile) {
        video.pause();
        video.style.display = 'none';
        if (poster) {
            poster.style.opacity = '0.7';
        }
    } else {
        video.play().catch(err => {
            console.warn('Video playback failed:', err);
            video.style.display = 'none';
            if (poster) {
                poster.style.opacity = '0.7';
            }
        });
    }
}

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initHomeMotion,
        initHeroIntro,
        handleVideoPlayback,
        templatesCardTilt,
        prefersReducedMotion
    };
}

/**
 * ============================================
 * PHASE E: UNIVERSAL MOTION SYSTEM
 * Apply scroll animations to ALL pages
 * ============================================
 */

/**
 * Initialize motion system for all non-home pages
 * Detects page and applies appropriate animations
 */
let isUniversalMotionInitialized = false;

function initUniversalMotion() {
    // Singleton guard
    if (isUniversalMotionInitialized) return;
    isUniversalMotionInitialized = true;

    // Safety checks
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('GSAP or ScrollTrigger not loaded. Skipping universal motion.');
        return;
    }

    // Check reduced motion
    if (prefersReducedMotion()) {
        document.documentElement.classList.add('reduced-motion');
        gsap.set('[data-animate]', { opacity: 1, y: 0, scale: 1 });
        console.log('Reduced motion detected. Skipping universal animations.');
        return;
    }

    document.documentElement.classList.remove('reduced-motion');

    // Initialize page hero animations
    const pageHero = document.querySelector('.page-hero');
    if (pageHero) {
        animatePageHero(pageHero);
    }

    // Initialize all scene animations
    const scenes = document.querySelectorAll('[data-scene]');
    scenes.forEach(scene => {
        // Use existing sceneReveal function
        sceneReveal(scene);
        parallaxLayers(scene);
    });

    // Refresh ScrollTrigger when everything is stable
    if (document.readyState === 'complete') {
        stabilizeMotion();
    } else {
        window.addEventListener('load', stabilizeMotion, { once: true });
    }

    console.log('Universal Motion System Initialized');
}

/**
 * Animate page hero intro
 * @param {HTMLElement} heroEl - Page hero element
 */
function animatePageHero(heroEl) {
    if (!heroEl) return;

    const headline = heroEl.querySelector('[data-animate="headline"]');
    const copyElements = heroEl.querySelectorAll('[data-animate="copy"]');
    const cta = heroEl.querySelector('[data-animate="cta"]');

    const tl = gsap.timeline({
        defaults: {
            ease: 'power3.out'
        }
    });

    // Animate headline
    if (headline) {
        tl.fromTo(headline,
            { y: 30, opacity: 0 },
            { 
                y: 0, 
                opacity: 1, 
                duration: 1, 
                delay: 0.2,
                onComplete: () => headline.classList.add('is-visible')
            },
            0
        );
    }

    // Animate copy elements
    if (copyElements.length > 0) {
        tl.fromTo(copyElements,
            { y: 20, opacity: 0 },
            { 
                y: 0, 
                opacity: 1, 
                duration: 0.8, 
                stagger: 0.1,
                onComplete: () => copyElements.forEach(el => el.classList.add('is-visible'))
            },
            0.3
        );
    }

    // Animate CTA
    if (cta) {
        tl.fromTo(cta.children,
            { y: 15, opacity: 0 },
            { 
                y: 0, 
                opacity: 1, 
                duration: 0.6, 
                stagger: 0.1,
                onComplete: () => Array.from(cta.children).forEach(el => el.classList.add('is-visible'))
            },
            0.5
        );
    }
}

// Auto-initialize universal motion on non-home pages
document.addEventListener('DOMContentLoaded', () => {
    const pathname = window.location.pathname;
    const cleanPath = pathname.toLowerCase().replace('.html', '').replace(/\/$/, '') || '/';
    const isHomePage = cleanPath === '/' || cleanPath === '/index';

    // Don't run on home page (it has its own initHomeMotion)
    if (!isHomePage) {
        initUniversalMotion();
    }
});
