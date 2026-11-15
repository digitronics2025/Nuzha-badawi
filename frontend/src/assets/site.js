/* Lightweight progressive enhancements. No dependency or backend assumptions. */
const root = document.documentElement;
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
if (menuButton && mobileMenu) {
  const close = () => {
    mobileMenu.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', menuButton.dataset.openLabel || 'Open navigation');
  };
  menuButton.dataset.openLabel = menuButton.getAttribute('aria-label');
  menuButton.addEventListener('click', () => {
    const opening = !mobileMenu.classList.contains('is-open');
    mobileMenu.classList.toggle('is-open', opening);
    menuButton.setAttribute('aria-expanded', String(opening));
    if (opening) mobileMenu.querySelector('a')?.focus();
    else menuButton.focus();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
      close(); menuButton.focus();
    }
  });
  document.addEventListener('click', event => {
    if (mobileMenu.classList.contains('is-open') && !mobileMenu.contains(event.target) && !menuButton.contains(event.target)) close();
  });
  mobileMenu.addEventListener('click', event => { if (event.target.closest('a')) close(); });
}

const header = document.querySelector('.site-header');
if (header) {
  let last = false;
  window.addEventListener('scroll', () => {
    const next = window.scrollY > 15;
    if (last !== next) { header.classList.toggle('is-scrolled', next); last = next; }
  }, { passive: true });
}

// Motion is decorative. Existing content is always readable without JS or an observer.
if (!reduced() && 'IntersectionObserver' in window) {
  root.classList.add('motion-on');
  const entries = [...document.querySelectorAll('[data-reveal]')];
  const observer = new IntersectionObserver((changes, obs) => {
    for (const entry of changes) {
      if (entry.isIntersecting) {
        entry.target.classList.remove('reveal-ready');
        entry.target.classList.add('reveal-visible');
        obs.unobserve(entry.target);
      }
    }
  }, { threshold: 0.05, rootMargin: '0px 0px -14px 0px' });
  for (const el of entries) {
    if (el.getBoundingClientRect().top > innerHeight - 25) el.classList.add('reveal-ready');
    observer.observe(el);
  }
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change', event => {
    if (event.matches) { root.classList.remove('motion-on'); observer.disconnect(); }
  });
}

// Vimeo privacy: do not request player code until an explicit click.
for (const poster of document.querySelectorAll('[data-video]')) {
  const play = poster.querySelector('.video-play');
  if (!play) continue;
  play.addEventListener('click', () => {
    const raw = poster.getAttribute('data-vimeo') || '';
    let url;
    try {
      url = new URL(raw);
      if (url.protocol !== 'https:' || url.hostname !== 'player.vimeo.com' || !/^\/video\/\d+$/.test(url.pathname) || !/^[a-zA-Z0-9]+$/.test(url.searchParams.get('h') || '')) throw new Error('Invalid video source');
    } catch {
      const error = document.createElement('p'); error.textContent = 'Video could not be loaded.';
      poster.append(error); return;
    }
    url.searchParams.set('autoplay', '0');
    const iframe = document.createElement('iframe');
    iframe.src = url.toString(); iframe.title = poster.dataset.videoTitle || 'Introduction video';
    iframe.allow = 'fullscreen; picture-in-picture; encrypted-media; web-share';
    iframe.allowFullscreen = true; iframe.loading = 'lazy'; iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    poster.classList.add('is-playing');
    poster.append(iframe);
  }, { once: true });
}

// Service-aware enquiry form. Backend owns validation, spam controls and durable acceptance.
const form = document.querySelector('#enquiry-form');
if (form) {
  const typeChoices = [...form.querySelectorAll('input[name="type"]')];
  const panels = [...form.querySelectorAll('.form-detail')];
  const feedback = form.querySelector('#enquiry-feedback');
  const submit = form.querySelector('[type="submit"]');
  function selectedType() { return typeChoices.find(x => x.checked)?.value || 'lesson'; }
  function updatePanels() {
    const selected = selectedType();
    for (const panel of panels) {
      const active = panel.dataset.for === selected;
      panel.hidden = !active;
      for (const field of panel.querySelectorAll('input, select, textarea')) field.disabled = !active;
    }
    feedback.hidden = true;
  }
  for (const choice of typeChoices) choice.addEventListener('change', updatePanels);
  const params = new URLSearchParams(location.search);
  const kind = params.get('service');
  if (kind) { const wanted = typeChoices.find(choice => choice.value === kind); if (wanted) wanted.checked = true; }
  updatePanels();
  const activeField = name => form.querySelector(`.form-detail:not([hidden]) [name="${name}"]`)?.value || '';
  function show(text,success=false) { feedback.textContent=text; feedback.classList.toggle('success',success); feedback.hidden=false; feedback.scrollIntoView({block:'nearest',behavior:reduced()?'instant':'smooth'}); }
  form.addEventListener('submit',async event => {
    event.preventDefault(); feedback.hidden=true;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const type=selectedType();
    if ((type==='translation'||type==='interpretation') && activeField('sourceLanguage') && activeField('sourceLanguage')===activeField('targetLanguage')) { show(form.dataset.same || 'Source and target must differ.'); return; }
    const request = {
      idempotencyKey: crypto.randomUUID?.() || String(Date.now())+'-'+Math.random().toString(36).slice(2),
      locale: form.dataset.locale || 'en', type,
      name: form.elements.namedItem('name')?.value?.trim() || '',
      email: form.elements.namedItem('email')?.value?.trim() || '',
      message: form.elements.namedItem('message')?.value?.trim() || '',
      details: Object.fromEntries(['language','goal','sourceLanguage','targetLanguage','dueDate','eventDate','format'].map(key=>[key,activeField(key)]).filter(([,value])=>value)),
      privacyAcknowledged: form.elements.namedItem('privacyAcknowledged')?.checked || false
    };
    submit.disabled=true;
    try {
      const response = await fetch('/api/v1/enquiries', {method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(request),credentials:'same-origin',signal:AbortSignal.timeout(10000)});
      const json = response.headers.get('content-type')?.includes('application/json') ? await response.json() : null;
      if (response.status===201 && json?.ok===true && json.reference) {
        show(`${form.dataset.success || 'Received:'} ${json.reference}`,true);
        form.reset(); updatePanels(); feedback.hidden=false;
      } else show(json?.message || form.dataset.error || 'The contact system is not available yet.');
    } catch {
      show(form.dataset.error || 'The contact system is not available yet.');
    } finally { submit.disabled=false; }
  });
}
