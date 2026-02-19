/* ════════════════════════════════════════════════════════════
   SITHONG PORTFOLIO — MAIN.JS
   Ultra-futuristic animations, interactions, and 3D effects
   ════════════════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────────────────────
   1. PRELOADER — particle canvas + counting progress
────────────────────────────────────────────────────────── */
const Preloader = (() => {
  const el      = document.getElementById('preloader');
  const bar     = el.querySelector('.pre-bar');
  const pct     = el.querySelector('.pre-percent');
  const canvas  = document.getElementById('preCanvas');
  const ctx     = canvas.getContext('2d');
  let progress  = 0;
  let particles = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * canvas.width;
      this.y  = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r  = Math.random() * 1.5 + 0.3;
      this.a  = Math.random() * 0.4 + 0.05;
      this.c  = Math.random() > 0.5 ? '0,245,212' : '247,37,133';
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.c},${this.a})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 160; i++) particles.push(new Particle());

  let raf;
  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Connect nearby particles
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 80) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,245,212,${0.06 * (1 - d / 80)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    raf = requestAnimationFrame(loop);
  }
  loop();

  function run() {
    return new Promise(resolve => {
      const interval = setInterval(() => {
        progress += Math.random() * 8 + 2;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          bar.style.width = '100%';
          pct.textContent = '100';
          setTimeout(() => {
            cancelAnimationFrame(raf);
            el.classList.add('done');
            document.body.classList.remove('loading');
            setTimeout(resolve, 800);
          }, 400);
        }
        bar.style.width = progress + '%';
        pct.textContent = Math.floor(progress);
      }, 60);
    });
  }

  window.addEventListener('resize', resize);
  return { run };
})();


/* ──────────────────────────────────────────────────────────
   2. CUSTOM CURSOR — dot, ring, trailing, magnetic
────────────────────────────────────────────────────────── */
const Cursor = (() => {
  const cursor = document.getElementById('cursor');
  const dot    = cursor.querySelector('.cur-dot');
  const ring   = cursor.querySelector('.cur-ring');
  const trail  = cursor.querySelector('.cur-trail');
  const txt    = document.getElementById('cursor-text');

  let mx = 0, my = 0;
  let rx = 0, ry = 0;
  let tx = 0, ty = 0;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function tick() {
    // Dot snaps
    dot.style.transform = `translate(${mx - 4}px, ${my - 4}px)`;
    // Ring lags
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    ring.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`;
    // Trail lags more
    tx += (mx - tx) * 0.07;
    ty += (my - ty) * 0.07;
    trail.style.transform = `translate(${tx - 3}px, ${ty - 3}px)`;
    // Cursor text
    txt.style.left = mx + 'px';
    txt.style.top  = my + 'px';
    requestAnimationFrame(tick);
  }
  tick();

  // Hover states
  const hoverEls = document.querySelectorAll('a, button, .pj-card, .srv-card, .tech-card, .testi-btn, .stab, .wfbtn, .soc-icon, .tl-card, .award-item');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => { document.body.classList.add('cursor-hover'); });
    el.addEventListener('mouseleave', () => { document.body.classList.remove('cursor-hover'); });
  });

  // Magnetic elements
  document.querySelectorAll('.magnetic').forEach(el => {
    const strength = +el.dataset.strength || 25;
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const cx   = rect.left + rect.width / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = e.clientX - cx;
      const dy   = e.clientY - cy;
      el.style.transform = `translate(${dx * (strength / 100)}px, ${dy * (strength / 100)}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });

  // Cursor text on project cards
  document.querySelectorAll('.pj-card').forEach(c => {
    c.addEventListener('mouseenter', () => { txt.textContent = 'View'; txt.style.opacity = '1'; });
    c.addEventListener('mouseleave', () => { txt.style.opacity = '0'; });
  });

  return {};
})();


