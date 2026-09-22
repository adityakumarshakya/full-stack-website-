// Orinnovative - shared scripts
document.addEventListener('DOMContentLoaded', () => {
  // Header scroll
  const header = document.querySelector('.header');
  const onScroll = () => header && header.classList.toggle('scrolled', window.scrollY > 30);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Burger menu
  const burger = document.querySelector('.burger');
  const menu = document.querySelector('.menu');
  if (burger && menu) {
    burger.addEventListener('click', () => {
      menu.classList.toggle('open');
      burger.innerHTML = menu.classList.contains('open') ? '&times;' : '&#9776;';
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      menu.classList.remove('open'); burger.innerHTML = '&#9776;';
    }));
  }

  // Reveal on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => io.observe(el));

  // Stat counters
  const counters = document.querySelectorAll('[data-count]');
  const cio = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      let cur = 0;
      const step = Math.max(1, Math.ceil(target / 50));
      const t = setInterval(() => {
        cur += step;
        if (cur >= target) { cur = target; clearInterval(t); }
        el.textContent = cur + suffix;
      }, 30);
      cio.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach(c => cio.observe(c));

  // Active nav link
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.menu a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) a.classList.add('active');
  });

  // Contact form -> submits to the backend API (saved to MongoDB, viewable in the admin panel)
  const form = document.querySelector('#contact-form');
  if (form) form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type=submit]');
    const originalLabel = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending...';

    const payload = {
      name: form.name ? form.name.value.trim() : '',
      email: form.email ? form.email.value.trim() : '',
      phone: form.phone ? form.phone.value.trim() : '',
      service: form.service ? form.service.value : '',
      subject: form.subject ? form.subject.value.trim() : '',
      message: form.message ? form.message.value.trim() : '',
      sourcePage: window.location.pathname + window.location.search,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        btn.textContent = 'Message Sent ✓';
        form.reset();
      } else {
        btn.textContent = (data && data.message) || 'Something went wrong';
      }
    } catch (err) {
      btn.textContent = 'Network error — try again';
    } finally {
      setTimeout(() => { btn.textContent = originalLabel; btn.disabled = false; }, 2500);
    }
  });
});
