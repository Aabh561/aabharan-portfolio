(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // Year in footer
  $('#year').textContent = new Date().getFullYear();

  // Theme
  const body = document.body;
  const themeBtn = $('.theme-toggle');
  let savedTheme = localStorage.getItem('theme');
  if (!savedTheme) {
    savedTheme = 'dark';
    localStorage.setItem('theme', savedTheme);
  }
  if (savedTheme === 'dark') body.classList.add('theme-dark');
  if (themeBtn) {
    themeBtn.setAttribute('aria-pressed', String(body.classList.contains('theme-dark')));
    themeBtn.addEventListener('click', () => {
      const isDark = body.classList.toggle('theme-dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      themeBtn.setAttribute('aria-pressed', String(isDark));
    });
  }

  // Mobile nav toggle
  const navToggle = $('.nav-toggle');
  const navLinks = $('.nav-links');
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  $$('.nav-links a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

  // Animate skills on view
  const skillRows = $$('.skill');
  const skillIO = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        const row = e.target;
        row.classList.add('animate');
        const bar = $('.bar', row);
        const level = bar.getAttribute('data-level');
        // Fallback: set width inline
        bar.style.position = 'relative';
        const after = document.createElement('div');
        after.style.position = 'absolute';
        after.style.left = '0'; after.style.top = '0'; after.style.bottom = '0';
        after.style.width = level + '%';
        after.style.background = 'linear-gradient(90deg, var(--accent), var(--accent-strong))';
        after.style.borderRadius = '999px';
        after.style.transition = 'width 1.2s ease';
        if (!bar.firstElementChild) bar.appendChild(after);
        skillIO.unobserve(row);
      }
    }
  }, { threshold: 0.35 });
  skillRows.forEach(r => skillIO.observe(r));

  // Load and set hero photo from localStorage or allow user upload
  const heroImg = document.querySelector('.photo-wrap img');
  const savedPhoto = localStorage.getItem('heroPhotoData');
  if (savedPhoto && heroImg) {
    heroImg.src = savedPhoto;
  }
  const setPhotoBtn = document.getElementById('set-photo');
  const photoInput = document.getElementById('photo-input');
  if (setPhotoBtn && photoInput) {
    setPhotoBtn.addEventListener('click', () => photoInput.click());
    photoInput.addEventListener('change', () => {
      const file = photoInput.files && photoInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const data = reader.result;
        heroImg.src = data;
        try { localStorage.setItem('heroPhotoData', data); } catch {}
      };
      reader.readAsDataURL(file);
    });
  }

  // Section active link highlight + reveal animations
  const sections = $$('section[data-section]');
  const links = $$('.nav-links a');
  const sectionIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      const id = e.target.id;
      if (e.isIntersecting) {
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
        e.target.querySelectorAll('.reveal').forEach(el => el.classList.add('reveal-in'));
      }
    });
  }, { threshold: 0.5 });
  sections.forEach(s => sectionIO.observe(s));

  // Modals
  function openModal(modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    modal.setAttribute('aria-modal', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('aria-modal', 'false');
    document.body.style.overflow = '';
  }
  $$('[data-modal-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const sel = btn.getAttribute('data-modal-target');
      const modal = $(sel);
      if (modal) openModal(modal);
    });
  });
  $$('.modal').forEach(modal => {
    $('.modal-close', modal).addEventListener('click', () => closeModal(modal));
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(modal); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(modal);
    });
  });

  // Contact form (simple client-side only)
  const form = $('#contact-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = (fd.get('name')||'').toString().trim();
    const email = (fd.get('email')||'').toString().trim();
    const message = (fd.get('message')||'').toString().trim();
    const status = $('#form-status');
    if (!name || !email || !message) {
      status.textContent = 'Please fill in all fields.';
      status.style.color = '#e11d48';
      return;
    }
    const subject = encodeURIComponent('Portfolio Contact from ' + name);
    const body = encodeURIComponent(message + '\n\nFrom: ' + name + ' <' + email + '>');
    window.open('mailto:aabharan176005@gmail.com?subject=' + subject + '&body=' + body, '_blank');
    status.textContent = 'Thanks! Your mail client should open now.';
    status.style.color = 'var(--muted)';
    form.reset();
  });
})();
