// ============================================
// GALAXY LUXURY - Subtle Interactive Effects
// ============================================

// Twinkling Stars Background
function initStars() {
  const canvas = document.createElement('canvas');
  canvas.id = 'stars-canvas';
  document.body.insertBefore(canvas, document.body.firstChild);

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const stars = [];
  const starCount = 150;

  class Star {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2;
      this.opacity = Math.random();
      this.twinkleSpeed = Math.random() * 0.02 + 0.005;
      this.growing = Math.random() > 0.5;
    }

    update() {
      if (this.growing) {
        this.opacity += this.twinkleSpeed;
        if (this.opacity >= 1) {
          this.growing = false;
        }
      } else {
        this.opacity -= this.twinkleSpeed;
        if (this.opacity <= 0.1) {
          this.growing = true;
        }
      }
    }

    draw() {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();

      // Subtle glow
      if (this.opacity > 0.7) {
        ctx.shadowBlur = 4;
        ctx.shadowColor = `rgba(255, 255, 255, ${this.opacity * 0.5})`;
      }
    }
  }

  // Create stars
  for (let i = 0; i < starCount; i++) {
    stars.push(new Star());
  }

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach((star) => {
      star.update();
      star.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();

  // Handle resize
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// Subtle Smooth Scroll
function initSmoothScrolling() {
  const scrollableElements = document.querySelectorAll('.section-content');

  scrollableElements.forEach((element) => {
    let isScrolling;

    element.addEventListener('scroll', () => {
      window.clearTimeout(isScrolling);

      element.style.scrollBehavior = 'smooth';

      isScrolling = setTimeout(() => {
        element.style.scrollBehavior = 'auto';
      }, 100);
    });
  });
}

// Elegant Hover Effects
function initHoverEffects() {
  const interactiveElements = document.querySelectorAll(
    'button, .stat-item, .graph-item, table tbody tr, .section'
  );

  interactiveElements.forEach((element) => {
    element.addEventListener('mouseenter', (e) => {
      // Subtle scale effect
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      element.style.setProperty('--mouse-x', `${x}px`);
      element.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

// Typing Effect for Login Section (Subtle)
function initTypingEffect() {
  const loginResult = document.getElementById('login-result');
  if (!loginResult) return;

  const originalText = loginResult.textContent;
  if (originalText.trim() === '') return;

  loginResult.textContent = '';
  loginResult.style.opacity = '0.6';

  let i = 0;
  function typeWriter() {
    if (i < originalText.length) {
      loginResult.textContent += originalText.charAt(i);
      i++;
      setTimeout(typeWriter, 30);
    } else {
      loginResult.style.opacity = '1';
    }
  }

  typeWriter();
}

// Animated Counter for Stats
function animateCounter(element, target, duration = 1500) {
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = Math.round(target).toLocaleString();
      clearInterval(timer);
    } else {
      element.textContent = Math.round(current).toLocaleString();
    }
  }, 16);
}

// Init all counters when profile loads
function initCounterAnimations() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.classList && node.classList.contains('stat-value')) {
          const value = parseInt(node.textContent.replace(/,/g, ''));
          if (!isNaN(value) && value > 0) {
            animateCounter(node, value);
          }
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Parallax Effect on Cards (Very Subtle)
function initParallax() {
  const sections = document.querySelectorAll('.section');

  document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth - 0.5;
    const mouseY = e.clientY / window.innerHeight - 0.5;

    sections.forEach((section, index) => {
      const speed = (index + 1) * 0.5;
      const x = mouseX * speed;
      const y = mouseY * speed;

      section.style.transform = `
        translateY(-4px)
        rotateX(${y * 2}deg)
        rotateY(${x * 2}deg)
      `;
    });
  });

  sections.forEach((section) => {
    section.addEventListener('mouseenter', () => {
      section.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });

    section.addEventListener('mouseleave', () => {
      section.style.transform = '';
    });
  });
}

// Smooth Page Transitions
function initPageTransitions() {
  const loginSection = document.getElementById('login-section');
  const profileSection = document.getElementById('profile-section');

  if (!loginSection || !profileSection) return;

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.target === profileSection && mutation.attributeName === 'style') {
        if (profileSection.style.display !== 'none') {
          profileSection.style.opacity = '0';
          setTimeout(() => {
            profileSection.style.opacity = '1';
          }, 50);
        }
      }
    });
  });

  observer.observe(profileSection, {
    attributes: true,
    attributeFilter: ['style']
  });
}

