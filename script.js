/* ================================================
   APEX CONSULTING — MAIN JAVASCRIPT
   Scroll animations, counters, menu, form
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── BARRE DE PROGRESSION AU SCROLL ── */
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress-bar';
  document.body.prepend(progressBar);
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (scrolled / total * 100) + '%';
  }, { passive: true });

  /* ── CURSOR GLOW (desktop) ── */
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  });

  /* ── RIPPLE SUR LES BOUTONS ── */
  document.querySelectorAll('.btn, .nav-cta').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
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

  /* ── ÉTINCELLES AU CLIC ── */
  const sparkColors = ['#7F77DD', '#a89ef5', '#c4b9ff', '#5b54b8', '#ffffff'];
  document.addEventListener('click', e => {
    // Ne pas créer de sparks sur les inputs/textareas
    if (['INPUT','TEXTAREA','SELECT','BUTTON'].includes(e.target.tagName)) return;
    for (let i = 0; i < 8; i++) {
      const spark = document.createElement('span');
      spark.className = 'click-spark';
      const angle  = (i / 8) * 2 * Math.PI + Math.random() * 0.5;
      const dist   = 40 + Math.random() * 40;
      const size   = 4 + Math.random() * 4;
      spark.style.cssText = `
        left: ${e.clientX}px; top: ${e.clientY}px;
        width: ${size}px; height: ${size}px;
        background: ${sparkColors[Math.floor(Math.random() * sparkColors.length)]};
        --tx: ${Math.cos(angle) * dist}px;
        --ty: ${Math.sin(angle) * dist}px;
        animation-duration: ${0.4 + Math.random() * 0.3}s;
      `;
      document.body.appendChild(spark);
      spark.addEventListener('animationend', () => spark.remove());
    }
  });

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

  /* ── INTERSECTION OBSERVER — SCROLL REVEAL ── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target); // animate once
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ── ANIMATED COUNTERS ── */
  const counters = document.querySelectorAll('[data-counter]');

  const animateCounter = (el) => {
    const target  = parseInt(el.dataset.counter, 10);
    const suffix  = el.dataset.suffix || '';
    const prefix  = el.dataset.prefix || '';
    const duration = 1800;
    const start = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(ease * target);
      el.textContent = prefix + value + suffix;
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

  /* ── CONTACT FORM VALIDATION ── */
  const form = document.getElementById('contact-form');
  if (form) {
    const inputs = form.querySelectorAll('input, textarea, select');

    // Live validation
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

      // Paramètres envoyés au template EmailJS
      const templateParams = {
        prenom:    form.querySelector('[name="prenom"]')?.value   || '',
        email:     form.querySelector('[name="email"]')?.value    || '',
        message:   form.querySelector('[name="message"]')?.value  || '',
        nom:       form.querySelector('[name="nom"]')?.value      || '',
        telephone: form.querySelector('[name="telephone"]')?.value || '',
        activite:  form.querySelector('[name="activite"]')?.value  || '',
        type_site: form.querySelector('[name="type_site"]')?.value || '',
        budget:    form.querySelector('[name="budget"]')?.value    || '',
      };

      try {
        await emailjs.send('Site internet', 'template_1ma04fj', templateParams);

        // Succès — message visible sur la page
        form.innerHTML = `
          <div class="form-success">
            <div class="success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 12l3 3 5-5"/>
              </svg>
            </div>
            <h3>Demande envoyée, ${templateParams.prenom} !</h3>
            <p>Un email de confirmation vient de vous être envoyé à <strong>${templateParams.email}</strong>.<br>Je vous réponds avec votre devis sous 24 heures.</p>
          </div>
        `;
      } catch (err) {
        // Erreur — bouton réactivé + message d'erreur
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
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ── PARALLAX HERO SUBTLE ── */
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        heroContent.style.transform = `translateY(${y * 0.18}px)`;
        heroContent.style.opacity = 1 - (y / window.innerHeight) * 1.4;
      }
    }, { passive: true });
  }

  /* ── TILT CARDS (subtle 3D effect) ── */
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
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
          setTimeout(type, 2000);
          return;
        }
      } else {
        typingEl.textContent = word.slice(0, --ci);
        if (ci === 0) {
          deleting = false;
          wi = (wi + 1) % words.length;
        }
      }
      setTimeout(type, deleting ? 48 : 78);
    };
    type();
  }

});
