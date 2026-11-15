#!/usr/bin/env python3
"""Generate static NUSYA public pages and a separate admin-only UI preview.

Zero external dependencies. Output is suitable for Cloudflare Workers Static Assets.
This is not an implementation of the backend or administrative authentication.
"""
from __future__ import annotations
import html
import json
import os
import shutil
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'src'/'content'))
from site_copy import COPY, LOCALES, NAV_KEYS, SOCIAL
DEVELOPER_URL='https://dr-badawi-abdalsalam.com/'
PUBLIC=ROOT/'dist-public'
ADMIN=ROOT/'dist-admin'
PAGES=['home','about','lessons','coaching','translation','contact','privacy']
NAV_PAGES=['home','about','lessons','coaching','translation','contact']
VIMEO='https://player.vimeo.com/video/1171310337?h=3416a6f4f5'
VIMEO_PUBLIC='https://vimeo.com/1171310337'
CANONICAL='https://nozha-badavi.com'

def E(s):return html.escape(str(s),quote=True)
def U(loc,page='home'):
    return '/'+loc+'/' + ('' if page=='home' else page+'/')
def T(loc,k):return E(COPY[loc][k])
def pill(label,href,style='primary',external=False,extra=''):
    ext=' target="_blank" rel="noopener noreferrer"' if external else ''
    return f'<a class="btn btn-{style}" href="{E(href)}"{ext} {extra}>{E(label)}<span aria-hidden="true" class="arr">↗</span></a>'
def label(text):return f'<div class="eyebrow">{E(text)}</div>'
def title(loc,key):return f'<h2 class="display" data-nusya-field="{key}">{T(loc,key)}</h2>'
def small_globe():
    return '<svg viewBox="0 0 48 48" class="globe-mark" aria-hidden="true"><circle cx="24" cy="24" r="19"/><path d="M5 24h38M24 5v38M8 16h32M8 32h32M24 5c-16 12-16 26 0 38M24 5c16 12 16 26 0 38" fill="none"/></svg>'
def wordmark(loc):
    return f'<a class="brand" href="{U(loc)}" aria-label="NUSYA Linguistic Studio">'+\
           f'<span class="brand-row"><span class="brand-script">Nusya</span>{small_globe()}</span><span class="brand-small">LINGUISTIC STUDIO</span></a>'
def header(loc,page):
    c=COPY[loc];nav=''.join(f'<a class="nav-link {"is-current" if key==page else ""}" href="{U(loc,key)}" {"aria-current=page" if key==page else ""}>{E(c["nav"][i])}</a>' for i,key in enumerate(NAV_KEYS))
    languages=''.join(f'<a class="lang-link {"active" if l==loc else ""}" lang="{l}" dir="{COPY[l]["dir"]}" href="{U(l,page)}" {"aria-current=page" if l==loc else ""}>{E(COPY[l]["name"])}</a>' for l in LOCALES)
    return f'''<a class="skip-link" href="#main">{T(loc,'jump')}</a><header class="site-header" id="top"><div class="header-inner wrap">{wordmark(loc)}<nav class="desktop-nav" aria-label="{T(loc,'menu')}">{nav}</nav><div class="header-right"><div class="language-select" aria-label="{T(loc,'language_label')}">{languages}</div><button class="menu-toggle" type="button" aria-controls="mobile-menu" aria-expanded="false" aria-label="{T(loc,'menu')}"><span></span><span></span><span></span></button></div></div><nav class="mobile-menu" id="mobile-menu" aria-label="{T(loc,'menu')}">{nav}<div class="mobile-langs">{languages}</div></nav></header>'''
