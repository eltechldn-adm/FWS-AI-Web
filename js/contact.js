
/**
 * Contact Form Handler
 * Handles submission, validation, and status feedback
 */

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const formStatus = document.getElementById('form-status');

    if (!contactForm) return;

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Reset state
        submitBtn.disabled = true;
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        formStatus.style.display = 'none';
        formStatus.className = 'form-status';

        // 2. Collect Data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());

        // 3. Front-end Honeypot Check (Anti-spam)
        if (data._honey) {
            console.warn('Spam detected via honeypot.');
            setTimeout(() => {
                formStatus.textContent = 'Thank you! Your enquiry has been sent successfully.';
                formStatus.style.backgroundColor = 'rgba(0, 255, 157, 0.1)';
                formStatus.style.color = '#00ff9d';
                formStatus.style.border = '1px solid rgba(0, 255, 157, 0.3)';
                formStatus.style.display = 'block';
                contactForm.reset();
                submitBtn.textContent = 'Sent!';
            }, 500);
            return;
        }

        try {
            // 4. Submit to API
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // 4. Success State
                formStatus.textContent = result.message || 'Thank you! Your enquiry has been sent successfully.';
                formStatus.style.backgroundColor = 'rgba(0, 255, 157, 0.1)';
                formStatus.style.color = '#00ff9d';
                formStatus.style.border = '1px solid rgba(0, 255, 157, 0.3)';
                formStatus.style.display = 'block';
                
                contactForm.reset();
                submitBtn.textContent = 'Sent!';
                
                // Keep success message visible, button reset after delay
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }, 3000);
            } else {
                // 5. Error State
                throw new Error(result.error || 'Failed to send enquiry.');
            }

        } catch (error) {
            console.error('Submission Error:', error);
            formStatus.textContent = error.message;
            formStatus.style.backgroundColor = 'rgba(255, 71, 71, 0.1)';
            formStatus.style.color = '#ff4747';
            formStatus.style.border = '1px solid rgba(255, 71, 71, 0.3)';
            formStatus.style.display = 'block';
            
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });

    // Handle button hover logic if not already in main.js/motion.js
    // This maintains visual consistency with the rest of the site animations
});
