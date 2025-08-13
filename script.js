// Premium Portfolio JavaScript
class PremiumPortfolio {
    constructor() {
        this.currentTheme = 'dark';
        this.isLoading = true;
        this.particles = [];
        this.cursor = { x: 0, y: 0 };
        this.currentTestimonial = 0;
        this.testimonialInterval = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startLoadingSequence();
        this.initCustomCursor();
        this.initParticleSystem();
        this.initScrollAnimations();
        this.initFloatingNav();
        this.initScrollProgress();
        this.initThemeToggle();
        this.initMagneticButtons();
        this.initSkillsFilter();
        this.initProjectsFilter();
        this.initTestimonials();
        this.initContactForm();
        this.initTypewriterEffect();
        this.checkReducedMotion();
    }

    setupEventListeners() {
        window.addEventListener('load', () => this.handlePageLoad());
        window.addEventListener('scroll', () => this.handleScroll());
        window.addEventListener('mousemove', (e) => this.updateCursor(e));
        window.addEventListener('resize', () => this.handleResize());
        
        // Prevent right-click on cursor for better UX
        document.addEventListener('contextmenu', (e) => {
            if (e.target.classList.contains('custom-cursor') || 
                e.target.classList.contains('cursor-inner')) {
                e.preventDefault();
            }
        });
    }

    checkReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (prefersReducedMotion.matches) {
            // Disable complex animations for accessibility
            document.documentElement.style.setProperty('--animation-speed-fast', '0.01s');
            document.documentElement.style.setProperty('--animation-speed-normal', '0.01s');
            document.documentElement.style.setProperty('--animation-speed-slow', '0.01s');
            
            // Stop particle system
            this.particles = [];
            const canvas = document.getElementById('particles');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    }

    // Loading Screen
    startLoadingSequence() {
        const loadingScreen = document.getElementById('loading-screen');
        const progressBar = document.querySelector('.progress-bar');
        
        // Simulate loading progress
        let progress = 0;
        const loadingInterval = setInterval(() => {
            progress += Math.random() * 3;
            if (progress > 100) progress = 100;
            
            progressBar.style.width = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(loadingInterval);
                setTimeout(() => {
                    this.hideLoadingScreen();
                }, 500);
            }
        }, 50);
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('hidden');
        this.isLoading = false;
        
