/* Admin UI demonstration only: no persistence, login or publishing. */
const tabNames={overview:'Overview',pages:'Pages & content',translations:'Translations',services:'Services',video:'Media & video',enquiries:'Enquiries'};
const drafts={
 en:{title:'Learn a language. Find your voice. Connect with the world.',description:'Personalised English, Russian and Arabic lessons, professional communication coaching, translation and interpretation with Nozha Badavi.'},
 ar:{title:'تعلّم لغة. عبّر بثقة. وانفتح على العالم.',description:'دروس مخصّصة في الإنجليزية والروسية والعربية، والتواصل المهني والترجمة التحريرية والشفوية مع Nozha Badavi.'},
 ru:{title:'Изучайте языки. Обретайте уверенность. Открывайте мир.',description:'Индивидуальные уроки английского, русского и арабского, подготовка к профессиональному общению и перевод.'}
};
const sidebar=document.getElementById('sidebar');const menu=document.querySelector('.mobile-menu');
menu?.addEventListener('click',()=>{let open=!sidebar.classList.contains('is-open');sidebar.classList.toggle('is-open',open);menu.setAttribute('aria-expanded',String(open))});
let activeLocale='en';
function go(name){if(!tabNames[name])return;document.querySelectorAll('.panel-view').forEach(el=>el.classList.toggle('is-visible',el.id==='view-'+name));document.querySelectorAll('.nav-item').forEach(el=>{el.classList.toggle('is-active',el.dataset.view===name);el.removeAttribute('aria-current');if(el.dataset.view===name)el.setAttribute('aria-current','page')});document.getElementById('breadcrumb').textContent=tabNames[name];sidebar.classList.remove('is-open');menu?.setAttribute('aria-expanded','false');document.querySelector('.page-top h1')?.focus?.();}
document.querySelectorAll('[data-view],[data-go]').forEach(button=>button.addEventListener('click',()=>{go(button.dataset.view||button.dataset.go);if(button.dataset.edit)changeLocale(button.dataset.edit)}));
const title=document.getElementById('hero-title'),description=document.getElementById('hero-description');
function preview(){document.getElementById('preview-heading').textContent=title.value;document.getElementById('preview-description').textContent=description.value;document.getElementById('preview-heading').dir=activeLocale==='ar'?'rtl':'ltr';document.getElementById('preview-description').dir=activeLocale==='ar'?'rtl':'ltr'}
function changeLocale(locale){if(!drafts[locale])return;activeLocale=locale;document.querySelectorAll('[data-locale]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.locale===locale)));title.value=drafts[locale].title;description.value=drafts[locale].description;title.dir=locale==='ar'?'rtl':'ltr';description.dir=locale==='ar'?'rtl':'ltr';preview()}
document.querySelectorAll('[data-locale]').forEach(tab=>tab.addEventListener('click',()=>{drafts[activeLocale]={title:title.value,description:description.value};changeLocale(tab.dataset.locale)}));
document.getElementById('preview-content')?.addEventListener('click',preview);
document.getElementById('save-draft')?.addEventListener('click',()=>{drafts[activeLocale]={title:title.value,description:description.value};document.getElementById('editor-message').textContent='Saved in temporary browser memory for this demonstration only. Not published or sent to a server.';preview();const toast=document.getElementById('toast');toast.textContent='Demo draft updated in memory — not saved to backend';toast.hidden=false;setTimeout(()=>toast.hidden=true,4500)});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&sidebar.classList.contains('is-open')){sidebar.classList.remove('is-open');menu?.setAttribute('aria-expanded','false');menu?.focus()}});
changeLocale('en');