/* ──────────────────────────────────────────────────────────
   3. HERO PARTICLE CANVAS — animated neural network
────────────────────────────────────────────────────────── */
const HeroCanvas = (() => {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], mouse = { x: -999, y: -999 };

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class HeroParticle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : -10;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = Math.random() * 0.4 + 0.1;
      this.r  = Math.random() * 1.8 + 0.3;
      this.a  = Math.random() * 0.35 + 0.05;
    }
    update() {
      // Mouse repulsion
      const dx = this.x - mouse.x, dy = this.y - mouse.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 100) {
        this.vx += dx / d * 0.5;
        this.vy += dy / d * 0.5;
      }
      this.vx *= 0.98; this.vy *= 0.98;
      this.x += this.vx; this.y += this.vy;
      if (this.y > H + 10) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,245,212,${this.a})`;
      ctx.fill();
    }
  }

  function init() {
    resize();
    particles = [];
    for (let i = 0; i < 120; i++) particles.push(new HeroParticle());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 100) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,245,212,${0.08 * (1 - d / 100)})`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  const hero = document.getElementById('hero');
  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  hero.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

  window.addEventListener('resize', init);
  init();
  draw();
})();


/* ──────────────────────────────────────────────────────────
   4. TYPED TEXT — hero subtitle cycling
────────────────────────────────────────────────────────── */
const Typed = (() => {
  const el     = document.getElementById('heroTyped');
  if (!el) return;
  const phrases = [
    'Web Applications',
    'Digital Experiences',
    '3D Interactions',
    'Mobile Apps',
    'Design Systems',
    'The Future ✦'
  ];
  let idx = 0, ci = 0, deleting = false;

  function tick() {
    const phrase = phrases[idx];
    el.textContent = deleting ? phrase.slice(0, ci - 1) : phrase.slice(0, ci + 1);
    if (!deleting) { ci++; if (ci > phrase.length) { deleting = true; setTimeout(tick, 1600); return; } }
    else { ci--; if (ci < 0) { deleting = false; idx = (idx + 1) % phrases.length; setTimeout(tick, 300); return; } }
    setTimeout(tick, deleting ? 55 : 90);
  }
  setTimeout(tick, 1800);
})();


/* ──────────────────────────────────────────────────────────
   5. NAVIGATION — scrolled state, mobile menu, active link
────────────────────────────────────────────────────────── */
const Nav = (() => {
  const header  = document.getElementById('header');
  const burger  = document.getElementById('burger');
  const mob     = document.getElementById('mobileMenu');
  const progress= document.getElementById('scrollProgress');
  const links   = document.querySelectorAll('.nav-link[data-section]');

  // Scroll state
  window.addEventListener('scroll', () => {
    const st  = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('scrolled', st > 20);
    progress.style.width = (st / max * 100) + '%';

    // Back to top
    const btn = document.getElementById('backTop');
    btn.classList.toggle('show', st > 600);
  }, { passive: true });

  // Burger
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    mob.classList.toggle('open');
    document.body.style.overflow = mob.classList.contains('open') ? 'hidden' : '';
  });
  mob.querySelectorAll('.mob-link').forEach(a => {
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      mob.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Active link on scroll (IntersectionObserver)
  const sections = document.querySelectorAll('section[id], div[id]');
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(l => l.classList.toggle('active', l.dataset.section === id));
      }
    });
  }, { threshold: 0.3 });
  sections.forEach(s => io.observe(s));
})();


/* ──────────────────────────────────────────────────────────
   6. SCROLL REVEAL — IntersectionObserver
────────────────────────────────────────────────────────── */
const Reveal = (() => {
  const els = document.querySelectorAll('.reveal');
  const io  = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
          // Trigger skill bars
          entry.target.querySelectorAll('.sbar-fill').forEach(b => { b.style.width = b.dataset.w + '%'; });
          // Trigger tech bars
          entry.target.querySelectorAll('.tc-lvl').forEach(b => {
            b.style.setProperty('--w', b.dataset.w + '%');
            b.style.setProperty('width', b.dataset.w + '%');
          });
        }, parseFloat(delay) * 1000);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  els.forEach(el => io.observe(el));
})();


