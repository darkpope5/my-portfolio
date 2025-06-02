import { config, validateConfig } from './config.js';

// Typing Animation with cleanup and error handling
const typingAnimation = {
    timer: null,
    init() {
        const typingText = document.getElementById('typing-text');
        if (!typingText) {
            console.error('Typing text element not found');
            return;
        }

        const phrases = [
            'Digital Alchemist',
            'Brand Strategist', 
            'Systems Architect'
        ];

        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 100;

        const typeWriter = () => {
            const currentPhrase = phrases[phraseIndex];
            
            if (isDeleting) {
                typingText.textContent = currentPhrase.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 50;
            } else {
                typingText.textContent = currentPhrase.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 100;
            }
            
            if (!isDeleting && charIndex === currentPhrase.length) {
                isDeleting = true;
                typingSpeed = 2000; // Pause at end
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                typingSpeed = 500; // Pause before next phrase
            }
            
            this.timer = setTimeout(typeWriter, typingSpeed);
        };

        // Start typing animation
        this.timer = setTimeout(typeWriter, 1000);
    },
    cleanup() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }
};

// Intersection Observer singleton
const animationObserver = {
    observer: null,
    init() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
    },
    observe(element) {
        if (!this.observer) {
            this.init();
        }
        this.observer.observe(element);
    },
    cleanup() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
};

// Mobile Menu with accessibility
const mobileMenu = {
    init() {
        const menuToggle = document.getElementById('mobile-menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileLinks = document.querySelectorAll('.mobile-link');
        
        if (!menuToggle || !mobileMenu) {
            console.error('Mobile menu elements not found');
            return;
        }

        // Add ARIA attributes
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Toggle navigation menu');
        mobileMenu.setAttribute('aria-hidden', 'true');
        
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            mobileMenu.setAttribute('aria-hidden', isExpanded);
            
            mobileMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
            menuToggle.classList.toggle('active');
        });
        
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                mobileMenu.setAttribute('aria-hidden', 'true');
            });
        });
    }
};

// Firebase initialization with error handling
async function initializeFirebase() {
    if (!validateConfig()) {
        console.error('Firebase configuration is invalid');
        return null;
    }

    try {
        const app = await import('https://www.gstatic.com/firebasejs/11.8.0/firebase-app.js');
        const storage = await import('https://www.gstatic.com/firebasejs/11.8.0/firebase-storage.js');
        
        const firebaseApp = app.initializeApp(config.firebase);
        return storage.getStorage(firebaseApp);
    } catch (error) {
        console.error('Failed to initialize Firebase:', error);
        return null;
    }
}

// File upload handling with loading states
async function handleFileUpload(file, storageRef, imgElement) {
    if (!file || !file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
    }

    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.textContent = 'Uploading...';
    imgElement.parentNode.appendChild(loadingIndicator);

    try {
        await storageRef.put(file);
        const downloadURL = await storageRef.getDownloadURL();
        imgElement.src = downloadURL;
    } catch (error) {
        console.error('Error uploading file:', error);
        alert('Failed to upload image. Please try again.');
    } finally {
        loadingIndicator.remove();
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Firebase
    const storage = await initializeFirebase();
    if (!storage) {
        console.error('Failed to initialize Firebase storage');
        return;
    }

    // Start typing animation
    typingAnimation.init();
    
    // Initialize mobile menu
    mobileMenu.init();
    
    // Initialize animations
    const elements = document.querySelectorAll('section, .service-card, .portfolio-item, .framework-step');
    elements.forEach(element => animationObserver.observe(element));
    
    // Setup file upload handlers
    setupFileUploads(storage);
});

// Cleanup on page unload
window.addEventListener('unload', () => {
    typingAnimation.cleanup();
    animationObserver.cleanup();
});

// Smooth Scrolling
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Navigation scroll effect
window.addEventListener('scroll', function() {
    const nav = document.querySelector('.nav-sticky');
    if (window.scrollY > 100) {
        nav.style.background = 'rgba(0, 0, 0, 0.95)';
    } else {
        nav.style.background = 'rgba(0, 0, 0, 0.9)';
    }
});

// Portfolio item click handlers
document.addEventListener('click', function(e) {
    if (e.target.closest('.portfolio-item')) {
        const item = e.target.closest('.portfolio-item');
        const img = item.querySelector('img');
        
        // Create modal for full view
        if (img && !e.target.classList.contains('upload-overlay')) {
            createImageModal(img.src, item.querySelector('h3').textContent);
        }
    }
});

// Image modal function
function createImageModal(src, title) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close">&times;</span>
            <img src="${src}" alt="${title}">
            <h3>${title}</h3>
        </div>
    `;
    
    // Add modal styles
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        text-align: center;
        position: relative;
    `;
    
    const modalImg = modal.querySelector('img');
    modalImg.style.cssText = `
        max-width: 100%;
        max-height: 80vh;
        object-fit: contain;
        border-radius: 10px;
    `;
    
    const modalClose = modal.querySelector('.modal-close');
    modalClose.style.cssText = `
        position: absolute;
        top: -40px;
        right: 0;
        font-size: 2rem;
        color: #FFD700;
        cursor: pointer;
        background: none;
        border: none;
    `;
    
    const modalTitle = modal.querySelector('h3');
    modalTitle.style.cssText = `
        color: #FFD700;
        margin-top: 1rem;
        font-family: 'Playfair Display', serif;
    `;
    
    document.body.appendChild(modal);
    
    // Animate in
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
    
    // Close handlers
    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    function closeModal() {
        modal.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    }
    
    // ESC key handler
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// Smooth scroll for navigation links
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        scrollToSection(targetId);
    });
});

// Add scroll progress indicator
function addScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, #FFD700, #FFF);
        z-index: 1001;
        transition: width 0.1s ease;
    `;
    
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', function() {
        const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// Initialize scroll progress
document.addEventListener('DOMContentLoaded', function() {
    addScrollProgress();
});

// Add parallax effect to hero section
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-section');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Save editable content to localStorage
function saveEditableContent() {
    const editables = document.querySelectorAll('.editable');
    const content = {};
    
    editables.forEach((element, index) => {
        content[`editable_${index}`] = element.textContent || element.innerHTML;
    });
    
    localStorage.setItem('websiteContent', JSON.stringify(content));
}

// Load editable content from localStorage
function loadEditableContent() {
    const saved = localStorage.getItem('websiteContent');
    if (saved) {
        const content = JSON.parse(saved);
        const editables = document.querySelectorAll('.editable');
        
        editables.forEach((element, index) => {
            if (content[`editable_${index}`]) {
                if (element.tagName === 'INPUT') {
                    element.value = content[`editable_${index}`];
                } else {
                    element.textContent = content[`editable_${index}`];
                }
            }
        });
    }
}

// Auto-save on content change
document.addEventListener('input', function(e) {
    if (e.target.classList.contains('editable')) {
        saveEditableContent();
    }
});

// Load content on page load
document.addEventListener('DOMContentLoaded', function() {
    loadEditableContent();
});