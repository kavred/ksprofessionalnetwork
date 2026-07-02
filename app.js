/* ==========================================================================
   KSPN CLIENT-SIDE LOGIC
   Handles SPA routing, form validation/submission, and mobile transitions.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. SPA Hash Routing
    // ----------------------------------------------------
    const sections = document.querySelectorAll('.view-section');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    const header = document.getElementById('main-header');
    
    // Mobile Navigation Drawer elements
    const mobileToggle = document.getElementById('mobile-nav-toggle');
    const mobileDrawer = document.getElementById('mobile-nav-drawer');

    function handleRouting() {
        // Get hash from URL, default to '#home'
        let hash = window.location.hash || '#home';
        
        // Safety check for empty hash
        if (hash === '#') hash = '#home';

        // Check if the hash matches a valid section
        const targetSection = document.querySelector(hash);
        if (!targetSection) {
            // Fallback to home if route doesn't exist
            window.location.hash = '#home';
            return;
        }

        // Close mobile drawer if navigating
        closeMobileMenu();

        // Switch active sections
        sections.forEach(section => {
            if (`#${section.id}` === hash) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });

        // Update active class on desktop navbar links
        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            if (linkHref === hash) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Update active class on mobile drawer links
        mobileNavLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            if (linkHref === hash) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Scroll immediately to the top on page change
        window.scrollTo(0, 0);
        
        // Double check header sizing/scroll layout
        handleHeaderScroll();
    }

    // Bind hashchange event and initial page load
    window.addEventListener('hashchange', handleRouting);
    handleRouting(); // run once on start

    // ----------------------------------------------------
    // 2. Mobile Navigation Toggle Drawer
    // ----------------------------------------------------

    function toggleMobileMenu() {
        const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
        mobileToggle.setAttribute('aria-expanded', !isExpanded);
        mobileDrawer.classList.toggle('active');
        mobileDrawer.setAttribute('aria-hidden', isExpanded);
    }

    function closeMobileMenu() {
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileDrawer.classList.remove('active');
        mobileDrawer.setAttribute('aria-hidden', 'true');
    }

    mobileToggle.addEventListener('click', toggleMobileMenu);

    // Close mobile drawer if clicking outside of the drawer contents
    document.addEventListener('click', (e) => {
        if (mobileDrawer.classList.contains('active')) {
            const isClickInsideDrawer = mobileDrawer.contains(e.target);
            const isClickToggle = mobileToggle.contains(e.target);
            if (!isClickInsideDrawer && !isClickToggle) {
                closeMobileMenu();
            }
        }
    });

    // ----------------------------------------------------
    // 3. Header Scroll Visual Adjustment
    // ----------------------------------------------------
    function handleHeaderScroll() {
        if (window.scrollY > window.innerHeight * 0.05) {
            header.style.padding = '0.5vh 0';
            header.style.boxShadow = '0vw 0.5vw 2vw rgba(0,0,0,0.05)';
        } else {
            header.style.padding = '0';
            header.style.boxShadow = 'none';
        }
    }
    
    window.addEventListener('scroll', handleHeaderScroll);

    // ----------------------------------------------------
    // 4. Phase 1 Intake Form Handling
    // ----------------------------------------------------
    const intakeForm = document.getElementById('kspn-intake-form');
    const formOverlay = document.getElementById('form-success-overlay');
    const closeSuccessBtn = document.getElementById('close-success-btn');

    // Email regex validator
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Phone format validator (allows digits, spaces, parentheses, dashes)
    function isValidPhone(phone) {
        const re = /^[\d\s()+-]{7,20}$/;
        return re.test(phone.trim());
    }

    // Helper to validate individual inputs
    function validateField(input, validationFn, errorElementId) {
        const value = input.value.trim();
        const errorElement = document.getElementById(errorElementId);
        
        let isValid = true;
        if (value === "") {
            isValid = false;
        } else if (validationFn && !validationFn(value)) {
            isValid = false;
        }

        if (!isValid) {
            input.classList.add('invalid');
            errorElement.classList.add('active');
        } else {
            input.classList.remove('invalid');
            errorElement.classList.remove('active');
        }

        return isValid;
    }

    if (intakeForm) {
        intakeForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Validate all fields
            const nameInput = document.getElementById('company-name');
            const industryInput = document.getElementById('company-industry');
            const addressInput = document.getElementById('company-address');
            const contactNameInput = document.getElementById('contact-name');
            const contactTitleInput = document.getElementById('contact-title');
            const emailInput = document.getElementById('contact-email');
            const phoneInput = document.getElementById('contact-phone');

            const isNameValid = validateField(nameInput, null, 'error-company-name');
            const isIndustryValid = validateField(industryInput, null, 'error-company-industry');
            const isAddressValid = validateField(addressInput, null, 'error-company-address');
            const isContactNameValid = validateField(contactNameInput, null, 'error-contact-name');
            const isContactTitleValid = validateField(contactTitleInput, null, 'error-contact-title');
            const isEmailValid = validateField(emailInput, isValidEmail, 'error-contact-email');
            const isPhoneValid = validateField(phoneInput, isValidPhone, 'error-contact-phone');

            const isFormValid = isNameValid && isIndustryValid && isAddressValid && 
                                isContactNameValid && isContactTitleValid && isEmailValid && isPhoneValid;

            if (isFormValid) {
                // Collect details for pipeline tracking
                const formData = {
                    companyName: nameInput.value.trim(),
                    companyIndustry: industryInput.value.trim(),
                    companyAddress: addressInput.value.trim(),
                    contactName: contactNameInput.value.trim(),
                    contactTitle: contactTitleInput.value.trim(),
                    contactEmail: emailInput.value.trim(),
                    contactPhone: phoneInput.value.trim(),
                    timestamp: new Date().toISOString()
                };

                // Output details for development audit
                console.log('Successfully registered in KSPN pipeline:', formData);

                // Show success modal overlay
                formOverlay.classList.add('active');
                formOverlay.setAttribute('aria-hidden', 'false');

                // Clear input form fields
                intakeForm.reset();
                document.querySelectorAll('.kspn-form input').forEach(input => {
                    input.classList.remove('invalid');
                });
                document.querySelectorAll('.error-msg').forEach(msg => {
                    msg.classList.remove('active');
                });
            }
        });

        // Add live input listening to clean errors on typing
        const fieldsToWatch = [
            { id: 'company-name', errorId: 'error-company-name' },
            { id: 'company-industry', errorId: 'error-company-industry' },
            { id: 'company-address', errorId: 'error-company-address' },
            { id: 'contact-name', errorId: 'error-contact-name' },
            { id: 'contact-title', errorId: 'error-contact-title' }
        ];

        fieldsToWatch.forEach(field => {
            const input = document.getElementById(field.id);
            input.addEventListener('input', () => {
                if (input.value.trim() !== "") {
                    input.classList.remove('invalid');
                    document.getElementById(field.errorId).classList.remove('active');
                }
            });
        });

        // Specialized validation watcher for email
        const emailInput = document.getElementById('contact-email');
        emailInput.addEventListener('input', () => {
            if (isValidEmail(emailInput.value.trim())) {
                emailInput.classList.remove('invalid');
                document.getElementById('error-contact-email').classList.remove('active');
            }
        });

        // Specialized validation watcher for phone
        const phoneInput = document.getElementById('contact-phone');
        phoneInput.addEventListener('input', () => {
            if (isValidPhone(phoneInput.value.trim())) {
                phoneInput.classList.remove('invalid');
                document.getElementById('error-contact-phone').classList.remove('active');
            }
        });
    }

    if (closeSuccessBtn) {
        closeSuccessBtn.addEventListener('click', () => {
            formOverlay.classList.remove('active');
            formOverlay.setAttribute('aria-hidden', 'true');
        });
    }

    // ----------------------------------------------------
    // 5. Student Hub Alert Signup Form
    // ----------------------------------------------------
    const studentForm = document.getElementById('student-alert-form');
    const studentSuccessMsg = document.getElementById('alert-success-msg');

    if (studentForm) {
        studentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('student-email');
            const errorMsg = document.getElementById('error-student-email');
            const emailValue = emailInput.value.trim();

            if (isValidEmail(emailValue)) {
                // Valid student submission
                console.log('Student alert registered:', emailValue);
                
                // Hide input controls & display inline success
                studentForm.querySelector('.newsletter-input-group').style.display = 'none';
                errorMsg.classList.remove('active');
                studentSuccessMsg.classList.add('active');
                studentSuccessMsg.setAttribute('aria-hidden', 'false');
            } else {
                emailInput.classList.add('invalid');
                errorMsg.classList.add('active');
            }
        });

        const studentEmailInput = document.getElementById('student-email');
        studentEmailInput.addEventListener('input', () => {
            if (isValidEmail(studentEmailInput.value.trim())) {
                studentEmailInput.classList.remove('invalid');
                document.getElementById('error-student-email').classList.remove('active');
            }
        });
    }

    // ----------------------------------------------------
    // 6. Modern scroll animation: Intersection Observer
    // ----------------------------------------------------
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add class to reveal with transition
                entry.target.classList.add('visible');
                // Stop observing once animated
                animationObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -10% 0px' // animate slightly before fully entering
    });

    // Select elements to reveal on scroll
    const animatedElements = document.querySelectorAll('.value-card, .step-content, .format-card, .tier-card, .hq-card, .school-card, .section-header-center, .section-desc');
    
    // Set initial transparent/translated states and start observing
    animatedElements.forEach(el => {
        el.classList.add('scroll-reveal');
        animationObserver.observe(el);
    });
});
