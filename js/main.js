// A&T Auto Services — Main JavaScript

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initHeaderScroll();
  initHeroSlider();
  initQuoteForm();
  initScrollAnimations();
  initStatsCounter();
});

// Hero image slider — change every 7 seconds
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero__slide');
  if (slides.length < 2) return;

  let index = 0;
  setInterval(() => {
    slides[index].classList.remove('is-active');
    index = (index + 1) % slides.length;
    slides[index].classList.add('is-active');
  }, 7000);
}

// Mobile Menu
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    nav.classList.toggle('open');
    document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// Header shadow on scroll
function initHeaderScroll() {
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 50
      ? '0 4px 24px rgba(0, 0, 0, 0.3)'
      : 'none';
  });
}

// Quote Form
function initQuoteForm() {
  const form = document.getElementById('quoteForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    const existing = form.querySelector('.form-success');
    if (existing) existing.remove();

    const success = document.createElement('div');
    success.className = 'form-success';
    success.textContent = `Thanks ${data.name}! We'll get back to you shortly at ${data.phone}.`;
    form.appendChild(success);
    form.reset();

    setTimeout(() => success.remove(), 6000);
  });
}

// Scroll Animations
function initScrollAnimations() {
  const elements = document.querySelectorAll(
    '.service-card, .pricing-card, .step, .gallery-grid__item, .features-list__item, .stat'
  );

  elements.forEach(el => el.classList.add('fade-in'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 80);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
}

// Stats Counter Animation
function initStatsCounter() {
  const stats = document.querySelectorAll('.stat__number');
  if (!stats.length) return;

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const duration = 2000;
    const start = performance.now();

    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  stats.forEach(stat => observer.observe(stat));
}
