/**
 * Silver Singles UK — main.js
 * Progressive enhancement: nav, scroll effects, form, reveal animations
 */

(function () {
  'use strict';

  /* ============================================================
     1. STICKY HEADER — shadow on scroll
     ============================================================ */
  const header = document.getElementById('site-header');

  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 12);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load
  }


  /* ============================================================
     2. MOBILE NAVIGATION
     ============================================================ */
  const navToggle  = document.getElementById('nav-toggle');
  const mainNav    = document.getElementById('main-nav');

  // Create overlay element once
  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  document.body.appendChild(overlay);

  function openNav() {
    mainNav.classList.add('is-open');
    navToggle.classList.add('is-active');
    navToggle.setAttribute('aria-expanded', 'true');
    overlay.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    mainNav.classList.remove('is-open');
    navToggle.classList.remove('is-active');
    navToggle.setAttribute('aria-expanded', 'false');
    overlay.classList.remove('is-visible');
    document.body.style.overflow = '';
  }

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      mainNav.classList.contains('is-open') ? closeNav() : openNav();
    });

    overlay.addEventListener('click', closeNav);

    // Close on nav link click (single-page scroll)
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (mainNav.classList.contains('is-open')) closeNav();
      });
    });

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && mainNav.classList.contains('is-open')) closeNav();
    });
  }


  /* ============================================================
     3. SCROLL REVEAL
     ============================================================ */
  function initReveal() {
    const items = document.querySelectorAll(
      '.step-card, .story-card, .blog-card, .feature-stat-card, ' +
      '.feature-testimonial-card, .feature-list li'
    );

    items.forEach((el, i) => {
      el.classList.add('reveal');
      // Stagger siblings within the same parent
      const siblings = Array.from(el.parentElement.children).filter(
        c => c.classList.contains('reveal')
      );
      const idx = siblings.indexOf(el);
      if (idx === 1) el.classList.add('reveal-delay-1');
      if (idx === 2) el.classList.add('reveal-delay-2');
      if (idx === 3) el.classList.add('reveal-delay-3');
    });

    if (!('IntersectionObserver' in window)) {
      // Fallback: show everything immediately
      items.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    items.forEach(el => observer.observe(el));
  }

  initReveal();


  /* ============================================================
     4. SMOOTH ANCHOR SCROLL (accounts for sticky header height)
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();

      const headerH = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  /* ============================================================
     5. JOIN FORM — basic client-side validation & submit handler
     ============================================================ */
  const joinForm   = document.getElementById('join-form');
  const joinSubmit = document.getElementById('join-submit');

  if (joinForm) {
    joinForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const name   = joinForm.querySelector('#join-name').value.trim();
      const email  = joinForm.querySelector('#join-email').value.trim();
      const age    = parseInt(joinForm.querySelector('#join-age').value, 10);
      const gender = joinForm.querySelector('#join-gender').value;

      // Clear previous errors
      clearErrors();

      let hasError = false;

      if (!name) {
        showError('join-name', 'Please enter your first name.');
        hasError = true;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('join-email', 'Please enter a valid email address.');
        hasError = true;
      }
      if (!age || age < 50 || age > 99) {
        showError('join-age', 'You must be 50 or over to join.');
        hasError = true;
      }
      if (!gender) {
        showError('join-gender', 'Please select an option.');
        hasError = true;
      }

      if (hasError) return;

      // Simulate submission
      joinSubmit.textContent = 'Creating your profile…';
      joinSubmit.disabled = true;

      setTimeout(() => {
        joinForm.innerHTML = `
          <div class="form-success" role="alert">
            <div class="form-success-icon">✦</div>
            <h3>Welcome, ${escapeHtml(name)}!</h3>
            <p>We've sent a confirmation link to <strong>${escapeHtml(email)}</strong>. 
               Check your inbox to activate your free account.</p>
          </div>
        `;
        injectSuccessStyles();
      }, 1200);
    });
  }

  function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.style.borderColor = '#c97070';
    field.setAttribute('aria-describedby', fieldId + '-error');

    const err = document.createElement('span');
    err.className = 'field-error';
    err.id = fieldId + '-error';
    err.setAttribute('role', 'alert');
    err.textContent = message;
    err.style.cssText = 'display:block;font-family:var(--font-ui);font-size:0.82rem;color:#c97070;margin-top:4px;';

    field.parentElement.appendChild(err);
  }

  function clearErrors() {
    joinForm.querySelectorAll('.field-error').forEach(el => el.remove());
    joinForm.querySelectorAll('input, select').forEach(el => {
      el.style.borderColor = '';
      el.removeAttribute('aria-describedby');
    });
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function injectSuccessStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .form-success {
        text-align: center;
        padding: 2rem 1rem;
      }
      .form-success-icon {
        font-size: 2.5rem;
        color: var(--warm-400);
        margin-bottom: 1rem;
        animation: pulse 2s ease infinite;
      }
      .form-success h3 {
        font-family: var(--font-display);
        font-size: 1.6rem;
        margin-bottom: 0.75rem;
        color: var(--ink-900);
      }
      .form-success p {
        color: var(--ink-500);
        font-size: 1rem;
        line-height: 1.6;
      }
    `;
    document.head.appendChild(style);
  }


  /* ============================================================
     6. ACTIVE NAV LINK highlighting via IntersectionObserver
     ============================================================ */
  const sections    = document.querySelectorAll('section[id]');
  const navLinks    = document.querySelectorAll('.main-nav ul a[href^="#"]');

  if (sections.length && navLinks.length) {
    const sectionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(link => {
              link.classList.toggle(
                'is-active',
                link.getAttribute('href') === '#' + id
              );
            });
          }
        });
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );

    sections.forEach(s => sectionObserver.observe(s));

    // Inject active style once
    const activeStyle = document.createElement('style');
    activeStyle.textContent = `.main-nav ul a.is-active { color: var(--warm-500); font-weight: 600; }`;
    document.head.appendChild(activeStyle);
  }

})();
