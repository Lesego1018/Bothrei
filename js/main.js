// main.js - Main JavaScript functionality for BOTHREI PRINTERS

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initPreloader();
    initScrollToTop();
    initAnimations();
    initCounters();
    initServiceFilter();
    initWhatsAppFeatures();
    initGallery(); // If you add gallery later
    initTestimonials(); // If you add testimonials later
    initLazyLoading();
});

// Preloader
function initPreloader() {
    const preloader = document.querySelector('.preloader');
    
    if (preloader) {
        // Wait for everything to load
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.style.opacity = '0';
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 500);
            }, 500); // Minimum display time for preloader
        });
    }
}

// Scroll to Top Button
function initScrollToTop() {
    // Create scroll to top button if it doesn't exist
    let scrollBtn = document.querySelector('.scroll-top');
    
    if (!scrollBtn) {
        scrollBtn = document.createElement('div');
        scrollBtn.className = 'scroll-top';
        scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        document.body.appendChild(scrollBtn);
    }

    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollBtn.classList.add('show');
        } else {
            scrollBtn.classList.remove('show');
        }
    });

    // Scroll to top on click
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Animation on Scroll
function initAnimations() {
    const animatedElements = document.querySelectorAll(
        '.service-card, .pricing-card, .feature, .section-header, ' +
        '.contact-info, .contact-form, .about-content, .hero-content'
    );
    
    if (!animatedElements.length) return;
    
    // Set initial styles
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'all 0.6s ease';
    });
    
    // Check if element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        
        return (
            rect.top <= windowHeight - 100 &&
            rect.bottom >= 0
        );
    }
    
    // Animate elements in viewport
    function animateOnScroll() {
        animatedElements.forEach(element => {
            if (isInViewport(element) && element.style.opacity !== '1') {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    }
    
    // Debounce scroll event
    let timeout;
    window.addEventListener('scroll', () => {
        clearTimeout(timeout);
        timeout = setTimeout(animateOnScroll, 100);
    });
    
    // Trigger once on load
    animateOnScroll();
}

// Counter Animation for Stats
function initCounters() {
    const counters = document.querySelectorAll('.counter');
    
    if (!counters.length) return;
    
    const speed = 200;
    let animated = false;
    
    function startCounting() {
        if (animated) return;
        animated = true;
        
        counters.forEach(counter => {
            const updateCount = () => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText;
                const increment = target / speed;
                
                if (count < target) {
                    counter.innerText = Math.ceil(count + increment);
                    setTimeout(updateCount, 10);
                } else {
                    counter.innerText = target;
                }
            };
            
            updateCount();
        });
    }
    
    // Check if counters are in viewport
    function checkCounters() {
        const counterSection = document.querySelector('.stats-section');
        if (counterSection && isInViewport(counterSection)) {
            startCounting();
        }
    }
    
    // Helper function to check viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= window.innerHeight - 100 &&
            rect.bottom >= 0
        );
    }
    
    window.addEventListener('scroll', checkCounters);
    checkCounters(); // Check on load
}

// Service Filter (if you want to add category filtering)
function initServiceFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const serviceCards = document.querySelectorAll('.service-card');
    
    if (!filterButtons.length || !serviceCards.length) return;
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            const filterValue = button.getAttribute('data-filter');
            
            serviceCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                
                if (filterValue === 'all' || cardCategory === filterValue) {
                    // Show card with animation
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    // Hide card with animation
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// WhatsApp Features
function initWhatsAppFeatures() {
    const whatsappMain = document.querySelector('.whatsapp-main');
    const whatsappOptions = document.querySelectorAll('.whatsapp-option, .whatsapp-btn');
    
    // Track WhatsApp clicks
    if (whatsappOptions.length) {
        whatsappOptions.forEach(option => {
            option.addEventListener('click', function(e) {
                const phoneNumber = this.getAttribute('href')?.match(/\d+/g)?.join('');
                
                // Send analytics event (if you have analytics)
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'whatsapp_click', {
                        'phone_number': phoneNumber,
                        'page_location': window.location.href
                    });
                }
                
                // Store in localStorage for tracking
                const whatsappClicks = JSON.parse(localStorage.getItem('whatsapp_clicks') || '[]');
                whatsappClicks.push({
                    phone: phoneNumber,
                    timestamp: new Date().toISOString(),
                    page: window.location.pathname
                });
                localStorage.setItem('whatsapp_clicks', JSON.stringify(whatsappClicks.slice(-10)));
            });
        });
    }
    
    // Auto-populate WhatsApp message based on page section
    if (whatsappMain) {
        whatsappMain.addEventListener('click', function(e) {
            const currentSection = getCurrentSection();
            let message = "Hello BOTHREI PRINTERS, ";
            
            switch(currentSection) {
                case 'services':
                    message += "I'm interested in your printing services.";
                    break;
                case 'pricing':
                    message += "I'd like to know more about your pricing.";
                    break;
                case 'contact':
                    message += "I need assistance with your services.";
                    break;
                default:
                    message += "I need your services.";
            }
            
            // Update href with message
            const baseUrl = this.getAttribute('href').split('?')[0];
            this.setAttribute('href', `${baseUrl}?text=${encodeURIComponent(message)}`);
        });
    }
}