def footer(loc):
    c=COPY[loc]
    nav=''.join(f'<a href="{U(loc,k)}">{E(c["nav"][i])}</a>' for i,k in enumerate(NAV_KEYS))
    return f'''<footer class="footer"><div class="wrap footer-grid"><div class="footer-intro">{wordmark(loc)}<p class="footer-quote">{T(loc,'tagline')}</p></div><div class="footer-links"><h3>{T(loc,'social_title')}</h3><a href="{E(SOCIAL['instagram'])}" target="_blank" rel="noopener noreferrer">Instagram ↗</a><a href="{E(SOCIAL['preply'])}" target="_blank" rel="noopener noreferrer">Preply ↗</a><a href="{E(SOCIAL['linkedin'])}" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></div><nav class="footer-links" aria-label="Footer">{nav}</nav></div><div class="wrap footer-bottom"><div class="footer-meta"><span>{T(loc,'copyright')}</span><span class="developer-credit">{T(loc,'developer_label')} <a class="developer-link" href="{E(DEVELOPER_URL)}" target="_blank" rel="noopener noreferrer"><bdi>{T(loc,'developer_name')}</bdi><span class="developer-arrow" aria-hidden="true">&#8599;</span></a></span></div><a href="{U(loc,'privacy')}">{T(loc,'privacy_title')}</a><span class="footer-dot">NUSYA · 2026</span></div></footer>'''
def shell(loc,page,body,seo_title,seo_desc):
    c=COPY[loc];route=U(loc,page)
    alt=''.join(f'<link rel="alternate" hreflang="{l}" href="{CANONICAL}{U(l,page)}" />' for l in LOCALES)
    canonical=CANONICAL+route
    body_class=' page-'+page
    return f'''<!doctype html><html lang="{loc}" dir="{c['dir']}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#F8F4EE"><meta name="description" content="{E(seo_desc)}"><meta property="og:type" content="website"><meta property="og:site_name" content="NUSYA Linguistic Studio"><meta property="og:title" content="{E(seo_title)}"><meta property="og:description" content="{E(seo_desc)}"><meta property="og:url" content="{canonical}"><meta property="og:image" content="{CANONICAL}/assets/social-card.svg"><meta name="twitter:card" content="summary_large_image"><meta name="color-scheme" content="light"><link rel="canonical" href="{canonical}">{alt}<link rel="alternate" hreflang="x-default" href="{CANONICAL}{U('uk',page)}"><link rel="icon" type="image/svg+xml" href="/assets/favicon.svg"><link rel="stylesheet" href="/assets/site.css"><title>{E(seo_title)} · NUSYA Linguistic Studio</title><script type="module" src="/assets/site.js"></script></head><body class="{body_class.strip()}">{header(loc,page)}<main id="main" tabindex="-1">{body}</main>{footer(loc)}<div id="live-announcer" class="sr-only" role="status" aria-live="polite"></div></body></html>'''
def portrait(loc,mode='hero'):
    c=COPY[loc]
    return f'''<div class="portrait-art portrait-{mode}" data-nusya-media="{"heroPortrait" if mode=="hero" else "aboutPortrait"}" role="img" aria-label="{T(loc,'profile_pic')}"><div class="portrait-luminosity"></div><svg class="portrait-orbit" viewBox="0 0 540 520" aria-hidden="true"><circle cx="280" cy="240" r="176" fill="none" stroke="currentColor" stroke-width="1" opacity=".32"/><ellipse cx="280" cy="240" rx="68" ry="176" fill="none" stroke="currentColor" opacity=".24"/><path d="M104 240h353M135 175h292M135 307h292" fill="none" stroke="currentColor" opacity=".22"/><path class="animated-flightpath" d="M55 360C116 300 158 325 209 253s93-100 155-85 91 37 136-38" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="620" stroke-dashoffset="620"/><path d="m492 109 30 3-24 11 3-7z" fill="currentColor"/></svg><div class="portrait-card"><div class="portrait-logo">N</div><div class="portrait-note"><span>{T(loc,'profile_pic')}</span><small>{T(loc,'photo_note')}</small></div></div><span class="portrait-stamp">NUSYA · LANGUAGE STUDIO</span></div>'''
