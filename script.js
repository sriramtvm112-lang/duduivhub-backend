(function () {
  const body = document.body;
  const dashboardToggle = document.getElementById('dashboardToggle');
  const yearEl = document.getElementById('year');
  const navPackage = document.getElementById('nav-package');
  const navLinks = document.querySelectorAll('nav.nav-links a');
  const footLinks = document.querySelectorAll('nav.foot-links a');
  const tnList = document.getElementById('tn-list');
  const klList = document.getElementById('kl-list');
  const regionCards = document.querySelectorAll('.region-card');

  const form = document.getElementById('enquiryForm');
  const formNote = document.getElementById('formNote');
  const captchaQuestion = document.getElementById('captchaQuestion');
  const captchaInput = document.getElementById('captchaInput');
  const openEnquireButtons = document.querySelectorAll('[data-open-enquire]');
  const heroBgA = document.getElementById('heroBgA');
  const heroBgB = document.getElementById('heroBgB');
  const heroPrev = document.getElementById('heroPrev');
  const heroNext = document.getElementById('heroNext');

  let captchaAnswer = '';
  let heroTimer = null;
  let heroIndex = 0;
  let heroToggle = false;

  function setYear() {
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

   // Mark the current page in the header/footer navs
  function setActiveNav() {
    const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const mark = (link) => {
      try {
        const href = (link.getAttribute('href') || '').toLowerCase();
        if (!href) return;
        const isMatch = (path === '' && href.endsWith('index.html')) || path.endsWith(href);
        if (isMatch) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        }
      } catch {}
    };
    navLinks.forEach(mark);
    footLinks.forEach(mark);
  }

  function toggleDashboard() {
    const on = !body.classList.contains('dashboard-on');
    body.classList.toggle('dashboard-on', on);
    if (dashboardToggle) dashboardToggle.setAttribute('aria-pressed', String(on));
  }

  function generateCaptcha() {
    // Generate simple addition (like GT Holidays: 1 + 5 = ?)
    const num1 = Math.floor(Math.random() * 10) + 1; // 1-10
    const num2 = Math.floor(Math.random() * 10) + 1; // 1-10
    captchaAnswer = String(num1 + num2);
    if (captchaQuestion) {
      captchaQuestion.textContent = `${num1} + ${num2} = ?`;
    }
    if (captchaInput) {
      captchaInput.value = '';
    }
  }

  function showRegionCards() {
    // Ensure region cards are visible; lists are hidden until clicked
    if (tnList) tnList.hidden = true;
    if (klList) klList.hidden = true;
    regionCards.forEach(card => card.setAttribute('aria-expanded', 'false'));
  }

  function onRegionCardClick(card) {
    const region = card.getAttribute('data-region');
    if (region === 'tn') {
      if (tnList) tnList.hidden = !tnList.hidden;
      if (klList) klList.hidden = true;
      card.setAttribute('aria-expanded', String(!tnList.hidden));
      // Collapse the other card's aria state
      regionCards.forEach(c => {
        if (c !== card) c.setAttribute('aria-expanded', 'false');
      });
    } else if (region === 'kl') {
      if (klList) klList.hidden = !klList.hidden;
      if (tnList) tnList.hidden = true;
      card.setAttribute('aria-expanded', String(!klList.hidden));
      regionCards.forEach(c => {
        if (c !== card) c.setAttribute('aria-expanded', 'false');
      });
    }
  }

  // --- Hero slideshow ---
  // Order: Company → Tamil Nadu iconic place → Hotels → Food
  const heroImages = [
    // Company / business cityscape
    'https://i.pinimg.com/1200x/5f/78/af/5f78af583a21ce080541d0dd6e8abc83.jpg',
    // Tamil Nadu iconic place (temple/heritage)
    'https://static.vecteezy.com/system/resources/previews/038/464/057/non_2x/ai-generated-a-tea-plantation-at-sunrise-with-neat-rows-of-tea-bushes-stretching-to-the-horizon-free-photo.jpeg',
    // Kerala iconic place (backwaters/landscape)
    'https://static.vecteezy.com/system/resources/previews/013/872/175/non_2x/tanjore-big-temple-or-brihadeshwara-temple-was-built-by-king-raja-raja-cholan-in-thanjavur-tamil-nadu-it-is-the-very-oldest-and-tallest-temple-in-india-this-temple-listed-in-unesco-s-heritage-site-free-photo.jpg',
    // Hotels (modern room)
    'https://i.pinimg.com/1200x/73/c2/af/73c2aff2b1cae0738f4411024a848069.jpg',
    // Food (Indian cuisine)
    'https://static.vecteezy.com/system/resources/previews/024/650/050/non_2x/gourmet-chicken-biryani-with-steamed-basmati-rice-generated-by-ai-free-photo.jpg',
    // Industry (factory/industrial landscape)
    'https://images.pexels.com/photos/459728/pexels-photo-459728.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    // Kerala food
    'https://img.freepik.com/free-photo/financial-charts-kpi-metrics-displays-office_482257-126638.jpg?semt=ais_hybrid&w=740&q=80',
    // Kerala companies (modern office)
    'https://cdn.pixabay.com/photo/2013/07/19/17/38/kerala-165347_1280.jpg',
    // Tamil Nadu place (temple)
    'https://plus.unsplash.com/premium_photo-1661878008007-7a13bf31c14b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170'
  ];

  function applyHeroImage(url) {
    if (!heroBgA || !heroBgB) return;
    const target = heroToggle ? heroBgA : heroBgB;
    const other = heroToggle ? heroBgB : heroBgA;
    target.style.backgroundImage = `url('${url}')`;
    target.classList.add('show');
    other.classList.remove('show');
    heroToggle = !heroToggle;
  }

  function restartHeroAuto() {
    if (heroTimer) clearInterval(heroTimer);
    if (heroImages.length > 1) {
      heroTimer = setInterval(() => { heroNextImage(); }, 5000);
    }
  }

  function startHeroSlideshow() {
    if (!heroBgA || !heroBgB || heroImages.length === 0) return;
    // Initial image and start autoplay
    applyHeroImage(heroImages[heroIndex % heroImages.length]);
    restartHeroAuto();
  }

  function heroNextImage() {
    heroIndex = (heroIndex + 1) % heroImages.length;
    applyHeroImage(heroImages[heroIndex]);
  }

  function heroPrevImage() {
    heroIndex = (heroIndex - 1 + heroImages.length) % heroImages.length;
    applyHeroImage(heroImages[heroIndex]);
  }

  function validateForm(data) {
    console.log('Form data:', Array.from(data.entries()));
    console.log('Captcha answer:', captchaAnswer);
    
    // Match exact field names from index.html
    const required = ['name', 'city', 'email', 'phone', 'whatsapp', 'destination', 'travelDate', 'people'];
    for (const key of required) {
      const value = data.get(key);
      console.log(`Checking ${key}:`, value);
      if (!value || String(value).trim() === '') {
        console.log(`Missing required field: ${key}`);
        return { ok: false, msg: `Please fill in all required fields.` };
      }
    }
    
    const email = String(data.get('email') || '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, msg: 'Please enter a valid email address.' };
    }
    
    const phone = String(data.get('phone') || '');
    if (!/^[0-9]{10}$/.test(phone)) {
      return { ok: false, msg: 'Please enter a valid 10-digit phone number.' };
    }
    
    const whatsapp = String(data.get('whatsapp') || '');
    if (!/^[0-9]{10}$/.test(whatsapp)) {
      return { ok: false, msg: 'Please enter a valid 10-digit WhatsApp number.' };
    }
    
    const people = parseInt(data.get('people') || '0');
    if (people < 1) {
      return { ok: false, msg: 'Number of people must be at least 1.' };
    }
    
    const ans = String(data.get('captcha') || '').trim();
    console.log('Captcha input:', ans);
    if (!ans || ans !== String(captchaAnswer)) {
      console.log('Captcha validation failed');
      return { ok: false, msg: 'Captcha is incorrect. Please try again.' };
    }
    
    console.log('Form validation passed');
    return { ok: true };
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    if (formNote) formNote.textContent = '';

    const data = new FormData(form);
    const res = validateForm(data);
    if (!res.ok) {
      if (formNote) {
        formNote.textContent = res.msg;
        formNote.style.color = '#b91c1c';
      }
      generateCaptcha();
      return;
    }

    try {
      // Prevent duplicate submissions
      const submitBtn = document.getElementById('submitBtn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
      }

      // Show immediate loading feedback
      if (formNote) {
        formNote.textContent = 'Submitting your enquiry...';
        formNote.style.color = '#6b7280';
      }

      // Try backend server first
      const formData = Object.fromEntries(data.entries());
      console.log('🚀 Starting form submission');
      console.log('📋 Form data being sent:', formData);
      console.log('🌐 API endpoint:', 'https://duduivhub-backend-nw5t.onrender.com/api/submit-enquiry');
      
      const response = await fetch('https://duduivhub-backend-nw5t.onrender.com/api/submit-enquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        signal: AbortSignal.timeout(15000) // 15 second timeout
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('📥 Backend response received:', result);
        
        if (result.success) {
          console.log('✅ Backend confirmed success - showing success to user');
          if (formNote) {
            formNote.textContent = result.message || 'Thank you! We will contact you shortly.';
            formNote.style.color = '#065f46';
          }
          form.reset();
          generateCaptcha();
          
          // Restore button state
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'BOOK NOW';
          }
          return;
        } else {
          // Backend explicitly returned failure
          console.log('❌ Backend returned failure - showing error to user');
          if (formNote) {
            formNote.textContent = result.message || 'Notification system error. Please try again.';
            formNote.style.color = '#b91c1c';
          }
          generateCaptcha();
        }
      } else {
        // HTTP error - backend unreachable
        console.log('💥 HTTP error - backend unreachable');
        if (formNote) {
          formNote.textContent = 'Server error. Please try again or contact directly.';
          formNote.style.color = '#b91c1c';
        }
        generateCaptcha();
      }
    } catch (error) {
      console.error('Backend API error:', error);
      console.log('Server not available, falling back to FormSubmit');
    } finally {
      // Always restore button state
      const submitBtn = document.getElementById('submitBtn');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'BOOK NOW';
      }
    }

    // Fallback to FormSubmit.co with correct field names
    try {
      // Disable button during fallback submission
      const submitBtn = document.getElementById('submitBtn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
      }

      if (formNote) {
        formNote.textContent = 'Processing your enquiry...';
        formNote.style.color = '#6b7280';
      }

      const formData = new FormData();
      formData.append('name', data.get('name'));
      formData.append('city', data.get('city'));
      formData.append('email', data.get('email'));
      formData.append('phone', data.get('phone'));
      formData.append('whatsapp', data.get('whatsapp'));
      formData.append('destination', data.get('destination'));
      formData.append('travelDate', data.get('travelDate'));
      formData.append('people', data.get('people'));
      formData.append('_subject', 'New Trip Enquiry');
      formData.append('_template', 'table');
      formData.append('_captcha', 'false');
      formData.append('_next', window.location.href);

      const response = await fetch('https://formsubmit.co/duduivhub@gmail.com', {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(15000) // 15 second timeout
      });

      if (response.ok) {
        if (formNote) {
          formNote.textContent = 'Thank you! Your enquiry has been submitted successfully.';
          formNote.style.color = '#065f46';
        }
        form.reset();
        generateCaptcha();
        
        // Restore button state
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'BOOK NOW';
        }
        
        // WhatsApp notification is sent from backend only - no deeplink
      } else {
        throw new Error('Form submission failed');
      }
    } catch (err) {
      console.error('Form submission error:', err);
      if (formNote) {
        formNote.textContent = 'Submission failed. Please try again or contact us directly.';
        formNote.style.color = '#b91c1c';
      }
      generateCaptcha();
    } finally {
      // Always restore button state
      const submitBtn = document.getElementById('submitBtn');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'BOOK NOW';
      }
    }
  }

  function scrollToEnquire() {
    console.log('Scrolling to enquire section');
    
    const enquireSection = document.getElementById('enquire');
    
    if (!enquireSection) {
      console.error('Enquire section not found');
      return;
    }

    // Smooth scroll to the enquire section
    enquireSection.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });

    // Generate captcha when scrolling to form
    generateCaptcha();
    
    // Focus first input after scroll
    setTimeout(() => {
      const firstInput = form?.querySelector('input[type="text"]');
      if (firstInput) {
        firstInput.focus();
      }
    }, 800);
  }

  function openEnquireModal() {
    console.log('Opening enquire modal');
    
    const enquireModal = document.getElementById('enquire');
    const enquireBackdrop = document.getElementById('enquireBackdrop');
    
    if (!enquireModal || !enquireBackdrop) {
      console.error('Modal elements not found');
      return;
    }

    // Show modal
    enquireModal.hidden = false;
    enquireBackdrop.hidden = false;
    
    // Force reflow
    enquireModal.offsetHeight;

    // Trigger slide animation
    requestAnimationFrame(() => {
      enquireModal.classList.add('open');
      enquireBackdrop.classList.add('open');
    });

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Generate captcha
    generateCaptcha();
    
    // Focus first input after animation
    setTimeout(() => {
      const firstInput = enquireModal.querySelector('input[type="text"]');
      if (firstInput) {
        firstInput.focus();
      }
    }, 450);
  }

  function closeEnquireModal() {
    console.log('Closing enquire modal');
    
    const enquireModal = document.getElementById('enquire');
    const enquireBackdrop = document.getElementById('enquireBackdrop');
    
    if (!enquireModal || !enquireBackdrop) return;

    // Remove active classes
    enquireModal.classList.remove('open');
    enquireBackdrop.classList.remove('open');

    // Enable body scroll
    document.body.style.overflow = '';

    // Hide after animation completes
    setTimeout(() => {
      enquireModal.hidden = true;
      enquireBackdrop.hidden = true;
    }, 400);
  }

  function bind() {
    setYear();
    setActiveNav();
    generateCaptcha();

    if (dashboardToggle) {
      dashboardToggle.addEventListener('click', toggleDashboard);
      // Initialize off
      dashboardToggle.setAttribute('aria-pressed', 'false');
    }

    // Make Dashboard button turn white while pressing on all devices
    const dashBtn = document.querySelector('.btn-dashboard');
    if (dashBtn) {
      const pressOn = () => dashBtn.classList.add('pressed');
      const pressOff = () => dashBtn.classList.remove('pressed');
      dashBtn.addEventListener('pointerdown', pressOn);
      dashBtn.addEventListener('pointerup', pressOff);
      dashBtn.addEventListener('pointercancel', pressOff);
      dashBtn.addEventListener('pointerleave', pressOff);
      dashBtn.addEventListener('blur', pressOff);
      // Fallback for older touch events
      dashBtn.addEventListener('touchstart', pressOn, { passive: true });
      dashBtn.addEventListener('touchend', pressOff, { passive: true });
    }

    if (navPackage) {
      navPackage.addEventListener('click', () => {
        showRegionCards();
      });
    }

    regionCards.forEach(card => {
      card.addEventListener('click', () => onRegionCardClick(card));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onRegionCardClick(card);
        }
      });
    });

    if (form) {
      form.addEventListener('submit', handleFormSubmit);
    }

    // Add submit button click handler
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
      submitBtn.addEventListener('click', function(e) {
        e.preventDefault();
        handleFormSubmit(e);
      });
    }

    if (openEnquireButtons.length) {
      // Check if we're on home page or other pages
      const enquireSection = document.querySelector('.enquire-section');
      const isHomePage = enquireSection !== null;
      
      openEnquireButtons.forEach((btn) => {
        if (isHomePage) {
          // Home page: scroll to enquire section
          btn.addEventListener('click', scrollToEnquire);
        } else {
          // Other pages: open modal popup
          btn.addEventListener('click', openEnquireModal);
        }
      });
    }
    
    // Close modal handlers
    const closeEnquireBtn = document.getElementById('closeEnquire');
    const enquireBackdrop = document.getElementById('enquireBackdrop');
    
    if (closeEnquireBtn) {
      closeEnquireBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeEnquireModal();
      });
    }
    
    if (enquireBackdrop) {
      enquireBackdrop.addEventListener('click', () => {
        const enquireModal = document.getElementById('enquire');
        if (enquireModal && enquireModal.classList.contains('enquire-modal')) {
          closeEnquireModal();
        }
      });
    }
    
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const enquireModal = document.getElementById('enquire');
        if (enquireModal && enquireModal.classList.contains('enquire-modal') && enquireModal.classList.contains('open')) {
          closeEnquireModal();
        }
      }
    });

    // Start hero slideshow on home page with auto-play and manual controls
    startHeroSlideshow();

    // Manual controls via buttons (with autoplay)
    if (heroNext) heroNext.addEventListener('click', () => { heroNextImage(); });
    if (heroPrev) heroPrev.addEventListener('click', () => { heroPrevImage(); });
    if (heroBgA) heroBgA.replaceWith(heroBgA); // remove previous listeners if any
    if (heroBgB) heroBgB.replaceWith(heroBgB);
  }

  // Test function for debugging - can be called from browser console
  window.testEnquireScroll = function() {
    console.log('=== Testing Enquire Scroll ===');
    console.log('Enquire section:', document.getElementById('enquire'));
    console.log('Open buttons:', openEnquireButtons);
    console.log('Form element:', form);
    scrollToEnquire();
  };
  
  // Initialize the enquiry form
  function initEnquireForm() {
    // Generate initial captcha
    generateCaptcha();
    
    // Set current date as min date for travel date
    const today = new Date().toISOString().split('T')[0];
    const travelDateInput = document.getElementById('travelDate');
    if (travelDateInput) {
      travelDateInput.min = today;
    }
    
    // Add event listeners for open buttons
    openEnquireButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        scrollToEnquire();
      });
    });
    
    // Handle form submission
    if (form) {
      form.addEventListener('submit', handleFormSubmit);
    }
    
    // Generate new captcha when requested
    const captchaReload = document.getElementById('captchaReload');
    if (captchaReload) {
      captchaReload.addEventListener('click', (e) => {
        e.preventDefault();
        generateCaptcha();
      });
    }
  }
  
  // Initialize the enquiry form when the DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    initEnquireForm();
    
    // Set current year in footer
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
    
    // Set active navigation
    setActiveNav();
    
    // Start hero slideshow
    startHeroSlideshow();
  });
  
  // Handle window resize
  window.addEventListener('resize', () => {
    // Recalculate any responsive elements if needed
  });
  
  // Log initialization status
  console.log('=== Enquire Section Initialized ===');
  console.log('✓ Enquire section:', !!document.getElementById('enquire'));
  console.log('✓ Open buttons:', openEnquireButtons.length);
  console.log('✓ Form:', !!form);

  document.addEventListener('DOMContentLoaded', bind);
})();
