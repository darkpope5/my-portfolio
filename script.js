// Typing Animation
const typingText = document.getElementById('typing-text');
const phrases = [
    'Digital Alchemist',
    'Brand Strategist', 
    'Systems Architect'
];

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 100;

function typeWriter() {
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
    
    setTimeout(typeWriter, typingSpeed);
}

// Start typing animation when page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(typeWriter, 1000);
    
    // Initialize scroll animations
    observeElements();
    
    // Handle file uploads
    setupFileUploads();
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

// Intersection Observer for animations
function observeElements() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe all sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        observer.observe(section);
    });
    
    // Observe cards and items
    const cards = document.querySelectorAll('.service-card, .portfolio-item, .framework-step');
    cards.forEach(card => {
        observer.observe(card);
    });
}

// Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();

// File Upload Handlers with Firebase Storage
function setupFileUploads() {
    // Load saved images on page load
    async function loadSavedImages() {
        try {
            // Load profile image
            const profileRef = storage.ref('profile/profile-image');
            const profileUrl = await profileRef.getDownloadURL();
            document.getElementById('profile-img').src = profileUrl;
        } catch (error) {
            console.log('No profile image found');
        }
        
        // Load portfolio images
        const portfolioImages = document.querySelectorAll('.portfolio-image img');
        portfolioImages.forEach(async (img, index) => {
            try {
                const portfolioRef = storage.ref(`portfolio/image-${index}`);
                const imageUrl = await portfolioRef.getDownloadURL();
                img.src = imageUrl;
            } catch (error) {
                console.log(`No portfolio image found for index ${index}`);
            }
        });
    }
    
    // Call on page load
    loadSavedImages();
    
    // Profile image upload
    const profileUpload = document.getElementById('profile-upload');
    const profileImg = document.getElementById('profile-img');
    
    if (profileUpload && profileImg) {
        profileUpload.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                try {
                    const profileRef = storage.ref('profile/profile-image');
                    await profileRef.put(file);
                    const downloadURL = await profileRef.getDownloadURL();
                    profileImg.src = downloadURL;
                } catch (error) {
                    console.error('Error uploading profile image:', error);
                    alert('Failed to upload profile image. Please try again.');
                }
            }
        });
    }
    
    // Portfolio image uploads
    const portfolioUploads = document.querySelectorAll('.portfolio-upload');
    portfolioUploads.forEach((upload, index) => {
        upload.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                try {
                    const portfolioRef = storage.ref(`portfolio/image-${index}`);
                    await portfolioRef.put(file);
                    const downloadURL = await portfolioRef.getDownloadURL();
                    const img = upload.previousElementSibling;
                    img.src = downloadURL;
                } catch (error) {
                    console.error('Error uploading portfolio image:', error);
                    alert('Failed to upload portfolio image. Please try again.');
                }
            }
        });
    });
    
    // CV upload with password protection
    const cvUpload = document.getElementById('cv-upload');
    if (cvUpload) {
        const uploadBtn = document.querySelector('.btn-upload');
        uploadBtn.onclick = function(e) {
            e.preventDefault();
            const password = prompt('Enter password to upload CV:');
            if (password === 'blakpope2024') { // You can change this password
                document.getElementById('cv-upload').click();
            } else {
                alert('Incorrect password');
            }
        };
        
        cvUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file && file.type === 'application/pdf') {
                // Store the file for download
                window.uploadedCV = file;
                
                // Update button text to show file is uploaded
                if (uploadBtn) {
                    uploadBtn.textContent = `✓ ${file.name} Uploaded`;
                    uploadBtn.style.background = '#4CAF50';
                }
            }
        });
    }
}

// CV Download Function
function downloadCV() {
    if (window.uploadedCV) {
        // Download the uploaded CV
        const url = URL.createObjectURL(window.uploadedCV);
        const a = document.createElement('a');
        a.href = url;
        a.download = window.uploadedCV.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } else {
        // Create a sample CV if none uploaded
        const cvContent = `
PRINCE CHINWENDU - THE BLAKPOPE
Digital Alchemist | Brand Strategist | Systems Architect

📍 Port Harcourt, Nigeria
📞 08144249595
✉️ pchinwendu@gmail.com

🎯 PROFESSIONAL SUMMARY
Innovative digital strategist with expertise in brand development, 
system architecture, and marketing automation. Passionate about 
transforming complex challenges into elegant, scalable solutions.

⚙️ CORE COMPETENCIES
• Brand Strategy & Identity Development
• Digital Automation & CRM Systems
• Course & Funnel Architecture
• Content Strategy & Social Media Direction
• Systems Integration & Optimization

🏆 KEY ACHIEVEMENTS
• Evro Homes: Delivered 35% growth in real estate brand visibility
• Digital Kurrency: Achieved 2,000% increase in music streaming
• LifeTaste Beverages: Successful product launch campaign

🛠️ FRAMEWORK METHODOLOGY
1. Purpose - Define the why behind every decision
2. Structure - Build foundation for sustainable growth
3. Story - Craft narratives that resonate and convert
4. Systems - Automate processes for efficiency
5. Scale - Expand reach while maintaining quality

📚 PHILOSOPHY
"Shaping minds, systems, and stories that scale."

Helping people, products, and platforms reinvent and rise—
from engineering to brand ecosystems.
        `;
        
        const blob = new Blob([cvContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Prince_Chinwendu_CV.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Contact Functions
function openEmail() {
    const email = document.querySelector('.contact-item:nth-child(3) .editable').textContent;
    const subject = 'Let\'s Work Together - Project Inquiry';
    const body = `Hi Prince,\n\nI visited your website and I'm interested in working with you.\n\nProject Details:\n- \n\nLet's discuss how we can collaborate.\n\nBest regards`;
    
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
}

function makeCall() {
    const phone = document.querySelector('.contact-item:nth-child(2) .editable').textContent;
    window.location.href = `tel:${phone}`;
}



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