def page_intro(loc,eyebrow,head,lead):
    return f'<section class="page-intro"><div class="wrap">{label(eyebrow)}<h1 class="display page-heading" data-nusya-field="title">{E(head)}</h1><p class="page-lead" data-nusya-field="description">{E(lead)}</p></div></section>'
def cta_section(loc):
    c=COPY[loc]
    return f'''<section class="closing-section wrap"><div class="closing-box"><div class="closing-decoration" aria-hidden="true">{small_globe()}</div>{label(c['closing_eyebrow'])}<h2 class="display" data-nusya-field="closing_title">{T(loc,'closing_title')}</h2><p data-nusya-field="closing_desc">{T(loc,'closing_desc')}</p><div class="button-row">{pill(c['lessons_cta'],U(loc,'lessons'),'light')}{pill(c['request_cta'],U(loc,'contact'),'outline-light')}</div></div></section>'''
def video_section(loc):
    c=COPY[loc]
    return f'''<section class="video-section section-pad" data-nusya-video-section id="introduction"><div class="wrap video-grid"><div class="video-copy" data-reveal>{label(c['video_eyebrow'])}{title(loc,'video_title')}<p class="section-lead" data-nusya-field="video_desc">{T(loc,'video_desc')}</p><span class="fine-rule"></span><p class="quiet-aside">NUSYA · LINGUISTIC STUDIO</p></div><div class="video-poster" data-video data-vimeo="{VIMEO}" data-video-title="{T(loc,'video_play')}"><div class="video-art"><span class="video-art-globe" aria-hidden="true">◎</span><span class="video-art-caption">NUSYA / A PERSONAL INTRODUCTION</span></div><button type="button" class="video-play" aria-label="{T(loc,'video_play')}"><span aria-hidden="true">▶</span></button><div class="video-caption">{T(loc,'video_play')}</div><a class="video-fallback" href="{VIMEO_PUBLIC}" target="_blank" rel="noopener noreferrer">{T(loc,'video_link')} ↗</a></div></div></section>'''
def lesson_cards(loc,detail=False):
    c=COPY[loc];out=[]
    for i,key in enumerate(['english','russian','arabic']):
        desc_key=key+'_long' if detail else key+'_desc'
        target=SOCIAL['preply'] if detail and key=='english' else U(loc,'contact')+'?service=lesson&language='+key
        text=c['preply_cta'] if detail and key=='english' else c['learn_more'] if not detail else c['lessons_cta']
        deco=['A·Z','А·Я','أ·ي'][i]
        out.append(f'''<article class="lesson-card lang-{key}" data-nusya-service="{key}" data-reveal><div class="lesson-decor"><span class="lesson-index">0{i+1}</span><span aria-hidden="true" class="lesson-glyph">{deco}</span><div class="line-art" aria-hidden="true"></div></div><div class="lesson-card-body"><span class="mini-label">LANGUAGE 0{i+1}</span><h3 class="card-heading" data-nusya-field="{key}">{E(c[key])}</h3><p data-nusya-field="{desc_key}">{E(c[desc_key])}</p><a class="text-link" href="{E(target)}" {('target="_blank" rel="noopener noreferrer"' if detail and key=='english' else '')}>{E(text)}<span aria-hidden="true">↗</span></a></div></article>''')
    return '<div class="lesson-grid">'+''.join(out)+'</div>'