// Get current section based on scroll position
function getCurrentSection() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;
    
    for (let section of sections) {
        const sectionTop = section.offsetTop - 100;
        const sectionBottom = sectionTop + section.offsetHeight;
        
        if (scrollY >= sectionTop && scrollY < sectionBottom) {
            return section.getAttribute('id');
        }
    }
    
    return 'home';
}

// Gallery Lightbox (if you add gallery)
function initGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    if (!galleryItems.length) return;
    
    // Create lightbox container
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <img src="" alt="">
            <button class="lightbox-close">&times;</button>
            <button class="lightbox-prev">&lsaquo;</button>
            <button class="lightbox-next">&rsaquo;</button>
        </div>
    `;
    document.body.appendChild(lightbox);
    
    let currentIndex = 0;
    
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            currentIndex = index;
            const imgSrc = item.querySelector('img')?.src;
            if (imgSrc) {
                showLightbox(imgSrc);
            }
        });
    });
    
    function showLightbox(src) {
        const img = lightbox.querySelector('img');
        img.src = src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function hideLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    lightbox.querySelector('.lightbox-close').addEventListener('click', hideLightbox);
    
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            hideLightbox();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (lightbox.classList.contains('active')) {
            if (e.key === 'Escape') {
                hideLightbox();
            } else if (e.key === 'ArrowLeft') {
                currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
                const newSrc = galleryItems[currentIndex].querySelector('img')?.src;
                if (newSrc) lightbox.querySelector('img').src = newSrc;
            } else if (e.key === 'ArrowRight') {
                currentIndex = (currentIndex + 1) % galleryItems.length;
                const newSrc = galleryItems[currentIndex].querySelector('img')?.src;
                if (newSrc) lightbox.querySelector('img').src = newSrc;
            }
        }
    });
}

// Testimonials Slider (if you add testimonials)
function initTestimonials() {
    const testimonialSlider = document.querySelector('.testimonials-slider');
    
    if (!testimonialSlider) return;
    
    let currentSlide = 0;
    const slides = testimonialSlider.querySelectorAll('.testimonial-card');
    const prevBtn = testimonialSlider.querySelector('.slider-prev');
    const nextBtn = testimonialSlider.querySelector('.slider-next');
    
    function showSlide(index) {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        
        slides.forEach((slide, i) => {
            slide.style.transform = `translateX(${100 * (i - index)}%)`;
        });
        
        currentSlide = index;
    }
    
    if (slides.length && prevBtn && nextBtn) {
        showSlide(0);
        
        prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
        nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));
        
        // Auto slide
        setInterval(() => {
            showSlide(currentSlide + 1);
        }, 5000);
    }
}

// Lazy Loading Images
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if (!images.length) return;
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Form validation helper (used by contact-form.js)
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    // Botswana phone numbers: 7XXXXXXXX or +2677XXXXXXXX
    const re = /^(\+267)?[7][0-9]{7}$/;
    return re.test(phone.replace(/\s/g, ''));
}

// Utility function to format Botswana phone numbers
function formatBotswanaPhone(phone) {
    let cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 8) {
        return `+267 ${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('267')) {
        return `+267 ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    
    return phone;
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateEmail,
        validatePhone,
        formatBotswanaPhone,
        initPreloader,
        initScrollToTop,
        initAnimations,
        initWhatsAppFeatures
    };
}

// Add to window for global access
window.bothreiPrinters = {
    validateEmail,
    validatePhone,
    formatBotswanaPhone,
    initAnimations,
    initScrollToTop
};