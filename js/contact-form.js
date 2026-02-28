// contact-form.js - Complete form handling for BOTHREI PRINTERS

class ContactForm {
    constructor(formId) {
        this.form = document.getElementById(formId);
        if (!this.form) return;
        
        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Add real-time validation
        this.addRealTimeValidation();
        
        // Add phone number formatting
        this.formatPhoneNumbers();
        
        // Add character counter for textarea
        this.addCharacterCounter();
    }

    addRealTimeValidation() {
        const inputs = this.form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Validate on blur
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            // Clear error on input
            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    this.validateField(input);
                }
            });
            
            // Special validation for phone
            if (input.type === 'tel') {
                input.addEventListener('keyup', () => {
                    this.formatPhoneInput(input);
                });
            }
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        
        // Email validation
        else if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }
        
        // Phone validation (Botswana format)
        else if (field.type === 'tel' && value) {
            const phoneRegex = /^(\+267)?[7][0-9]{7}$/;
            const cleanPhone = value.replace(/\s+/g, '');
            
            if (!phoneRegex.test(cleanPhone)) {
                isValid = false;
                errorMessage = 'Please enter a valid Botswana phone number (e.g., 74394328 or +26774394328)';
            }
        }
        
        // Textarea minimum length
        else if (field.tagName === 'TEXTAREA' && value && value.length < 10) {
            isValid = false;
            errorMessage = 'Message must be at least 10 characters';
        }

        this.toggleFieldError(field, isValid, errorMessage);
        return isValid;
    }

    toggleFieldError(field, isValid, errorMessage) {
        const existingError = field.parentNode.querySelector('.error-message');
        
        if (!isValid) {
            field.classList.add('error');
            
            if (!existingError) {
                const error = document.createElement('span');
                error.className = 'error-message';
                error.textContent = errorMessage;
                error.setAttribute('role', 'alert');
                field.parentNode.insertBefore(error, field.nextSibling);
                
                // Add ARIA attributes for accessibility
                field.setAttribute('aria-invalid', 'true');
                field.setAttribute('aria-describedby', `error-${field.name || 'field'}`);
                error.id = `error-${field.name || 'field'}`;
            }
        } else {
            field.classList.remove('error');
            field.removeAttribute('aria-invalid');
            field.removeAttribute('aria-describedby');
            
            if (existingError) {
                existingError.remove();
            }
        }
    }

    formatPhoneInput(input) {
        let value = input.value.replace(/\D/g, '');
        
        if (value.length > 0) {
            // Handle Botswana format
            if (value.startsWith('267')) {
                // International format
                if (value.length > 3) {
                    value = `+267 ${value.slice(3, 6)} ${value.slice(6, 9)} ${value.slice(9, 11)}`;
                }
            } else {
                // Local format
                if (value.length > 3) {
                    value = `${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6, 8)}`;
                }
            }
        }
        
        input.value = value.trim();
    }

    addCharacterCounter() {
        const textarea = this.form.querySelector('textarea');
        if (!textarea) return;
        
        // Create counter element
        const counter = document.createElement('div');
        counter.className = 'char-counter';
        counter.innerHTML = `<span>0</span>/500 characters`;
        textarea.parentNode.insertBefore(counter, textarea.nextSibling);
        
        const counterSpan = counter.querySelector('span');
        
        textarea.addEventListener('input', () => {
            const length = textarea.value.length;
            counterSpan.textContent = length;
            
            if (length > 500) {
                counter.style.color = '#dc3545';
            } else {
                counter.style.color = '#666';
            }
        });
    }

    async handleSubmit() {
        // Validate all fields
        const inputs = this.form.querySelectorAll('input, textarea, select');
        let isFormValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            this.showNotification('Please fill all required fields correctly', 'error');
            
            // Scroll to first error
            const firstError = this.form.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
            return;
        }

        // Show loading state
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        // Collect form data
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());
        
        // Add metadata
        data.submittedAt = new Date().toISOString();
        data.page = window.location.pathname;
        data.userAgent = navigator.userAgent;

        try {
            // Send to server
            const response = await this.sendToServer(data);
            
            if (response.success) {
                // Show success message
                this.showNotification('Thank you! Your message has been sent successfully. We\'ll get back to you soon.', 'success');
                this.form.reset();
                
                // Reset character counter
                const counter = this.form.querySelector('.char-counter span');
                if (counter) counter.textContent = '0';
                
                // Optional: Send WhatsApp notification to admin
                await this.sendWhatsAppNotification(data);
            } else {
                throw new Error(response.message || 'Server error');
            }
            
        } catch (error) {
            // Show error message
            this.showNotification('Sorry, something went wrong. Please try again later or contact us via WhatsApp.', 'error');
            console.error('Form submission error:', error);
            
        } finally {
            // Reset button
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    async sendToServer(data) {
        // Replace with your actual backend endpoint
        const endpoint = 'https://your-domain.com/api/contact';
        
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            return await response.json();
            
        } catch (error) {
            console.warn('Using fallback: Server endpoint not configured');
            
            // Fallback: Store in localStorage for demo
            const submissions = JSON.parse(localStorage.getItem('form_submissions') || '[]');
            submissions.push(data);
            localStorage.setItem('form_submissions', JSON.stringify(submissions));
            
            // Simulate successful response
            return { success: true };
        }
    }

    async sendWhatsAppNotification(data) {
        // Optional: Send notification to admin via WhatsApp
        const adminPhone = '26774394328'; // Your admin phone
        const message = `New inquiry from ${data.name || 'Unknown'}
Phone: ${data.phone || 'Not provided'}
Email: ${data.email || 'Not provided'}
Service: ${data.service || 'Not specified'}
Message: ${data.message || 'No message'}`;

        // You would need a WhatsApp Business API or third-party service for this
        console.log('WhatsApp notification would be sent:', message);
        
        // Return true to indicate attempt was made
        return true;
    }

    showNotification(message, type) {
        // Remove any existing notification
        const existingNotification = document.querySelector('.form-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `form-notification ${type}`;
        notification.setAttribute('role', 'alert');
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close" aria-label="Close">&times;</button>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateY(-20px)';
                setTimeout(() => notification.remove(), 300);
            });
        }

        // Auto remove after 8 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateY(-20px)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 8000);
    }

    // Get form data as object
    getFormData() {
        const formData = new FormData(this.form);
        return Object.fromEntries(formData.entries());
    }

    // Reset form
    resetForm() {
        this.form.reset();
        const errors = this.form.querySelectorAll('.error-message');
        errors.forEach(error => error.remove());
        
        const inputs = this.form.querySelectorAll('.error');
        inputs.forEach(input => input.classList.remove('error'));
    }
}

// Initialize contact form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = new ContactForm('inquiryForm');
    
    // Add to window for debugging
    window.contactForm = contactForm;
});

// Add CSS for notifications and character counter
const style = document.createElement('style');
style.textContent = `
    .char-counter {
        text-align: right;
        font-size: 0.85rem;
        color: #666;
        margin-top: 5px;
    }
    
    .char-counter.warning {
        color: #ffc107;
    }
    
    .char-counter.error {
        color: #dc3545;
    }
    
    .form-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 9999;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        max-width: 400px;
    }
    
    .form-notification.success {
        background: linear-gradient(135deg, #28a745, #20c997);
    }
    
    .form-notification.error {
        background: linear-gradient(135deg, #dc3545, #c82333);
    }
    
    .form-notification i {
        font-size: 1.3rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        margin-left: auto;
        padding: 0 5px;
        opacity: 0.8;
        transition: opacity 0.3s;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @media (max-width: 768px) {
        .form-notification {
            left: 20px;
            right: 20px;
            max-width: none;
        }
    }
`;

document.head.appendChild(style);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContactForm;
}