def service_cards(loc):
    c=COPY[loc]
    items=[('translation_title','translation_desc','file-text','translation'),('interpretation_title','interpretation_desc','headphones','interpretation')]
    markup=[]
    for name,desc,icon,kind in items:
        icon_html='<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M12 7h16l8 8v26H12zM28 7v9h8M17 22h14M17 28h13M17 34h9"/></svg>' if icon=='file-text' else '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 26v-3a16 16 0 0 1 32 0v3M8 24h7v14H8a4 4 0 0 1-4-4v-6a4 4 0 0 1 4-4zM40 24h-7v14h7a4 4 0 0 0 4-4v-6a4 4 0 0 0-4-4z"/></svg>'
        markup.append(f'<article class="service-card" data-nusya-service="{kind}" data-reveal><div class="service-icon">{icon_html}</div><div><h3 class="card-heading" data-nusya-field="{name}">{T(loc,name)}</h3><p data-nusya-field="{desc}">{T(loc,desc)}</p><a class="text-link" href="{U(loc,"contact")}?service={kind}">{T(loc,"quote_cta")}<span aria-hidden="true">↗</span></a></div></article>')
    return '<div class="service-grid">'+''.join(markup)+'</div>'
def home(loc):
    c=COPY[loc]
    hero=f'''<section class="hero"><div class="wrap hero-grid"><div class="hero-copy">{label(c['eyebrow'])}<h1 class="display hero-title" data-nusya-field="hero">{T(loc,'hero')}</h1><p class="hero-lead" data-nusya-field="hero_desc">{T(loc,'hero_desc')}</p><div class="button-row">{pill(c['lessons_cta'],U(loc,'lessons'))}{pill(c['request_cta'],U(loc,'contact'),'outline')}</div><div class="hero-signature"><span aria-hidden="true" class="signature-line"></span><span>NUSYA · LINGUISTIC STUDIO</span></div></div>{portrait(loc)}</div><div class="hero-bottom-swoop" aria-hidden="true"></div></section>'''
    proof='<div class="wrap proof-grid">'+''.join(f'<div class="proof-item" data-reveal><span class="proof-icon" aria-hidden="true">{ic}</span><span>{E(item)}</span></div>' for ic,item in zip(['✧','◎','↗'],c['proof']))+'</div>'
    lesson=f'''<section class="section-pad lessons-section wrap" id="languages"><div class="section-heading" data-reveal>{label(c['lessons_eyebrow'])}{title(loc,'lessons_title')}<p class="section-lead" data-nusya-field="lessons_desc">{T(loc,'lessons_desc')}</p></div>{lesson_cards(loc)}</section>'''
    coaching=f'''<section class="section-pad coaching-section"><div class="wrap coaching-grid"><div class="coaching-art" aria-hidden="true"><div class="paper-card paper-one"><span>01</span><div class="paper-lines"></div></div><div class="paper-card paper-two"><span>02</span><div class="paper-lines"></div></div><svg class="coaching-line" viewBox="0 0 420 340"><path d="M45 264C140 32 236 290 379 79" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="379" cy="79" r="8" fill="none" stroke="currentColor"/></svg><div class="coaching-caption">NUSYA / COMMUNICATION</div></div><div class="coaching-copy" data-reveal>{label(c['coaching_eyebrow'])}{title(loc,'coaching_title')}<p class="section-lead" data-nusya-field="coaching_desc">{T(loc,'coaching_desc')}</p>{pill(c['coaching_cta'],U(loc,'coaching'),'outline')}</div></div></section>'''
    services=f'''<section class="section-pad wrap" id="services"><div class="section-heading" data-reveal>{label(c['services_eyebrow'])}{title(loc,'services_title')}</div>{service_cards(loc)}</section>'''
    about=f'''<section class="section-pad about-section"><div class="wrap about-grid"><div class="about-art">{portrait(loc,'about')}</div><div class="about-copy" data-reveal>{label(c['about_eyebrow'])}{title(loc,'about_title')}<p class="section-lead" data-nusya-field="about_desc">{T(loc,'about_desc')}</p><ul class="clean-list">{''.join('<li>'+E(t)+'</li>' for t in c['proof'])}</ul>{pill(c['about_cta'],U(loc,'about'),'outline')}</div></div></section>'''
    process=f'''<section class="section-pad wrap process-section"><div class="section-heading" data-reveal>{label(c['process_eyebrow'])}{title(loc,'process_title')}</div><div class="process-grid">{''.join(f'<article class="process-card" data-reveal><span class="step-number">{E(num)}</span><h3>{E(head)}</h3><p>{E(text)}</p></article>' for num,head,text in c['process'])}</div></section>'''
    faqs=f'''<section class="section-pad faq-section"><div class="wrap faq-grid"><div>{label(c['faq_eyebrow'])}{title(loc,'faq_title')}</div><div class="faq-list">{''.join(f'<details data-reveal><summary>{E(q)}<span aria-hidden="true" class="faq-plus">+</span></summary><p>{E(a)}</p></details>' for q,a in c['faq'])}</div></div></section>'''
    return hero+f'<section class="proof-section">{proof}</section>'+video_section(loc)+lesson+coaching+services+about+process+faqs+cta_section(loc)