// Ambient Light Effect (Very Subtle)
function initAmbientLight() {
  const sections = document.querySelectorAll('.section');

  sections.forEach((section) => {
    section.addEventListener('mousemove', (e) => {
      const rect = section.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      section.style.background = `
        radial-gradient(
          circle at ${x}% ${y}%,
          rgba(255, 255, 255, 0.05) 0%,
          rgba(26, 26, 26, 0.75) 50%
        )
      `;
    });

    section.addEventListener('mouseleave', () => {
      section.style.background = 'rgba(26, 26, 26, 0.75)';
    });
  });
}

// Smooth Number Reveal on Scroll
function initScrollReveal() {
  const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe elements as they're added
  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.classList && (
          node.classList.contains('stat-item') ||
          node.classList.contains('graph-item')
        )) {
          node.style.opacity = '0';
          node.style.transform = 'translateY(20px)';
          node.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
          observer.observe(node);
        }
      });
    });
  });

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Subtle Button Ripple
function initButtonRipple() {
  const buttons = document.querySelectorAll('button');

  buttons.forEach((button) => {
    button.addEventListener('click', (e) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: 1px;
        height: 1px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
      `;

      button.style.position = 'relative';
      button.style.overflow = 'hidden';
      button.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Add ripple animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(100);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

// Elegant Focus States
function initFocusStates() {
  const focusableElements = document.querySelectorAll('input, button, a, [tabindex]');

  focusableElements.forEach((element) => {
    element.addEventListener('focus', () => {
      element.style.outline = '2px solid rgba(255, 255, 255, 0.3)';
      element.style.outlineOffset = '2px';
    });

    element.addEventListener('blur', () => {
      element.style.outline = 'none';
    });
  });
}

// Shooting Stars (Occasional)
function initShootingStars() {
  const container = document.body;

  function createShootingStar() {
    const star = document.createElement('div');
    star.style.cssText = `
      position: fixed;
      width: 2px;
      height: 2px;
      background: white;
      border-radius: 50%;
      box-shadow: 0 0 6px 2px rgba(255, 255, 255, 0.8);
      top: ${Math.random() * 50}%;
      left: ${Math.random() * 100}%;
      pointer-events: none;
      z-index: 5;
      animation: shootingStar 1.5s ease-out forwards;
    `;

    container.appendChild(star);
    setTimeout(() => star.remove(), 1500);
  }

  // Add shooting star animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shootingStar {
      from {
        transform: translate(0, 0);
        opacity: 1;
      }
      to {
        transform: translate(200px, 200px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // Create shooting star every 8-15 seconds
  setInterval(() => {
    if (Math.random() > 0.5) {
      createShootingStar();
    }
  }, Math.random() * 7000 + 8000);
}

// Initialize all effects
document.addEventListener('DOMContentLoaded', () => {
  initStars();
  initTypingEffect();
  initHoverEffects();
  initCounterAnimations();
  initSmoothScrolling();
  initPageTransitions();
  initScrollReveal();
  initButtonRipple();
  initFocusStates();
  initShootingStars();

  // Initialize profile-specific effects after login
  const profileSection = document.getElementById('profile-section');
  if (profileSection) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.target.style.display !== 'none') {
          setTimeout(() => {
            initAmbientLight();
            initParallax();
          }, 100);
          observer.disconnect();
        }
      });
    });

    observer.observe(profileSection, {
      attributes: true,
      attributeFilter: ['style']
    });
  }
});