/* ──────────────────────────────────────────────────────────
   7. TECH BARS — inside tech-cards
────────────────────────────────────────────────────────── */
const TechBars = (() => {
  const cards = document.querySelectorAll('.tech-card');
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const lvl = entry.target.querySelector('.tc-lvl');
        if (lvl) {
          const w = lvl.dataset.w + '%';
          setTimeout(() => { lvl.style.setProperty('--w', w); }, 300);
        }
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.3 });
  cards.forEach(c => io.observe(c));

  // Set --w via CSS
  const style = document.createElement('style');
  style.textContent = `.tc-lvl::after { width: var(--w, 0%) !important; }`;
  document.head.appendChild(style);
})();


/* ──────────────────────────────────────────────────────────
   8. COUNT-UP ANIMATION — hero stats
────────────────────────────────────────────────────────── */
const CountUp = (() => {
  const els = document.querySelectorAll('.count-up');
  const io  = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = +entry.target.closest('[data-count]').dataset.count;
        let current  = 0;
        const step   = target / 60;
        const timer  = setInterval(() => {
          current += step;
          if (current >= target) { current = target; clearInterval(timer); }
          entry.target.textContent = Math.floor(current);
        }, 25);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  els.forEach(el => io.observe(el));
})();


/* ──────────────────────────────────────────────────────────
   9. 3D TILT — project cards & service cards
────────────────────────────────────────────────────────── */
const Tilt = (() => {
  const cards = document.querySelectorAll('.pj-card, .tl-card');
  cards.forEach(card => {
    let animId;
    card.addEventListener('mousemove', e => {
      cancelAnimationFrame(animId);
      animId = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x    = (e.clientX - rect.left) / rect.width  - 0.5;
        const y    = (e.clientY - rect.top)  / rect.height - 0.5;
        card.style.transform = `perspective(700px) rotateX(${-y * 7}deg) rotateY(${x * 7}deg) translateY(-6px) scale(1.015)`;
      });
    });
    card.addEventListener('mouseleave', () => {
      cancelAnimationFrame(animId);
      card.style.transform = '';
    });
  });
})();


/* ──────────────────────────────────────────────────────────
   10. SKILLS TABS
────────────────────────────────────────────────────────── */
const SkillsTabs = (() => {
  const tabs   = document.querySelectorAll('.stab');
  const panels = document.querySelectorAll('.skills-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById('tab-' + tab.dataset.tab);
      if (target) {
        target.classList.add('active');
        // Re-trigger animations
        target.querySelectorAll('.tc-lvl').forEach(lvl => {
          lvl.removeAttribute('style');
          requestAnimationFrame(() => {
            const w = lvl.dataset.w + '%';
            lvl.style.setProperty('--w', w);
          });
        });
        target.querySelectorAll('.reveal').forEach(r => {
          r.classList.remove('visible');
          requestAnimationFrame(() => {
            setTimeout(() => r.classList.add('visible'), 50);
          });
        });
      }
    });
  });
})();


/* ──────────────────────────────────────────────────────────
   11. WORK FILTER
────────────────────────────────────────────────────────── */
const WorkFilter = (() => {
  const btns    = document.querySelectorAll('.wfbtn');
  const cards   = document.querySelectorAll('.pj-card');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      cards.forEach(card => {
        const cat = card.dataset.cat || '';
        const show = filter === 'all' || cat.includes(filter);
        card.style.transition = 'opacity 0.3s, transform 0.3s';
        card.style.opacity = show ? '1' : '0.2';
        card.style.pointerEvents = show ? '' : 'none';
      });
    });
  });
})();