def page_about(loc):
    c=COPY[loc]
    story=f'''<section class="section-pad wrap about-grid about-standalone"><div class="about-art">{portrait(loc,'about')}</div><div class="about-copy" data-reveal>{label(c['about_eyebrow'])}<h2 class="display" data-nusya-field="story_heading">{T(loc,'story_heading')}</h2><p class="section-lead" data-nusya-field="story_body">{T(loc,'story_body')}</p><div class="subtle-quote">“{T(loc,'tagline')}”</div></div></section>'''
    journey=f'''<section class="section-pad journey-section"><div class="wrap"><div class="section-heading">{title(loc,'journey_title')}</div><div class="journey-list">{''.join(f'<article data-reveal><span class="journey-dot" aria-hidden="true"></span><h3>{E(a)}</h3><p>{E(b)}</p></article>' for a,b in c['journey'])}</div></div></section>'''
    return page_intro(loc,c['about_eyebrow'],c['about_page_title'],c['about_page_desc'])+story+journey+video_section(loc)+cta_section(loc)

def page_lessons(loc):
    c=COPY[loc]
    return page_intro(loc,c['lessons_eyebrow'],c['lessons_page_title'],c['lessons_page_desc'])+f'''<section class="section-pad wrap">{lesson_cards(loc,True)}<p class="info-note">{T(loc,'lesson_note')}</p></section>'''+f'''<section class="process-section section-pad wrap"><div class="section-heading">{title(loc,'process_title')}</div><div class="process-grid">{''.join(f'<article class="process-card"><span class="step-number">{E(i)}</span><h3>{E(h)}</h3><p>{E(b)}</p></article>' for i,h,b in c['process'])}</div></section>'''+cta_section(loc)

def page_coaching(loc):
    c=COPY[loc]
    cards=''.join(f'<article class="topic-card" data-reveal><span class="topic-no">0{i+1}</span><h2 class="card-heading">{E(a)}</h2><p>{E(b)}</p></article>' for i,(a,b) in enumerate(c['coaching_topics']))
    return page_intro(loc,c['coaching_eyebrow'],c['coaching_page_title'],c['coaching_page_desc'])+f'''<section class="section-pad wrap"><div class="topic-grid">{cards}</div><p class="info-note">{T(loc,'coaching_note')}</p>{pill(c['coaching_cta'],U(loc,'contact')+'?service=coaching')}</section>'''+cta_section(loc)

def page_translation(loc):
    c=COPY[loc]
    steps=''.join(f'<article class="process-card"><span class="step-number">0{i+1}</span><h3>{E(a)}</h3><p>{E(b)}</p></article>' for i,(a,b) in enumerate(c['translation_steps']))
    return page_intro(loc,c['services_eyebrow'],c['translation_page_title'],c['translation_page_desc'])+f'''<section class="section-pad wrap">{service_cards(loc)}<div class="translation-steps"><h2 class="display">{T(loc,'process_title')}</h2><div class="process-grid">{steps}</div></div><p class="info-note">{T(loc,'translation_note')}</p>{pill(c['quote_cta'],U(loc,'contact')+'?service=translation')}</section>'''+cta_section(loc)

