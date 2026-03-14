# Flux Web Studio (Phase 1)

This is the static site rebuild for Flux Web Studio, designed to be hosted on GitHub Pages.

## Project Structure

```
/
├─ index.html           # Home Page
├─ templates.html       # Template Listing (with filtering)
├─ template.html        # Template Detail (dynamic via URL params)
├─ services.html        # Services & Packages
├─ contact.html         # Contact Form (Formspree)
├─ privacy.html         # Privacy Policy
├─ terms.html           # Terms of Service
├─ CNAME                # Custom Domain config
│
├─ assets/              # Images, icons, fonts
│
├─ css/
│   ├─ base.css         # Variables, reset, typography
│   ├─ layout.css       # Header, Footer, Grid
│   ├─ components.css   # Buttons, Cards
│   ├─ pages.css        # Page-specific styles
│   └─ motion.css       # Placeholder for Phase 3/4
│
└─ js/
    ├─ main.js          # Core logic (Nav, Filtering, Details)
    ├─ utils.js         # Helpers
    └─ motion.js        # Placeholder
```

## How to Deploy on GitHub Pages

1.  **Push to GitHub**:
    Ensure all files are committed and pushed to your GitHub repository (e.g., `main` branch).

2.  **Enable GitHub Pages**:
    - Go to your Repository Settings > Pages.
    - Under "Source", select `Deploy from a branch`.
    - Select `main` branch and `/ (root)` folder.
    - Click **Save**.

3.  **Custom Domain (Optional)**:
    - If you have a custom domain (e.g., `fluxwebstudio.com`), ensure the `CNAME` file in the root contains your domain name.
    - In GitHub Pages settings, enter your custom domain in the "Custom domain" field.
    - Configure your DNS provider (GoDaddy, Namecheap, etc.) to point to GitHub Pages.

## Updating Content

-   **Templates**: Update the `templates` array in `js/main.js` to add or modify templates.
-   **Images**: Place images in `assets/images` and reference them in your HTML or JS.
-   **Contact Form**: Update the `action` URL in `contact.html` with your specific Formspree ID.

## Video Assets

> **⚠️ TODO:** Replace `assets/video/hero-universe.webm` and `assets/video/hero-universe.mp4` with non-watermarked or licensed versions before production deployment.

The current hero video may contain watermarking. For final deployment:
1. Replace with licensed/non-watermarked version, OR
2. Use alternative video content, OR  
3. Switch to static hero image only

## Next Steps (Completed Phases)

-   **✅ Phase 1**: Static Site Foundation
-   **✅ Phase 2**: Visual Polish (Advanced CSS, hover effects)
-   **✅ Phase 3**: Hero Video Integration
-   **✅ Phase 4**: Motion System (GSAP + ScrollTrigger)
-   **✅ Phase 5**: Conversion Optimization & Copy Rewrite
-   **✅ Phase 6**: SEO, Analytics & Compliance
-   **✅ Phase 7**: Final QA & Launch Readiness
-   **✅ Master Upgrade**: Hero Fixes + Motion Enhancement