/* ──────────────────────────────────────────────────────────
   12. TESTIMONIALS SLIDER
────────────────────────────────────────────────────────── */
const Testimonials = (() => {
  const track  = document.getElementById('testiTrack');
  const dotsEl = document.getElementById('testiDots');
  const prev   = document.getElementById('testiPrev');
  const next   = document.getElementById('testiNext');
  if (!track) return;

  const slides = track.querySelectorAll('.testi-card');
  let   current = 0;
  let   autoTimer;

  // Create dots
  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });

  function goTo(n) {
    current = (n + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsEl.querySelectorAll('.testi-dot').forEach((d, i) => d.classList.toggle('active', i === current));
    resetAuto();
  }

  prev.addEventListener('click', () => goTo(current - 1));
  next.addEventListener('click', () => goTo(current + 1));

  // Touch / drag
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
  });

  function resetAuto() { clearInterval(autoTimer); autoTimer = setInterval(() => goTo(current + 1), 5000); }
  resetAuto();
})();


/* ──────────────────────────────────────────────────────────
   13. CONTACT FORM — validation + submit simulation
────────────────────────────────────────────────────────── */
const ContactForm = (() => {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const charTgt = document.getElementById('charCount');
  const msgArea = document.getElementById('message');

  if (!form) return;

  // Char counter
  msgArea.addEventListener('input', () => {
    const len = msgArea.value.length;
    charTgt.textContent = len;
    charTgt.style.color = len > 450 ? 'var(--accent2)' : '';
  });

  function setError(id, msg) {
    const el = document.getElementById('err-' + id);
    const inp = document.getElementById(id) || document.querySelector(`[name="${id}"]`);
    if (el) el.textContent = msg;
    if (inp) { msg ? inp.classList.add('error') : inp.classList.remove('error'); }
  }
  function clearErrors() {
    document.querySelectorAll('.form-err').forEach(e => e.textContent = '');
    document.querySelectorAll('.error').forEach(e => e.classList.remove('error'));
  }

  function validate() {
    clearErrors();
    let valid = true;
    const fname   = form.fname.value.trim();
    const lname   = form.lname.value.trim();
    const email   = form.email.value.trim();
    const message = form.message.value.trim();
    const terms   = form.terms.checked;

    if (!fname) { setError('fname', 'First name is required'); valid = false; }
    if (!lname) { setError('lname', 'Last name is required'); valid = false; }
    if (!email) { setError('email', 'Email is required'); valid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('email', 'Invalid email address'); valid = false; }
    if (!message) { setError('message', 'Please write a message'); valid = false; }
    if (!terms) { setError('terms', 'Please accept the terms'); valid = false; }
    return valid;
  }

  // Real-time validation
  ['fname', 'lname', 'email', 'message'].forEach(name => {
    const el = form[name];
    if (!el) return;
    el.addEventListener('blur', () => {
      if (!el.value.trim()) setError(name, name.charAt(0).toUpperCase() + name.slice(1) + ' is required');
      else setError(name, '');
    });
  });

  // Floating label effect
  form.querySelectorAll('input, textarea, select').forEach(el => {
    el.addEventListener('focus', () => { el.parentElement.classList.add('focused'); });
    el.addEventListener('blur',  () => { el.parentElement.classList.toggle('filled', el.value.trim() !== ''); el.parentElement.classList.remove('focused'); });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validate()) return;

    const btn = form.querySelector('.form-submit');
    btn.classList.add('loading');
    btn.disabled = true;

    // Simulate async submit
    await new Promise(r => setTimeout(r, 1800));

    btn.classList.remove('loading');
    btn.style.display = 'none';
    form.querySelectorAll('.form-group, .form-row, .form-footer').forEach(g => {
      g.style.opacity = '0.3';
      g.style.pointerEvents = 'none';
    });
    success.classList.add('show');
  });
})();


/* ──────────────────────────────────────────────────────────
   14. THEME TOGGLE — dark / light mode
────────────────────────────────────────────────────────── */
const ThemeToggle = (() => {
  const btn   = document.getElementById('themeToggle');
  const html  = document.documentElement;
  const saved = localStorage.getItem('sithong-theme') || 'dark';
  html.dataset.theme = saved;

  btn.addEventListener('click', () => {
    const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
    html.dataset.theme = next;
    localStorage.setItem('sithong-theme', next);
  });
})();


