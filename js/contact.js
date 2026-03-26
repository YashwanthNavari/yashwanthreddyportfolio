document.addEventListener('DOMContentLoaded', () => {
    // Look for the contact form by ID first, or fallback to the first form on the page
    const contactForm = document.getElementById('contact-form') || document.querySelector('form');

    // Create a status message element if it doesn't separate exist
    let statusMessage = document.getElementById('statusMessage');
    if (!statusMessage && contactForm) {
        statusMessage = document.createElement('div');
        statusMessage.id = 'statusMessage';
        statusMessage.className = 'mt-4 hidden p-4 rounded-xl text-center font-medium';
        contactForm.parentElement.appendChild(statusMessage);
    }

    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmission);
    }

    async function handleContactSubmission(event) {
        event.preventDefault();

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.innerText : 'Send Message';

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerText = 'Sending...';
        }

        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                showStatus('Message sent successfully! We will get back to you soon.', 'success');
                contactForm.reset();
            } else {
                throw new Error(result.message || 'Failed to send message');
            }
        } catch (error) {
            console.error('Contact Form Error:', error);
            showStatus('Failed to send message. Please try again later.', 'error');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = originalBtnText;
            }
        }
    }

    function showStatus(message, type) {
        if (!statusMessage) return;

        statusMessage.textContent = message;
        statusMessage.className = 'mt-4 p-4 rounded-xl text-center font-medium transition-all duration-300';

        if (type === 'success') {
            statusMessage.classList.add('bg-green-100', 'text-green-700', 'dark:bg-green-900/30', 'dark:text-green-400');
        } else {
            statusMessage.classList.add('bg-red-100', 'text-red-700', 'dark:bg-red-900/30', 'dark:text-red-400');
        }

        statusMessage.classList.remove('hidden');

        // Auto hide after 5 seconds
        setTimeout(() => {
            statusMessage.classList.add('hidden');
        }, 5000);
    }
});
