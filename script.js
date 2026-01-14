// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all animated elements
document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 80;
            const targetPosition = target.offsetTop - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Update active nav link on scroll
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= (sectionTop - 100)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
});

// Add stagger effect to cards
document.querySelectorAll('.row').forEach(row => {
    const cards = row.querySelectorAll('.fade-in');
    cards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
    });
});

// Image Lightbox functionality
const lightbox = document.getElementById('imageLightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxDesc = document.getElementById('lightboxDesc');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

let currentImages = [];
let currentIndex = 0;

// Get all portfolio items for lightbox
const portfolioItems = document.querySelectorAll('.portfolio-item');

portfolioItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        const imageSrc = item.getAttribute('data-image');
        const title = item.getAttribute('data-title');
        const description = item.getAttribute('data-description');
        
        // Set current images array for navigation
        currentImages = Array.from(portfolioItems).map(p => ({
            src: p.getAttribute('data-image'),
            title: p.getAttribute('data-title'),
            desc: p.getAttribute('data-description')
        }));
        
        currentIndex = index;
        openLightbox(imageSrc, title, description);
    });
});

function openLightbox(src, title, description) {
    lightboxImage.src = src;
    lightboxTitle.textContent = title;
    lightboxDesc.textContent = description;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

function navigateLightbox(direction) {
    if (currentImages.length === 0) return;
    
    currentIndex += direction;
    
    if (currentIndex < 0) {
        currentIndex = currentImages.length - 1;
    } else if (currentIndex >= currentImages.length) {
        currentIndex = 0;
    }
    
    const image = currentImages[currentIndex];
    openLightbox(image.src, image.title, image.desc);
}

// Event listeners
lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
lightboxNext.addEventListener('click', () => navigateLightbox(1));

// Close lightbox on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeLightbox();
    } else if (e.key === 'ArrowLeft') {
        navigateLightbox(-1);
    } else if (e.key === 'ArrowRight') {
        navigateLightbox(1);
    }
});

// Close lightbox when clicking outside image
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        closeLightbox();
    }
});