/* ──────────────────────────────────────────────────────────
   15. PARALLAX — hero orbs and floating elements
────────────────────────────────────────────────────────── */
const Parallax = (() => {
  const orbs   = document.querySelectorAll('.hero-orb');
  const floats = document.querySelectorAll('.float-badge');

  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    orbs.forEach((orb, i) => {
      const speed = [0.15, -0.12, 0.08][i] || 0.1;
      orb.style.transform = `translateY(${sy * speed}px)`;
    });
    floats.forEach((f, i) => {
      const speed = [0.06, -0.08, 0.04, -0.05, 0.07][i] || 0.05;
      f.style.transform = `translateY(${sy * speed}px)`;
    });
  }, { passive: true });
})();


/* ──────────────────────────────────────────────────────────
   16. ABOUT CARD 3D — mouse interaction
────────────────────────────────────────────────────────── */
const About3D = (() => {
  const scene  = document.querySelector('.about-3d-scene');
  const front  = document.querySelector('.a3d-front');
  if (!scene || !front) return;

  scene.addEventListener('mousemove', e => {
    const rect = scene.getBoundingClientRect();
    const x    = (e.clientX - rect.left) / rect.width  - 0.5;
    const y    = (e.clientY - rect.top)  / rect.height - 0.5;
    front.style.transform = `rotateX(${-y * 15}deg) rotateY(${x * 15}deg) translateY(-10px)`;
    front.style.transition = 'none';
  });
  scene.addEventListener('mouseleave', () => {
    front.style.transition = '';
    front.style.transform  = '';
  });
})();


/* ──────────────────────────────────────────────────────────
   17. SMOOTH SCROLL — anchor links with offset
────────────────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = document.getElementById('header').offsetHeight + 20;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
  });
});


/* ──────────────────────────────────────────────────────────
   18. BACK TO TOP
────────────────────────────────────────────────────────── */
document.getElementById('backTop').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* ──────────────────────────────────────────────────────────
   19. MEGA MENU — close on outside click
────────────────────────────────────────────────────────── */
document.addEventListener('click', e => {
  if (!e.target.closest('.has-dropdown')) {
    document.querySelectorAll('.mega-menu').forEach(m => { m.style.opacity = ''; });
  }
});


/* ──────────────────────────────────────────────────────────
   20. PAGE GLITCH on title hover — CSS-driven
────────────────────────────────────────────────────────── */
const GlitchText = (() => {
  const titles = document.querySelectorAll('.hero-title .ht-line');
  titles.forEach(t => {
    t.addEventListener('mouseenter', () => {
      t.style.animation = 'none';
      setTimeout(() => { t.style.animation = ''; }, 600);
    });
  });
})();


/* ──────────────────────────────────────────────────────────
   21. FOOTER PARALLAX BIG TEXT
────────────────────────────────────────────────────────── */
const FooterText = (() => {
  const big = document.querySelector('.footer-big-text');
  if (!big) return;
  const io  = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        big.style.transition = 'transform 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 1.5s';
        big.style.transform  = 'translateX(-50%) translateY(0)';
        big.style.opacity    = '1';
      }
    });
  }, { threshold: 0.2 });
  big.style.transform = 'translateX(-50%) translateY(30px)';
  big.style.opacity   = '0';
  io.observe(big);
})();


/* ──────────────────────────────────────────────────────────
   22. INIT SEQUENCE
────────────────────────────────────────────────────────── */
(async () => {
  await Preloader.run();

  // Staggered section reveals
  document.querySelectorAll('.ht-line').forEach(el => {
    el.style.animationPlayState = 'running';
  });

  // Trigger any above-fold reveals
  setTimeout(() => {
    document.querySelectorAll('.reveal').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        el.classList.add('visible');
        el.querySelectorAll('.sbar-fill').forEach(b => { b.style.width = b.dataset.w + '%'; });
      }
    });
  }, 200);
})();
