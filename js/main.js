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

  const phoneInput = form.querySelector('[name="phone"]');
  const emailInput = form.querySelector('[name="email"]');

  const clearContactValidity = () => {
    phoneInput.setCustomValidity('');
    emailInput.setCustomValidity('');
  };
  phoneInput.addEventListener('input', clearContactValidity);
  emailInput.addEventListener('input', clearContactValidity);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const phone = phoneInput.value.trim();
    const email = emailInput.value.trim();
    if (!phone && !email) {
      const message = 'Enter a phone number or an email address.';
      phoneInput.setCustomValidity(message);
      emailInput.setCustomValidity(message);
      form.reportValidity();
      return;
    }
    clearContactValidity();

    const button = form.querySelector('.quote-form__submit');
    const data = Object.fromEntries(new FormData(form));
    const originalLabel = button.textContent;
    button.disabled = true;
    button.textContent = 'Sending...';
    clearFormNotice(form);

    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        showRequestError(form, result.error);
        return;
      }
      burstGlitter(button);
      showRequestSent(form, data);
      form.reset();
    } catch {
      showRequestError(form);
    } finally {
      button.disabled = false;
      button.textContent = originalLabel;
    }
  });
}

function clearFormNotice(form) {
  const existing = form.querySelector('.form-success, .form-error');
  if (existing) existing.remove();
}

function burstGlitter(anchor) {
  if (!anchor || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const rect = anchor.getBoundingClientRect();
  const layer = document.createElement('div');
  layer.className = 'glitter-burst';
  layer.style.left = `${rect.left + rect.width / 2}px`;
  layer.style.top = `${rect.top + rect.height / 2}px`;

  const colors = ['#F5D060', '#FFFFFF', '#E7B526', '#FFF4C2'];
  for (let i = 0; i < 26; i++) {
    const spark = document.createElement('span');
    const angle = (Math.PI * 2 * i) / 26 + Math.random() * 0.35;
    const distance = 46 + Math.random() * 78;
    spark.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
    spark.style.setProperty('--y', `${Math.sin(angle) * distance}px`);
    spark.style.background = colors[i % colors.length];
    spark.style.color = colors[i % colors.length];
    spark.style.animationDelay = `${Math.random() * 70}ms`;
    if (i % 3 === 0) spark.classList.add('is-diamond');
    layer.appendChild(spark);
  }

  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 1000);
}

function showRequestError(form, message) {
  clearFormNotice(form);
  const panel = document.createElement('div');
  panel.className = 'form-error';
  panel.setAttribute('role', 'alert');
  panel.textContent = message || 'We could not send your request. Please call 0402 807 082 or try again.';
  form.appendChild(panel);
}

function showRequestSent(form, data) {
  clearFormNotice(form);

  const name = (data.name || '').trim();
  const phone = (data.phone || '').trim();
  const email = (data.email || '').trim();
  const service = (data.service || '').trim();
  const problem = (data.problem || '').trim();

  const panel = document.createElement('div');
  panel.className = 'form-success';
  panel.setAttribute('role', 'status');
  panel.setAttribute('aria-live', 'polite');

  const badge = document.createElement('div');
  badge.className = 'form-success__badge';
  badge.setAttribute('aria-hidden', 'true');
  badge.textContent = '✓';

  const copy = document.createElement('div');
  copy.className = 'form-success__copy';

  const title = document.createElement('p');
  title.className = 'form-success__title';
  title.textContent = 'Request sent';

  const message = document.createElement('p');
  message.className = 'form-success__message';
  const followUp = phone
    ? `We have your request and will call ${phone} shortly.`
    : `We have your request and will email ${email} shortly.`;
  message.textContent = name ? `Thanks ${name}. ${followUp}` : followUp;

  copy.append(title, message);

  if (service || problem) {
    const detail = document.createElement('p');
    detail.className = 'form-success__detail';
    const bits = [];
    if (service) bits.push(`Service: ${service}`);
    if (problem) bits.push(`Problem: ${problem}`);
    detail.textContent = bits.join(' · ');
    copy.appendChild(detail);
  }

  panel.append(badge, copy);
  form.appendChild(panel);

  setTimeout(() => {
    if (panel.isConnected) panel.remove();
  }, 12000);
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
