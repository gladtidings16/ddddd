/* ============================================
   MOBILE NAVIGATION TOGGLE
   ============================================ */

const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.mobile-nav');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', 
            hamburger.getAttribute('aria-expanded') === 'false' ? 'true' : 'false'
        );
        mobileNav.classList.toggle('active');
    });
}

// Close mobile nav when a link is clicked
const mobileNavLinks = document.querySelectorAll('.mobile-nav a');
mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileNav.classList.remove('active');
    });
});

/* ============================================
   FADE-IN ON SCROLL (IntersectionObserver)
   ============================================ */

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all fade-in elements
document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

/* ============================================
   STATS COUNTER
   ============================================ */

const counterElements = document.querySelectorAll('.counter');
let countersStarted = false;

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000; // 2 seconds
    const startTime = Date.now();
    const startValue = 0;

    function updateCounter() {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentValue = Math.floor(startValue + (target - startValue) * progress);
        element.textContent = currentValue;

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    }

    updateCounter();
}

// Start counter animation when stats section comes into view
const statsRow = document.querySelector('.stats-row');
if (statsRow) {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !countersStarted) {
                countersStarted = true;
                counterElements.forEach(counter => {
                    animateCounter(counter);
                });
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statsObserver.observe(statsRow);
}

/* ============================================
   TESTIMONIAL CAROUSEL
   ============================================ */

let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-data .slide');
const testimonialQuote = document.querySelector('.testimonial-quote');
const testimonialAuthor = document.querySelector('.testimonial-author');
const indicators = document.querySelectorAll('.indicator');

function showSlide(index) {
    if (slides.length === 0) return;
    
    // Wrap around
    if (index >= slides.length) {
        currentSlide = 0;
    } else if (index < 0) {
        currentSlide = slides.length - 1;
    } else {
        currentSlide = index;
    }

    // Update testimonial content
    const slide = slides[currentSlide];
    const quote = slide.querySelector('blockquote').textContent;
    const author = slide.querySelector('.author').textContent;

    testimonialQuote.textContent = quote;
    testimonialAuthor.textContent = author;

    // Update indicators
    indicators.forEach((indicator, idx) => {
        indicator.classList.toggle('active', idx === currentSlide);
    });
}

// Navigation buttons
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');

if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        showSlide(currentSlide - 1);
    });
}

if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        showSlide(currentSlide + 1);
    });
}

// Indicator clicks
indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
        showSlide(index);
    });
});

// Initialize with first slide
showSlide(0);

/* ============================================
   CONTACT FORM VALIDATION & SUBMISSION
   ============================================ */

const contactForm = document.getElementById('contactForm');

if (contactForm) {
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validate individual field
    function validateField(field) {
        const value = field.value.trim();
        const errorSpan = document.querySelector(`.error-message[data-field="${field.name}"]`);
        let isValid = true;
        let errorMessage = '';

        if (field.name === 'name') {
            if (value === '') {
                isValid = false;
                errorMessage = 'Name is required';
            }
        } else if (field.name === 'email') {
            if (value === '') {
                isValid = false;
                errorMessage = 'Email is required';
            } else if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        } else if (field.name === 'message') {
            if (value === '') {
                isValid = false;
                errorMessage = 'Message is required';
            }
        }

        // Update UI
        if (isValid) {
            field.classList.remove('error');
            errorSpan.textContent = '';
            errorSpan.classList.remove('show');
        } else {
            field.classList.add('error');
            errorSpan.textContent = errorMessage;
            errorSpan.classList.add('show');
        }

        return isValid;
    }

    // Real-time validation
    const inputs = contactForm.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            validateField(input);
        });

        // Clear error on input
        input.addEventListener('input', () => {
            if (input.classList.contains('error')) {
                input.classList.remove('error');
                const errorSpan = document.querySelector(`.error-message[data-field="${input.name}"]`);
                errorSpan.textContent = '';
                errorSpan.classList.remove('show');
            }
        });
    });

   // Form submission
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate all fields
    let allValid = true;
    inputs.forEach(input => {
        if (!validateField(input)) {
            allValid = false;
        }
    });

    if (allValid) {
        // Send data to Formspree via fetch
        const formData = new FormData(contactForm);
        fetch(contactForm.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                // Show success message
                const successDiv = contactForm.querySelector('.form-success');
                successDiv.style.display = 'block';

                // Reset form
                contactForm.reset();

                // Clear success message after 5 seconds
                setTimeout(() => {
                    successDiv.style.display = 'none';
                }, 5000);
            } else {
                alert('Oops! There was a problem submitting your form.');
            }
        }).catch(error => {
            alert('Oops! There was a network error.');
        });
    }
});

}

document.addEventListener('DOMContentLoaded', updateSchoolContact);

/* ============================================
   ACCESSIBILITY: SKIP LINK
   ============================================ */

// Create skip to main content link (optional, but good practice)
const skipLink = document.createElement('a');
skipLink.href = '#hero';
skipLink.className = 'skip-link';
skipLink.textContent = 'Skip to main content';
skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 0;
    background: #1B2A41;
    color: #FAF7F0;
    padding: 8px;
    z-index: 100;
`;

skipLink.addEventListener('focus', () => {
    skipLink.style.top = '0';
});

skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
});

document.body.insertBefore(skipLink, document.body.firstChild);

/* ============================================
   PREFERS REDUCED MOTION
   ============================================ */

// Check user's motion preference and apply accordingly
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
    // Disable animations for users who prefer reduced motion
    document.documentElement.style.setProperty('--transition-smooth', '0.01ms ease');
    document.documentElement.style.setProperty('--transition-slow', '0.01ms ease');
}

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */

// Log page load time (for performance monitoring)
window.addEventListener('load', () => {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    console.log('Page Load Time: ' + pageLoadTime + 'ms');
});
