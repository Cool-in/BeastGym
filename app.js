/**
 * BEAST Training Center - Core Logic & Interactive Actions
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileMenu();
    initScrollSpy();
    initScheduleTabs();
    initGalleryFilter();
    initLightbox();
    initPricingToggler();
    initContactForm();
    initCardGlows();
});

/* ==========================================================================
   1. Theme Switching (Light/Dark)
   ========================================================================== */
function initTheme() {
    const html = document.documentElement;
    const themeBtn = document.getElementById('theme-toggle-btn');
    
    const storedTheme = localStorage.getItem('bst-theme') || 'theme-dark';
    html.className = storedTheme;
    
    themeBtn.addEventListener('click', () => {
        if (html.classList.contains('theme-dark')) {
            html.classList.replace('theme-dark', 'theme-light');
            localStorage.setItem('bst-theme', 'theme-light');
        } else {
            html.classList.replace('theme-light', 'theme-dark');
            localStorage.setItem('bst-theme', 'theme-dark');
        }
        
        // Brief timeout to let layout settle, then reposition schedule slider
        setTimeout(() => {
            const currentActive = document.querySelector('.schedule-tab-btn.active');
            if (typeof repositionActiveBar === 'function') {
                repositionActiveBar(currentActive);
            }
        }, 150);
    });
}

/* ==========================================================================
   2. Mobile Drawer Navigation
   ========================================================================== */
function initMobileMenu() {
    const mobileToggle = document.getElementById('mobile-nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    function toggleMenu() {
        mobileToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.classList.toggle('overflow-hidden');
    }
    
    mobileToggle.addEventListener('click', toggleMenu);
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                toggleMenu();
            }
        });
    });
}

/* ==========================================================================
   3. Active Link Highlight on Scroll (Scroll Spy)
   ========================================================================== */
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const header = document.getElementById('header');

    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY + 110; // Header height offset

        // Scrolled state
        if (window.scrollY > 40) {
            header.style.height = "70px";
            header.style.backgroundColor = "var(--glass-bg)";
        } else {
            header.style.height = "90px";
        }

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
}

/* ==========================================================================
   4. Class Schedule Tabs & Sliding Active Bar
   ========================================================================== */
let repositionActiveBar; // Make globally referenceable in theme switcher

function initScheduleTabs() {
    const tabButtons = document.querySelectorAll('.schedule-tab-btn');
    const tabActiveBar = document.querySelector('.tabs-active-bar');
    const panels = document.querySelectorAll('.schedule-panel');
    
    repositionActiveBar = function(activeBtn) {
        if (!activeBtn || !tabActiveBar) return;
        tabActiveBar.style.width = `${activeBtn.offsetWidth}px`;
        tabActiveBar.style.left = `${activeBtn.offsetLeft}px`;
    };
    
    // Set initial active bar position
    const initialActive = document.querySelector('.schedule-tab-btn.active');
    setTimeout(() => repositionActiveBar(initialActive), 200);
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            repositionActiveBar(btn);
            
            const targetDay = btn.getAttribute('data-day');
            panels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.getAttribute('id') === `panel-${targetDay}`) {
                    panel.classList.add('active');
                }
            });
        });
    });
    
    window.addEventListener('resize', () => {
        const currentActive = document.querySelector('.schedule-tab-btn.active');
        repositionActiveBar(currentActive);
    });
}

/* ==========================================================================
   5. Gallery Filtering
   ========================================================================== */
function initGalleryFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    function filterGallery(filterValue) {
        galleryItems.forEach(item => {
            const itemCategory = item.getAttribute('data-category');
            
            if (filterValue === 'all' || itemCategory === filterValue) {
                // Show matching item
                item.style.display = 'block';
                // Force a reflow so the display: block takes effect before we transition opacity
                void item.offsetWidth; 
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
            } else {
                // Hide non-matching item instantly to let grid reflow immediately without gap spacing
                item.style.opacity = '0';
                item.style.transform = 'scale(0.95)';
                item.style.display = 'none';
            }
        });
    }
    
    // Set initial layout filter immediately on load
    const activeBtn = document.querySelector('.filter-btn.active');
    if (activeBtn) {
        const initialFilter = activeBtn.getAttribute('data-filter');
        galleryItems.forEach(item => {
            const itemCategory = item.getAttribute('data-category');
            if (initialFilter !== 'all' && itemCategory !== initialFilter) {
                item.style.display = 'none';
                item.style.opacity = '0';
                item.style.transform = 'scale(0.95)';
            } else {
                item.style.display = 'block';
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
            }
        });
    }
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-filter');
            filterGallery(filterValue);
        });
    });
}

/* ==========================================================================
   6. Photo Gallery Lightbox Modal
   ========================================================================== */
function initLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDesc = document.getElementById('lightbox-desc');
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');
    
    let currentIndex = 0;
    let activeImages = [];
    
    function openLightbox(index) {
        activeImages = Array.from(galleryItems).filter(item => item.style.display !== 'none');
        
        currentIndex = activeImages.findIndex(item => item === activeImages[index]);
        if (currentIndex === -1) currentIndex = 0;
        
        updateLightboxContent();
        lightbox.classList.add('active');
        document.body.classList.add('overflow-hidden');
    }
    
    function updateLightboxContent() {
        if (!activeImages.length) return;
        const currentItem = activeImages[currentIndex];
        const img = currentItem.querySelector('.gallery-img');
        const title = currentItem.querySelector('.gallery-item-title').textContent;
        const category = currentItem.querySelector('.gallery-item-cat').textContent;
        
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxTitle.textContent = title;
        lightboxDesc.textContent = category;
    }
    
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.classList.remove('overflow-hidden');
    }
    
    function showNext() {
        if (!activeImages.length) return;
        currentIndex = (currentIndex + 1) % activeImages.length;
        updateLightboxContent();
    }
    
    function showPrev() {
        if (!activeImages.length) return;
        currentIndex = (currentIndex - 1 + activeImages.length) % activeImages.length;
        updateLightboxContent();
    }
    
    galleryItems.forEach((item, index) => {
        const zoomBtn = item.querySelector('.gallery-zoom-btn');
        zoomBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openLightbox(index);
        });
        
        const overlay = item.querySelector('.gallery-overlay');
        overlay.addEventListener('click', () => {
            openLightbox(index);
        });
    });
    
    closeBtn.addEventListener('click', closeLightbox);
    nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });
    prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
    
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') showNext();
        if (e.key === 'ArrowLeft') showPrev();
    });
}

/* ==========================================================================
   7. Membership Rates / Price Toggle
   ========================================================================== */
function initPricingToggler() {
    const toggleBtn = document.getElementById('billing-toggle');
    const monthlyLabel = document.getElementById('label-monthly');
    const yearlyLabel = document.getElementById('label-yearly');
    const prices = document.querySelectorAll('.price-value');
    
    monthlyLabel.classList.add('active');
    
    function toggleRates() {
        const isYearly = toggleBtn.classList.toggle('active');
        
        if (isYearly) {
            monthlyLabel.classList.remove('active');
            yearlyLabel.classList.add('active');
        } else {
            yearlyLabel.classList.remove('active');
            monthlyLabel.classList.add('active');
        }
        
        prices.forEach(price => {
            const monthlyVal = price.getAttribute('data-monthly');
            const yearlyVal = price.getAttribute('data-yearly');
            
            price.style.transform = 'scale(0.85)';
            price.style.opacity = '0.5';
            
            setTimeout(() => {
                price.textContent = isYearly ? yearlyVal : monthlyVal;
                price.style.transform = 'scale(1)';
                price.style.opacity = '1';
            }, 120);
        });
    }
    
    toggleBtn.addEventListener('click', toggleRates);
    monthlyLabel.addEventListener('click', () => {
        if (toggleBtn.classList.contains('active')) toggleRates();
    });
    yearlyLabel.addEventListener('click', () => {
        if (!toggleBtn.classList.contains('active')) toggleRates();
    });
}

/* ==========================================================================
   8. Mock Contact Form Submission
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('gym-contact-form');
    const feedbackMsg = document.getElementById('form-feedback-message');
    
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('form-name').value;
        const email = document.getElementById('form-email').value;
        
        feedbackMsg.className = 'form-feedback';
        feedbackMsg.textContent = 'TRANSMITTING REQUEST...';
        feedbackMsg.classList.add('success');
        
        setTimeout(() => {
            feedbackMsg.textContent = `SUCCESS // WELCOME TO BEAST, ${name.toUpperCase()}. PASS SENT TO ${email.toUpperCase()}.`;
            form.reset();
            
            const dropdown = document.getElementById('form-tier');
            dropdown.value = '';
            
            setTimeout(() => {
                feedbackMsg.style.opacity = '0';
                setTimeout(() => {
                    feedbackMsg.textContent = '';
                    feedbackMsg.className = 'form-feedback';
                }, 400);
            }, 6000);
        }, 1500);
    });
}

/* ==========================================================================
   9. Interactive Mouse Cursor Glows (Glow Cards)
   ========================================================================== */
function initCardGlows() {
    const glowCards = document.querySelectorAll('.glow-card');
    
    glowCards.forEach(card => {
        // Create indicator element dynamically if it doesn't exist
        let glow = card.querySelector('.bento-glow');
        if (!glow) {
            glow = document.createElement('div');
            glow.className = 'bento-glow';
            card.appendChild(glow);
        }
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}
