/* ================================================
   CEWEB — MAIN JAVASCRIPT
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── NAVIGATION SCROLL STATE ── */
  const nav = document.querySelector('nav');
  const onScroll = () => {
    nav?.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── ACTIVE NAV LINK ── */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ── BURGER MENU ── */
  const burger = document.querySelector('.burger');
  const mobileMenu = document.querySelector('.mobile-menu');

  burger?.addEventListener('click', () => {
    const isOpen = burger.classList.toggle('open');
    mobileMenu?.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobileMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      burger?.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ── SCROLL REVEAL ── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ── ANIMATED COUNTERS ── */
  const counters = document.querySelectorAll('[data-counter]');

  const animateCounter = (el) => {
    const target   = parseInt(el.dataset.counter, 10);
    const suffix   = el.dataset.suffix || '';
    const duration = 1600;
    const start    = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(ease * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        entry.target.dataset.animated = 'true';
        animateCounter(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => counterObserver.observe(el));

  /* ── RIPPLE SUR LES BOUTONS ── */
  document.querySelectorAll('.btn, .nav-cta').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect   = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const size = Math.max(rect.width, rect.height) * 2;
      ripple.style.cssText = `
        width: ${size}px; height: ${size}px;
        left: ${e.clientX - rect.left - size / 2}px;
        top:  ${e.clientY - rect.top  - size / 2}px;
      `;
      this.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  /* ── TYPING EFFECT (hero subtitle) ── */
  const typingEl = document.querySelector('[data-typing]');
  if (typingEl) {
    const words = typingEl.dataset.typing.split('|');
    let wi = 0, ci = 0, deleting = false;

    const type = () => {
      const word = words[wi];
      if (!deleting) {
        typingEl.textContent = word.slice(0, ++ci);
        if (ci === word.length) {
          deleting = true;
          setTimeout(type, 2200);
          return;
        }
      } else {
        typingEl.textContent = word.slice(0, --ci);
        if (ci === 0) {
          deleting = false;
          wi = (wi + 1) % words.length;
        }
      }
      setTimeout(type, deleting ? 45 : 75);
    };
    type();
  }

  /* ── CONTACT FORM ── */
  const form = document.getElementById('contact-form');
  if (form) {
    const inputs = form.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.closest('.field')?.classList.contains('error')) {
          validateField(input);
        }
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      let valid = true;
      inputs.forEach(input => { if (!validateField(input)) valid = false; });
      if (!valid) return;

      const btn = form.querySelector('button[type="submit"]');
      btn.innerHTML = '<span>Envoi en cours…</span>';
      btn.disabled = true;

      const prenom = form.querySelector('[name="prenom"]')?.value || '';
      const email  = form.querySelector('[name="email"]')?.value  || '';
      const message = form.querySelector('[name="message"]')?.value || '';

      try {
        const res = await fetch('https://formspree.io/f/xgopbgzl', {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });
        if (!res.ok) throw new Error('Formspree error');

        if (typeof emailjs !== 'undefined') {
          await emailjs.send('Site internet', 'template_1ma04fj', {
            prenom, email, message,
            nom:       form.querySelector('[name="nom"]')?.value      || '',
            telephone: form.querySelector('[name="telephone"]')?.value || '',
            activite:  form.querySelector('[name="activite"]')?.value  || '',
            type_site: form.querySelector('[name="type_site"]')?.value || '',
            budget:    form.querySelector('[name="budget"]')?.value    || '',
          });
        }

        form.innerHTML = `
          <div class="form-success">
            <div class="success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 12l3 3 5-5"/>
              </svg>
            </div>
            <h3>Demande envoyée${prenom ? ', ' + prenom : ''} !</h3>
            <p>Je vous réponds avec votre devis sous 24 heures.<br>
            ${email ? 'Un email de confirmation a été envoyé à <strong>' + email + '</strong>.' : ''}</p>
          </div>
        `;
      } catch (err) {
        btn.innerHTML = 'Réessayer';
        btn.disabled = false;
        const errBox = document.createElement('p');
        errBox.style.cssText = 'color:#e05252;font-size:14px;margin-top:12px;text-align:center;';
        errBox.textContent = "L'envoi a échoué. Vérifiez votre connexion ou contactez-moi directement par email.";
        btn.parentElement.appendChild(errBox);
      }
    });
  }

  function validateField(input) {
    const field = input.closest('.field');
    if (!field) return true;
    const error = field.querySelector('.field-error');
    let msg = '';

    if (input.required && !input.value.trim()) {
      msg = 'Ce champ est requis.';
    } else if (input.type === 'email' && input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
      msg = 'Adresse email invalide.';
    } else if (input.type === 'tel' && input.value && !/^[\d\s\+\-\(\)]{7,}$/.test(input.value)) {
      msg = 'Numéro de téléphone invalide.';
    }

    if (msg) {
      field.classList.add('error');
      field.classList.remove('success');
      if (error) error.textContent = msg;
      return false;
    } else {
      field.classList.remove('error');
      if (input.value.trim()) field.classList.add('success');
      if (error) error.textContent = '';
      return true;
    }
  }

  /* ── SMOOTH ANCHOR SCROLL ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
      }
    });
  });

});