def form_field(name,label_txt,kind='text',required=False,attrs='',id_suffix=''):
    req='required' if required else ''
    return f'<label class="field"><span>{E(label_txt)}{" *" if required else ""}</span><input id="field-{name}{id_suffix}" name="{name}" type="{kind}" {req} {attrs}></label>'
def select_field(name,title,options,initial='',required=False):
    req='required' if required else ''
    return f'<label class="field"><span>{E(title)}{" *" if required else ""}</span><select name="{name}" id="field-{name}" {req}><option value="">{E(initial)}</option>'+''.join(f'<option value="{E(k)}">{E(v)}</option>' for k,v in options)+'</select></label>'
def enquiry_form(loc):
    c=COPY[loc]
    service_opts=[('lesson',c['form_choices'][0]),('coaching',c['form_choices'][1]),('translation',c['form_choices'][2]),('interpretation',c['form_choices'][3])]
    language_opts=list(zip(('en','ru','ar','uk'),c['form_langs']))
    lesson_opts=list(zip(('english','russian','arabic'),(c['english'],c['russian'],c['arabic'])))
    choices=''.join(f'<label class="service-option"><input type="radio" name="type" value="{kind}" {"checked" if kind=="lesson" else ""}><span>{E(text)}</span></label>' for kind,text in service_opts)
    notes=f'<p class="form-info">{T(loc,"form_info")}</p>'
    details=f'''<div class="form-detail" data-for="lesson">{select_field('language',c['form_language'],lesson_opts,c['form_pick'],required=True)}{form_field('goal',c['form_goal'],attrs='maxlength="160"',id_suffix='-lesson')}</div><div class="form-detail" data-for="coaching" hidden>{form_field('goal',c['form_goal'],required=True,attrs='maxlength="160"',id_suffix='-coaching')}</div><div class="form-detail" data-for="translation" hidden><div class="field-row">{select_field('sourceLanguage',c['form_from'],language_opts,c['form_pick'],required=True)}{select_field('targetLanguage',c['form_to'],language_opts,c['form_pick'],required=True)}</div>{form_field('dueDate',c['form_date'],'date',required=True)}</div><div class="form-detail" data-for="interpretation" hidden><div class="field-row">{select_field('sourceLanguage',c['form_from'],language_opts,c['form_pick'],required=True)}{select_field('targetLanguage',c['form_to'],language_opts,c['form_pick'],required=True)}</div>{form_field('eventDate',c['form_date'],'date',required=True)}{select_field('format',c['form_format'],list(zip(('remote','in_person','unsure'),c['form_formats'])),c['form_pick'])}</div>'''
    common=f'''<div class="field-row">{form_field('name',c['form_name'],required=True,attrs='autocomplete="name" maxlength="120"')}{form_field('email',c['form_email'],'email',True,'autocomplete="email" maxlength="254"')}</div><label class="field"><span>{T(loc,'form_message')} *</span><textarea id="field-message" name="message" required rows="5" maxlength="2500"></textarea></label><label class="check-field"><input name="privacyAcknowledged" type="checkbox" required><span>{T(loc,'form_consent')}</span></label>'''
    return f'''<form id="enquiry-form" class="enquiry-form" novalidate data-locale="{loc}" data-error="{T(loc,'form_error')}" data-success="{T(loc,'form_success')}" data-same="{T(loc,'form_same')}"><fieldset class="service-choice"><legend>{T(loc,'form_service')}</legend>{choices}</fieldset><div class="form-fields">{details}{common}</div>{notes}<div id="nusya-turnstile" aria-live="polite"></div><div class="form-feedback" id="enquiry-feedback" role="status" aria-live="polite" hidden></div><button class="btn btn-primary" type="submit">{T(loc,'form_send')} <span aria-hidden="true">↗</span></button></form>'''
