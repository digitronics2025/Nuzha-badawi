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
    const fallback=poster.querySelector('.video-fallback');if(fallback){fallback.style.display='block';fallback.style.zIndex='4';fallback.style.background='#38251e';}
    poster.append(iframe);
  }, { once: true });
}

async function setupContactSecurity(form) {
  const target=document.getElementById('nusya-turnstile');
  if(!target)return;
  try {
    const response=await fetch('/api/v1/config',{headers:{accept:'application/json'},credentials:'same-origin',signal:AbortSignal.timeout(5000)});
    if(!response.ok)throw Error('not ready');
    const config=await response.json();
    if(!config.ready||!config.turnstileSiteKey)throw Error('not ready');
    const permittedPairs=new Set(config.approvedTranslationPairs||[]);
    for(const kind of ['translation','interpretation']){
      const source=form.querySelector(`.form-detail[data-for="${kind}"] [name="sourceLanguage"]`);
      const targetLanguage=form.querySelector(`.form-detail[data-for="${kind}"] [name="targetLanguage"]`);
      if(!source||!targetLanguage)continue;
      for(const option of source.options)if(option.value)option.disabled=![...permittedPairs].some(pair=>pair.startsWith(option.value+':'));
      const updateTarget=()=>{for(const option of targetLanguage.options)if(option.value)option.disabled=!permittedPairs.has(source.value+':'+option.value);if(targetLanguage.selectedOptions[0]?.disabled)targetLanguage.value='';};
      source.addEventListener('change',updateTarget);updateTarget();
    }
    // Reflect owner-controlled availability: services not accepting enquiries cannot be chosen.
    const services=config.services||{},accepting=id=>services[id]?.visible!==false&&services[id]?.acceptingRequests===true;
    const lessonLangs=['english','russian','arabic'];
    const typeOpen={lesson:lessonLangs.some(accepting),coaching:accepting('coaching'),translation:accepting('translation')&&permittedPairs.size>0,interpretation:accepting('interpretation')&&permittedPairs.size>0};
    for(const choice of form.querySelectorAll('input[name="type"]')){const open=typeOpen[choice.value]!==false;choice.disabled=!open;choice.closest('label')?.classList.toggle('is-unavailable',!open);if(!open&&choice.checked)choice.checked=false;}
    if(!form.querySelector('input[name="type"]:checked')){const first=form.querySelector('input[name="type"]:not(:disabled)');if(first){first.checked=true;first.dispatchEvent(new Event('change'));}}
    const lessonSelect=form.querySelector('.form-detail[data-for="lesson"] [name="language"]');
    if(lessonSelect){for(const option of lessonSelect.options)if(option.value)option.disabled=!accepting(option.value);if(lessonSelect.selectedOptions[0]?.disabled)lessonSelect.value='';}
    target.className='cf-turnstile';
    target.dataset.sitekey=config.turnstileSiteKey;
    target.dataset.action='nusya_enquiry';
    const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js';script.async=true;script.defer=true;
    document.head.append(script);
    form.dataset.backendReady='true';
  }catch { form.dataset.backendReady='false'; }
}
const form = document.querySelector('#enquiry-form');
if (form) {
  setupContactSecurity(form);
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
  const requestedLanguage=params.get('language');if(requestedLanguage){const select=form.querySelector('[name=language]');if(select&&[...select.options].some(o=>o.value===requestedLanguage))select.value=requestedLanguage;}
  if (kind) { const wanted = typeChoices.find(choice => choice.value === kind); if (wanted) wanted.checked = true; }
  updatePanels();
  const activeField = name => form.querySelector(`.form-detail:not([hidden]) [name="${name}"]`)?.value || '';
  function show(text,success=false) { feedback.textContent=text; feedback.classList.toggle('success',success); feedback.hidden=false; feedback.scrollIntoView({block:'nearest',behavior:reduced()?'instant':'smooth'}); }
  const retryFields=new Map();function lockRetry(lock){for(const el of form.querySelectorAll('input:not([name=cf-turnstile-response]),select,textarea')){if(lock){if(!retryFields.has(el))retryFields.set(el,el.disabled);el.disabled=true;}else if(retryFields.has(el)){el.disabled=retryFields.get(el);}}if(!lock)retryFields.clear();}
  const newRequest=document.createElement('button');newRequest.type='button';newRequest.className='btn btn-outline';newRequest.hidden=true;newRequest.textContent=({uk:'Почати новий запит',en:'Start a new request',ar:'بدء طلب جديد',ru:'Начать новый запрос'})[form.dataset.locale];newRequest.addEventListener('click',()=>{lockRetry(false);form._pendingRequest=null;delete form.dataset.idempotencyKey;newRequest.hidden=true;feedback.hidden=true;});submit.after(newRequest);
  form.addEventListener('submit',async event => {
    event.preventDefault(); feedback.hidden=true;for(const e of form.querySelectorAll('.field-error'))e.remove();for(const e of form.querySelectorAll('[aria-invalid]')){e.removeAttribute('aria-invalid');e.removeAttribute('aria-describedby');}
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if(form.dataset.backendReady!=='true') { show(form.dataset.error || 'The contact system is not configured yet.'); return; }
    const token=form.querySelector('[name="cf-turnstile-response"]')?.value;
    if(!token) { show(({uk:'Пройдіть перевірку безпеки перед надсиланням.',en:'Complete the security challenge before submitting.', ar:'أكمل التحقق الأمني قبل الإرسال.', ru:'Пройдите проверку безопасности перед отправкой.'})[form.dataset.locale] || form.dataset.error); return; }
    const type=selectedType();
    if ((type==='translation'||type==='interpretation') && activeField('sourceLanguage') && activeField('sourceLanguage')===activeField('targetLanguage')) { show(form.dataset.same || 'Source and target must differ.'); return; }
    let request = {
      idempotencyKey: form.dataset.idempotencyKey || (form.dataset.idempotencyKey = (crypto.randomUUID?.() || String(Date.now())+'-'+Math.random().toString(36).slice(2))),
      locale: form.dataset.locale || 'uk', type,
      name: form.elements.namedItem('name')?.value?.trim() || '',
      email: form.elements.namedItem('email')?.value?.trim() || '',
      message: form.elements.namedItem('message')?.value?.trim() || '',
      details: Object.fromEntries(['language','goal','sourceLanguage','targetLanguage','dueDate','eventDate','format'].map(key=>[key,activeField(key)]).filter(([,value])=>value)),
      privacyAcknowledged: form.elements.namedItem('privacyAcknowledged')?.checked || false, turnstileToken:token
    };
    request=form._pendingRequest?{...form._pendingRequest,turnstileToken:token}:request;form._pendingRequest={...request};
    submit.disabled=true;
    try {
      const response = await fetch('/api/v1/enquiries', {method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(request),credentials:'same-origin',signal:AbortSignal.timeout(10000)});
      const json = response.headers.get('content-type')?.includes('application/json') ? await response.json() : null;
      if (response.status===201 && json?.ok===true && json.reference) {
        show(`${form.dataset.success || 'Received:'} ${json.reference}`,true);
        lockRetry(false);form.reset();form._pendingRequest=null;newRequest.hidden=true; delete form.dataset.idempotencyKey; updatePanels(); feedback.hidden=false; window.turnstile?.reset?.();
      } else { if(response.status<500){lockRetry(false);form._pendingRequest=null;delete form.dataset.idempotencyKey;}else lockRetry(true);newRequest.hidden=false;for(const key of Object.keys(json?.fieldErrors||{})){const field=form.querySelector(`[name="${CSS.escape(key)}"]:not(:disabled)`);if(!field)continue;const error=document.createElement('span');error.className='field-error';error.id='error-'+key;error.textContent=({uk:'Перевірте це поле.',en:'Please check this field.',ar:'يرجى التحقق من هذا الحقل.',ru:'Проверьте это поле.'})[form.dataset.locale];field.setAttribute('aria-invalid','true');field.setAttribute('aria-describedby',error.id);field.after(error);}show(json?.message || form.dataset.error || 'The contact system is not available yet.'); window.turnstile?.reset?.(); }
    } catch {
      lockRetry(true);newRequest.hidden=false;show(form.dataset.error || 'The contact system is not available yet.'); window.turnstile?.reset?.();
    } finally { submit.disabled=false; }
  });
}