        // Start main animations
        setTimeout(() => {
            this.animateHeroContent();
            this.startCounterAnimations();
        }, 800);
    }

    handlePageLoad() {
        // Force hide loading screen if it takes too long
        setTimeout(() => {
            if (this.isLoading) {
                this.hideLoadingScreen();
            }
        }, 5000);
    }

    // Custom Cursor
    initCustomCursor() {
        const cursor = document.querySelector('.custom-cursor');
        const cursorInner = document.querySelector('.cursor-inner');
        
        // Hide cursor on touch devices
        if ('ontouchstart' in window) {
            cursor.style.display = 'none';
            document.body.style.cursor = 'auto';
            return;
        }

        // Update cursor position
        document.addEventListener('mousemove', (e) => {
            this.cursor.x = e.clientX;
            this.cursor.y = e.clientY;
            
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;
        });

        // Cursor interactions
        const interactiveElements = document.querySelectorAll('a, button, .magnetic-btn, .project-card, .skill-bubble');
        
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorInner.classList.add('hover');
            });
            
            el.addEventListener('mouseleave', () => {
                cursorInner.classList.remove('hover');
            });
            
            el.addEventListener('mousedown', () => {
                cursorInner.classList.add('click');
            });
            
            el.addEventListener('mouseup', () => {
                cursorInner.classList.remove('click');
            });
        });
    }

    updateCursor(e) {
        this.cursor.x = e.clientX;
        this.cursor.y = e.clientY;
    }

    // Particle System
    initParticleSystem() {
        const canvas = document.getElementById('particles');
        const ctx = canvas.getContext('2d');
        
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Create particles
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2,
                hue: Math.random() * 60 + 180 // Blue-cyan range
            });
        }

        const animate = () => {
            if (this.particles.length === 0) return; // Skip if reduced motion
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            this.particles.forEach((particle, index) => {
                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Mouse interaction
                const dx = this.cursor.x - particle.x;
                const dy = this.cursor.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    const force = (100 - distance) / 100;
                    particle.x -= dx * force * 0.01;
                    particle.y -= dy * force * 0.01;
                }
                
                // Boundary check
                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
                
                // Keep particles in bounds
                particle.x = Math.max(0, Math.min(canvas.width, particle.x));
                particle.y = Math.max(0, Math.min(canvas.height, particle.y));
                
                // Draw particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${particle.hue}, 70%, 60%, ${particle.opacity})`;
                ctx.fill();
                
                // Draw connections
                this.particles.slice(index + 1).forEach(otherParticle => {
                    const dx = particle.x - otherParticle.x;
                    const dy = particle.y - otherParticle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 80) {
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(otherParticle.x, otherParticle.y);
                        ctx.strokeStyle = `hsla(${particle.hue}, 70%, 60%, ${0.1 * (1 - distance / 80)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                });
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    // Theme Toggle - FIXED
    initThemeToggle() {
        const themeToggle = document.querySelector('.theme-toggle');
        const html = document.documentElement;
        
        // Set initial theme
        html.setAttribute('data-theme', this.currentTheme);
        
        themeToggle.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleTheme();
        });
    }

    toggleTheme() {
        const html = document.documentElement;
        const body = document.body;
        
        // Toggle theme state
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        
        console.log('Switching to theme:', this.currentTheme); // Debug log
        
        // Add transition class for smooth theme change
        body.classList.add('theme-transitioning');
        
        // Apply new theme to html element (this is key!)
        html.setAttribute('data-theme', this.currentTheme);
        
        // Update CSS custom properties for immediate effect
        if (this.currentTheme === 'light') {
            html.style.setProperty('--theme-bg-primary', '#F7F7F7');
            html.style.setProperty('--theme-bg-secondary', '#EAEAEA');
            html.style.setProperty('--theme-bg-tertiary', '#FAFAFA');
            html.style.setProperty('--theme-accent-primary', '#0077FF');
            html.style.setProperty('--theme-accent-secondary', '#9B51E0');
            html.style.setProperty('--theme-accent-tertiary', '#00C9A7');
            html.style.setProperty('--color-text', '#1F2121');
            html.style.setProperty('--color-text-secondary', '#626C71');
        } else {
            html.style.setProperty('--theme-bg-primary', '#0A0A0A');
            html.style.setProperty('--theme-bg-secondary', '#101820');
            html.style.setProperty('--theme-bg-tertiary', '#16213E');
            html.style.setProperty('--theme-accent-primary', '#08D9D6');
            html.style.setProperty('--theme-accent-secondary', '#A855F7');
            html.style.setProperty('--theme-accent-tertiary', '#00FF9D');
            html.style.setProperty('--color-text', '#F5F5F5');
            html.style.setProperty('--color-text-secondary', 'rgba(167, 169, 169, 0.7)');
        }
        
        // Update body background immediately
        body.style.background = this.currentTheme === 'light' ? '#F7F7F7' : '#0A0A0A';
        
        // Clean up transition class
        setTimeout(() => {
            body.classList.remove('theme-transitioning');
        }, 1000);
    }

    // Scroll Animations
    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (entry.target.classList.contains('reveal-text')) {
                        entry.target.classList.add('visible');
                    }
                    
                    if (entry.target.classList.contains('stat-item')) {
                        this.animateCounter(entry.target);
                    }
                    
                    if (entry.target.classList.contains('skill-progress')) {
                        this.animateSkillProgress(entry.target);
                    }
                }
            });
        }, observerOptions);
        
        // Observe elements
        document.querySelectorAll('.reveal-text, .stat-item, .skill-progress').forEach(el => {
            observer.observe(el);
        });
    }

    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const numberElement = element.querySelector('.stat-number');
        let current = 0;
        const increment = target / 100;
        const duration = 2000;
        const stepTime = duration / 100;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            numberElement.textContent = Math.floor(current);
        }, stepTime);
    }

    animateSkillProgress(progressElement) {
        const circle = progressElement.querySelector('.progress-circle');
        const progress = parseInt(circle.getAttribute('data-progress'));
        const circumference = 2 * Math.PI * 30; // radius = 30
        const offset = circumference - (progress / 100) * circumference;
        
        setTimeout(() => {
            circle.style.strokeDashoffset = offset;
        }, 500);
    }

    // Floating Navigation
    initFloatingNav() {
        const navDots = document.querySelectorAll('.nav-dot');
        const sections = document.querySelectorAll('.section');
        
        const updateActiveNav = () => {
            const scrollPos = window.scrollY + window.innerHeight / 2;
            
            sections.forEach((section, index) => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                
                if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                    navDots.forEach(dot => dot.classList.remove('active'));
                    if (navDots[index]) {
                        navDots[index].classList.add('active');
                    }
                }
            });
        };
        
        window.addEventListener('scroll', updateActiveNav);
        updateActiveNav(); // Initial call
        
        // Smooth scroll to sections
        navDots.forEach((dot, index) => {
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = sections[index];
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Scroll Progress
    initScrollProgress() {
        const progressCircle = document.querySelector('.progress-circle');
        const circumference = 2 * Math.PI * 25; // radius = 25
        
        const updateScrollProgress = () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = scrollTop / docHeight;
            const offset = circumference - (progress * circumference);
            
            progressCircle.style.strokeDashoffset = offset;
        };
        
        window.addEventListener('scroll', updateScrollProgress);
        updateScrollProgress(); // Initial call
    }

    handleScroll() {
        // Throttle scroll events for performance
        if (!this.scrollTimeout) {
            this.scrollTimeout = setTimeout(() => {
                this.updateParallax();
                this.scrollTimeout = null;
            }, 16); // ~60fps
        }
    }

    updateParallax() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.floating-shape, .gradient-mesh');
        
        parallaxElements.forEach((el, index) => {
            const speed = 0.5 + (index * 0.1);
            const yPos = -(scrolled * speed);
            el.style.transform = `translateY(${yPos}px)`;
        });
    }

    // Typewriter Effect
    initTypewriterEffect() {
        const typewriterElement = document.querySelector('.typewriter-text');
        if (!typewriterElement) return;
        
        const text = typewriterElement.getAttribute('data-text');
        let index = 0;
        
        const typeChar = () => {
            if (index < text.length) {
                typewriterElement.textContent = text.slice(0, index + 1);
                index++;
                setTimeout(typeChar, 100);
            }
        };
        
        setTimeout(typeChar, 1000);
    }

    animateHeroContent() {
        const heroElements = document.querySelectorAll('.hero .reveal-text, .hero-actions');
        
        heroElements.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('visible');
            }, index * 200);
        });
    }

    startCounterAnimations() {
        const statItems = document.querySelectorAll('.stat-item');
        statItems.forEach((item, index) => {
            setTimeout(() => {
                this.animateCounter(item);
            }, index * 300);
        });
    }

    // Magnetic Buttons
    initMagneticButtons() {
        const magneticButtons = document.querySelectorAll('.magnetic-btn');
        
        magneticButtons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                btn.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
            });
            
            btn.addEventListener('click', (e) => {
                this.createRipple(e, btn);
            });
        });
    }

    createRipple(event, element) {
        const ripple = document.createElement('div');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.classList.add('btn-ripple');
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // Skills Filter
    initSkillsFilter() {
        const filterButtons = document.querySelectorAll('.skills .filter-btn');
        const skillItems = document.querySelectorAll('.skill-item');
        
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.getAttribute('data-category');
                
                // Update active button
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Filter skills
                skillItems.forEach(item => {
                    const itemCategory = item.getAttribute('data-category');
                    
                    if (category === 'all' || itemCategory === category) {
                        item.classList.remove('hidden');
                    } else {
                        item.classList.add('hidden');
                    }
                });
            });
        });
    }

    // Projects Filter
    initProjectsFilter() {
        const filterButtons = document.querySelectorAll('.projects .filter-btn');
        const projectCards = document.querySelectorAll('.project-card');
        
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.getAttribute('data-category');
                
                // Update active button
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Filter projects
                projectCards.forEach(card => {
                    const cardCategory = card.getAttribute('data-category');
                    
                    if (category === 'all' || cardCategory === category) {
                        card.classList.remove('hidden');
                    } else {
                        card.classList.add('hidden');
                    }
                });
            });
        });
    }

    // Testimonials
    initTestimonials() {
        const cubeButtons = document.querySelectorAll('.cube-btn');
        const cubeFaces = document.querySelectorAll('.cube-face');
        
        cubeButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                this.showTestimonial(index);
            });
        });
        
        // Auto-rotate testimonials
        this.startTestimonialRotation();
    }

    showTestimonial(index) {
        const cubeButtons = document.querySelectorAll('.cube-btn');
        const cubeFaces = document.querySelectorAll('.cube-face');
        
        // Update buttons
        cubeButtons.forEach(btn => btn.classList.remove('active'));
        cubeButtons[index].classList.add('active');
        
        // Update faces
        cubeFaces.forEach(face => face.classList.remove('active'));
        cubeFaces[index].classList.add('active');
        
        this.currentTestimonial = index;
        
        // Restart auto-rotation
        this.stopTestimonialRotation();
        this.startTestimonialRotation();
    }

    startTestimonialRotation() {
        this.testimonialInterval = setInterval(() => {
            const nextIndex = (this.currentTestimonial + 1) % 3;
            this.showTestimonial(nextIndex);
        }, 5000);
    }

    stopTestimonialRotation() {
        if (this.testimonialInterval) {
            clearInterval(this.testimonialInterval);
            this.testimonialInterval = null;
        }
    }

    // Contact Form
    initContactForm() {
        const form = document.getElementById('contact-form');
        const inputs = form.querySelectorAll('.form-control');
        
        // Enhanced form field animations
        inputs.forEach(input => {
            // Set placeholder attribute for CSS selector
            input.setAttribute('placeholder', ' ');
            
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                if (input.value === '') {
                    input.parentElement.classList.remove('focused');
                }
            });
            
            // Check if field has value on load
            if (input.value !== '') {
                input.parentElement.classList.add('focused');
            }
        });
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmission(form);
        });
    }

    async handleFormSubmission(form) {
        const formData = new FormData(form);
        const submitButton = form.querySelector('button[type="submit"]');
        const buttonText = submitButton.querySelector('.btn-text');
        
        // Disable form and show loading
        submitButton.disabled = true;
        buttonText.textContent = 'Sending...';
        
        // Validate form
        const isValid = this.validateForm(form);
        
        if (!isValid) {
            submitButton.disabled = false;
            buttonText.textContent = 'Send Message';
            return;
        }
        
        // Simulate form submission (replace with actual API call)
        setTimeout(() => {
            this.showSuccessModal();
            this.triggerConfetti();
            form.reset();
            
            // Reset form state
            submitButton.disabled = false;
            buttonText.textContent = 'Send Message';
            
            // Reset field states
            form.querySelectorAll('.form-field').forEach(field => {
                field.classList.remove('focused');
            });
        }, 2000);
    }

    validateForm(form) {
        const inputs = form.querySelectorAll('.form-control[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            const field = input.parentElement;
            field.classList.remove('error');
            
            if (!input.value.trim()) {
                field.classList.add('error');
                isValid = false;
            }
            
            // Email validation
            if (input.type === 'email' && input.value.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    field.classList.add('error');
                    isValid = false;
                }
            }
        });
        
        return isValid;
    }

    showSuccessModal() {
        const modal = document.getElementById('success-modal');
        const closeButton = document.getElementById('close-modal');
        
        modal.classList.remove('hidden');
        
        // Close modal handlers
        closeButton.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
        
        modal.querySelector('.modal-backdrop').addEventListener('click', () => {
            modal.classList.add('hidden');
        });
        
        // Auto-close after 5 seconds
        setTimeout(() => {
            if (!modal.classList.contains('hidden')) {
                modal.classList.add('hidden');
            }
        }, 5000);
    }

    triggerConfetti() {
        const container = document.querySelector('.confetti-container');
        const colors = ['#08D9D6', '#A855F7', '#00FF9D', '#0077FF', '#9B51E0'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.classList.add('confetti');
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDelay = Math.random() * 0.5 + 's';
                confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
                
                container.appendChild(confetti);
                
                setTimeout(() => {
                    confetti.remove();
                }, 4000);
            }, i * 20);
        }
    }

    handleResize() {
        // Update particle system canvas
        const canvas = document.getElementById('particles');
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }
}

// Utility Functions
const utils = {
    // Smooth scroll to element
    scrollToElement(selector, offset = 0) {
        const element = document.querySelector(selector);
        if (element) {
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - offset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    },
    
    // Debounce function for performance
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function for scroll events
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
};

// Initialize Portfolio
document.addEventListener('DOMContentLoaded', () => {
    // Add loading class to prevent flash
    document.body.classList.add('loading');
    
    // Initialize portfolio
    window.portfolio = new PremiumPortfolio();
    
    // Remove loading class after initialization
    setTimeout(() => {
        document.body.classList.remove('loading');
    }, 100);
});

// Handle page visibility for performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when page is hidden
        if (window.portfolio && window.portfolio.testimonialInterval) {
            window.portfolio.stopTestimonialRotation();
        }
    } else {
        // Resume animations when page is visible
        if (window.portfolio && !window.portfolio.testimonialInterval) {
            window.portfolio.startTestimonialRotation();
        }
    }
});

// Keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close modal on Escape
        const modal = document.querySelector('.modal:not(.hidden)');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    if (e.key === 'Tab') {
        // Show focus indicators for keyboard navigation
        document.body.classList.add('using-keyboard');
    }
});

document.addEventListener('mousedown', () => {
    // Hide focus indicators when using mouse
    document.body.classList.remove('using-keyboard');
});

// Add CSS for keyboard navigation
const style = document.createElement('style');
style.textContent = `
    .using-keyboard *:focus {
        outline: 2px solid var(--theme-accent-primary) !important;
        outline-offset: 2px !important;
    }
    
    body:not(.using-keyboard) *:focus {
        outline: none !important;
    }
    
    .form-field.error .form-control {
        border-bottom-color: var(--color-error) !important;
    }
    
    .form-field.error .form-label {
        color: var(--color-error) !important;
    }
    
    .loading * {
        transition: none !important;
        animation: none !important;
    }
    
    @media (prefers-reduced-motion: reduce) {
        .morphing-shape,
        .floating-shape,
        .gradient-mesh,
        .typewriter-text::after {
            animation: none !important;
        }
        
        .reveal-text,
        .magnetic-btn,
        .skill-bubble,
        .project-card .card-inner {
            transition: none !important;
        }
    }
`;
document.head.appendChild(style);