def page_contact(loc):
    c=COPY[loc]
    links=''.join(f'<a class="contact-social" href="{E(href)}" target="_blank" rel="noopener noreferrer"><span>{name}</span><span aria-hidden="true">↗</span></a>' for name,href in SOCIAL.items())
    return page_intro(loc,c['social_title'],c['contact_page_title'],c['contact_page_desc'])+f'''<section class="section-pad wrap contact-grid"><div class="form-panel"><h2 class="display">{T(loc,'form_title')}</h2>{enquiry_form(loc)}</div><aside class="contact-side">{label(c['contact_social'])}<h2 class="display">NUSYA</h2><p>{T(loc,'closing_desc')}</p><div class="contact-socials">{links}</div><div class="contact-art" aria-hidden="true">◎</div></aside></section>'''
def page_privacy(loc):
    c=COPY[loc]
    return page_intro(loc,c['social_title'],c['privacy_title'],c['privacy_desc'])+f'<section class="section-pad wrap legal-copy"><p data-nusya-field="privacy_body">{T(loc,"privacy_body")}</p></section>'

def build_public():
    if PUBLIC.exists():shutil.rmtree(PUBLIC)
    PUBLIC.mkdir(parents=True)
    source=ROOT/'src'/'assets'
    shutil.copytree(source,PUBLIC/'assets')
    pages={'home':home,'about':page_about,'lessons':page_lessons,'coaching':page_coaching,'translation':page_translation,'contact':page_contact,'privacy':page_privacy}
    for loc,c in COPY.items():
        for name,render in pages.items():
            folder=PUBLIC/loc/(name if name!='home' else '')
            folder.mkdir(parents=True,exist_ok=True)
            title=c['hero'] if name=='home' else c.get(name+'_page_title') or c.get(name+'_title') or c['hero']
            description=c['hero_desc'] if name=='home' else c.get(name+'_page_desc') or c.get(name+'_desc') or c['hero_desc']
            (folder/'index.html').write_text(shell(loc,name,render(loc),title,description),encoding='utf-8')
    (PUBLIC/'index.html').write_text('<!doctype html><html lang="uk"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/uk/"><link rel="canonical" href="https://nozha-badavi.com/uk/"></head><body><a href="/uk/">NUSYA — Українська</a></body></html>',encoding='utf-8')
    (PUBLIC/'404.html').write_text(shell('uk','home',page_intro('uk','NUSYA',COPY['uk']['not_found'],'')+pill(COPY['uk']['back_home'],U('uk')),'Сторінку не знайдено','Запитану сторінку не знайдено.'),encoding='utf-8')
    (PUBLIC/'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: https://nozha-badavi.com/sitemap.xml\n',encoding='utf-8')
    routes=[f'{CANONICAL}{U(loc,page)}' for loc in LOCALES for page in PAGES]
    (PUBLIC/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join(f'<url><loc>{E(u)}</loc></url>' for u in routes)+'</urlset>',encoding='utf-8')
    print(f'Built {len(routes)} public pages to {PUBLIC}')
def build_admin():
    if ADMIN.exists():shutil.rmtree(ADMIN)
    ADMIN.mkdir(parents=True)
    shutil.copytree(ROOT/'src'/'assets',ADMIN/'assets')
    shutil.copy2(ROOT/'src'/'admin.html',ADMIN/'index.html')
    preview=ADMIN/'preview-public'
    shutil.copytree(PUBLIC,preview,ignore=shutil.ignore_patterns('assets'))
    (ADMIN/'robots.txt').write_text('User-agent: *\nDisallow: /\n',encoding='utf-8')
    print(f'Built admin UI preview (NO AUTH/BACKEND) to {ADMIN}')
if __name__=='__main__':
    assert all(set(COPY[loc])==set(COPY['en']) for loc in LOCALES)
    build_public()
    build_admin()
