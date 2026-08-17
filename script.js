document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // 1. Theme Management (Light/Dark Mode)
    // -------------------------------------------------------------
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn.querySelector('i');
    
    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Initial Theme Load
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme(systemPrefersDark ? 'dark' : 'light');
    }
    
    // Click Listener
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });
    
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update Icon
        if (theme === 'dark') {
            themeIcon.className = 'fa-solid fa-sun';
        } else {
            themeIcon.className = 'fa-solid fa-moon';
        }
    }

    // -------------------------------------------------------------
    // 2. Mobile Menu Toggle
    // -------------------------------------------------------------
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const menuIcon = mobileMenuBtn.querySelector('i');

    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('open');
        const isOpen = navMenu.classList.contains('open');
        menuIcon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
    });

    // Close menu when clicking links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('open');
            menuIcon.className = 'fa-solid fa-bars';
        });
    });

    // -------------------------------------------------------------
    // 3. Navbar Styling on Scroll
    // -------------------------------------------------------------
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // -------------------------------------------------------------
    // 4. Hero Section Typing Effect
    // -------------------------------------------------------------
    const dynamicTxt = document.getElementById('dynamic-txt');
    const words = ['Software Engineer', 'Flutter Developer', 'DBMS Specialist', 'Problem Solver'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    
    function typeEffect() {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            dynamicTxt.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
        } else {
            dynamicTxt.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
        }
        
        let typeSpeed = isDeleting ? 40 : 80;
        
        // If word is completely typed
        if (!isDeleting && charIndex === currentWord.length) {
            typeSpeed = 1500; // Pause at the end of word
            isDeleting = true;
        } 
        // If word is completely deleted
        else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typeSpeed = 400; // Small pause before next word
        }
        
        setTimeout(typeEffect, typeSpeed);
    }
    
    // Start typing effect
    typeEffect();

    // -------------------------------------------------------------
    // 5. Active Link Highlight on Scroll
    // -------------------------------------------------------------
    const sections = document.querySelectorAll('section');
    
    function highlightNavLink() {
        let scrollY = window.scrollY;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 120; // Offset for fixed navbar
            const sectionId = section.getAttribute('id');
            
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                document.querySelector(`.nav-link[href*=${sectionId}]`)?.classList.add('active');
            } else {
                document.querySelector(`.nav-link[href*=${sectionId}]`)?.classList.remove('active');
            }
        });
    }
    
    window.addEventListener('scroll', highlightNavLink);

    // -------------------------------------------------------------
    // 6. Project Card Filtering
    // -------------------------------------------------------------
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active to current button
            button.classList.add('active');
            
            const filterValue = button.getAttribute('data-filter');
            
            projectCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                
                if (filterValue === 'all' || cardCategory === filterValue) {
                    card.classList.remove('hide');
                    card.style.animation = 'fadeIn 0.4s ease forwards';
                } else {
                    card.classList.add('hide');
                }
            });
        });
    });

    // -------------------------------------------------------------
    // 7. Interactive Contact Form Submission
    // -------------------------------------------------------------
    const contactForm = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');

    // ---- EmailJS config ----
    // 1. Create a free account at https://www.emailjs.com
    // 2. Add an Email Service (e.g. Gmail) -> copy its Service ID below.
    // 3. Create an Email Template with {{from_name}}, {{from_email}}, {{subject}}, {{message}} variables -> copy its Template ID below.
    // 4. Account > General > copy your Public Key below.
    const EMAILJS_SERVICE_ID = 'service_ibbjotb';
    const EMAILJS_TEMPLATE_ID = 'fr33v8j';
    const EMAILJS_PUBLIC_KEY = 'R0kjMRKtYDU6kZ9xL';

    if (window.emailjs && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    }

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const submitBtn = contactForm.querySelector('.btn-submit');
        const nameVal = document.getElementById('name').value.trim();
        const emailVal = document.getElementById('email').value.trim();
        const subjectVal = document.getElementById('subject').value.trim();
        const messageVal = document.getElementById('message').value.trim();
        
        if (!nameVal || !emailVal || !subjectVal || !messageVal) {
            showFormFeedback('Please fill in all details.', 'error');
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailVal)) {
            showFormFeedback('Please enter a valid email address.', 'error');
            return;
        }
        
        // Disable button while processing
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending... <i class="fa-solid fa-spinner fa-spin"></i>';

        const isConfigured = EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY'
            && EMAILJS_SERVICE_ID !== 'YOUR_SERVICE_ID'
            && EMAILJS_TEMPLATE_ID !== 'YOUR_TEMPLATE_ID';

        if (window.emailjs && isConfigured) {
            // Real send via EmailJS
            emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                name: nameVal,
                email: emailVal,
                title: subjectVal,
                message: messageVal,
                time: new Date().toLocaleString()
            }).then(() => {
                showFormFeedback(`Thank you, ${nameVal}! Your message has been sent successfully.`, 'success');
                contactForm.reset();
            }).catch(() => {
                showFormFeedback('Something went wrong sending your message. Please try emailing me directly.', 'error');
            }).finally(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Send Message <i class="fa-solid fa-paper-plane"></i>';
                setTimeout(() => { formMessage.style.opacity = '0'; }, 5000);
            });
        } else {
            // EmailJS not configured yet — fall back to opening the visitor's mail client
            const mailtoLink = `mailto:Sohailmahnoor52@gmail.com?subject=${encodeURIComponent(subjectVal)}&body=${encodeURIComponent(`From: ${nameVal} (${emailVal})\n\n${messageVal}`)}`;
            window.location.href = mailtoLink;

            showFormFeedback(`Opening your mail app to send this to me, ${nameVal}!`, 'success');
            contactForm.reset();
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Send Message <i class="fa-solid fa-paper-plane"></i>';
            setTimeout(() => { formMessage.style.opacity = '0'; }, 5000);
        }
    });
    
    function showFormFeedback(message, type) {
        formMessage.textContent = message;
        formMessage.className = `form-message ${type}`;
        formMessage.style.opacity = '1';
    }

    // -------------------------------------------------------------
    // 7. Certificate Preview Modal
    // -------------------------------------------------------------
    const certModal = document.getElementById('cert-modal');
    const certModalBody = document.getElementById('cert-modal-body');
    const certModalTitle = document.getElementById('cert-modal-title');
    const certModalDownload = document.getElementById('cert-modal-download');
    const certCards = document.querySelectorAll('.cert-clickable');
    let lastFocusedCertCard = null;

    certCards.forEach(card => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');

        const openThisCert = () => openCertModal(card);

        card.addEventListener('click', openThisCert);
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openThisCert();
            }
        });
    });

    function openCertModal(card) {
        const src = card.getAttribute('data-cert-src');
        const type = card.getAttribute('data-cert-type');
        const title = card.getAttribute('data-cert-title') || 'Certificate';

        lastFocusedCertCard = card;
        certModalTitle.textContent = title;
        certModalDownload.setAttribute('href', src);
        certModalDownload.setAttribute('download', '');

        certModalBody.innerHTML = '';
        if (type === 'pdf') {
            const iframe = document.createElement('iframe');
            iframe.src = src;
            iframe.title = title;
            certModalBody.appendChild(iframe);
        } else {
            const img = document.createElement('img');
            img.src = src;
            img.alt = title;
            certModalBody.appendChild(img);
        }

        certModal.classList.add('is-open');
        certModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        certModal.querySelector('.cert-modal-close').focus();
    }

    function closeCertModal() {
        certModal.classList.remove('is-open');
        certModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        certModalBody.innerHTML = '';
        if (lastFocusedCertCard) lastFocusedCertCard.focus();
    }

    certModal.querySelectorAll('[data-cert-close]').forEach(el => {
        el.addEventListener('click', closeCertModal);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && certModal.classList.contains('is-open')) {
            closeCertModal();
        }
    });

    // -------------------------------------------------------------
    // 8. Scroll Progress Bar + Floating Back-to-Top Button
    // -------------------------------------------------------------
    const scrollProgress = document.getElementById('scroll-progress');
    const backToTopBtn = document.getElementById('back-to-top');

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        scrollProgress.style.width = progress + '%';

        if (scrollTop > 500) {
            backToTopBtn.classList.add('is-visible');
        } else {
            backToTopBtn.classList.remove('is-visible');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // -------------------------------------------------------------
    // 9. Copy Email to Clipboard + Toast
    // -------------------------------------------------------------
    const copyEmailBtn = document.getElementById('copy-email-btn');
    const toast = document.getElementById('toast');
    let toastTimeout;

    if (copyEmailBtn) {
        copyEmailBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const email = 'Sohailmahnoor52@gmail.com';
            try {
                await navigator.clipboard.writeText(email);
                showToast('Email copied to clipboard!');
            } catch (err) {
                // Fallback if clipboard API is blocked
                window.location.href = `mailto:${email}`;
            }
        });
    }

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('is-visible');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('is-visible');
        }, 2200);
    }
});