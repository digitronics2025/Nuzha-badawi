#!/usr/bin/env python3
"""Generate localized public pages and assets for the separately protected admin.

Zero external dependencies. Output is suitable for Cloudflare Workers Static Assets.
Authentication and all persistence are implemented by the Worker APIs.
"""
from __future__ import annotations
import html
import hashlib
import json
import os
import shutil
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'src'/'content'))
from site_copy import COPY, LOCALES, NAV_KEYS, SOCIAL
from experience_copy import EXPERIENCE
from seo import BRAND, CANONICAL, IMAGE_ALT, OG_LOCALES, metadata, structured_data
DEVELOPER_URL='https://dr-badawi-abdalsalam.com/'
PUBLIC=ROOT/'dist-public'
ADMIN=ROOT/'dist-admin'
PAGES=['home','about','lessons','coaching','translation','contact','privacy']
NAV_PAGES=['home','about','lessons','coaching','translation','contact']
VIMEO='https://player.vimeo.com/video/1171310337?h=3416a6f4f5'
VIMEO_PUBLIC='https://vimeo.com/1171310337/3416a6f4f5'

def asset(name):
    digest=hashlib.sha256((ROOT/'src/assets'/name).read_bytes()).hexdigest()[:12]
    return f'/assets/{name}?v={digest}'
def arrow():
    return '<svg class="arrow-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg>'
def field(loc, key, tag='span', cls=''):
    return f'<{tag} class="{cls}" data-nusya-field="{key}">{T(loc,key)}</{tag}>'
def availability(loc, service):
    return f'<span class="availability-status" data-nusya-status="{service}" data-open-label="{T(loc,"available")}" data-closed-label="{T(loc,"unavailable")}">{T(loc,"availability_pending")}</span>'
def E(s):return html.escape(str(s),quote=True)
def U(loc,page='home'):
    return '/'+loc+'/' + ('' if page=='home' else page+'/')
def T(loc,k):return E(COPY[loc][k])
def pill(label,href,style='primary',external=False,extra=''):
    ext=' target="_blank" rel="noopener noreferrer"' if external else ''
    return f'<a class="btn btn-{style}" href="{E(href)}"{ext} {extra}>{E(label)}<span aria-hidden="true" class="arr">{arrow()}</span></a>'
def label(text):return f'<div class="eyebrow">{E(text)}</div>'
def title(loc,key):return f'<h2 class="display" data-nusya-field="{key}">{T(loc,key)}</h2>'
def small_globe():
    return '<svg viewBox="0 0 48 48" class="globe-mark" aria-hidden="true"><circle cx="24" cy="24" r="19"/><path d="M5 24h38M24 5v38M8 16h32M8 32h32M24 5c-16 12-16 26 0 38M24 5c16 12 16 26 0 38" fill="none"/></svg>'
def wordmark(loc):
    return f'<a class="brand" href="{U(loc)}" aria-label="NUSYA Linguistic Studio">'+\
           f'<span class="brand-row"><span class="brand-script">Nusya</span>{small_globe()}</span><span class="brand-small">LINGUISTIC STUDIO</span></a>'
def header(loc,page):
    c=COPY[loc];nav=''.join(f'<a class="nav-link {"is-current" if key==page else ""}" href="{U(loc,key)}" {"aria-current=page" if key==page else ""}>{E(c["nav"][i])}</a>' for i,key in enumerate(NAV_KEYS))
    languages=''.join(f'<a class="lang-link {"active" if l==loc else ""}" lang="{l}" dir="{COPY[l]["dir"]}" href="{U(l,page if page!='404' else 'home')}" {"aria-current=page" if l==loc else ""}>{E(COPY[l]["name"])}</a>' for l in LOCALES)
    return f'''<a class="skip-link" href="#main">{T(loc,'jump')}</a><header class="site-header" id="top"><div class="header-inner wrap">{wordmark(loc)}<nav class="desktop-nav" aria-label="{T(loc,'menu')}">{nav}</nav><div class="header-right"><div class="language-select" aria-label="{T(loc,'language_label')}">{languages}</div><button class="menu-toggle" type="button" aria-controls="mobile-menu" aria-expanded="false" aria-label="{T(loc,'menu')}"><span></span><span></span><span></span></button></div></div><nav class="mobile-menu" id="mobile-menu" aria-label="{T(loc,'menu')}">{nav}<div class="mobile-langs">{languages}</div></nav></header>'''
def footer(loc):
    c=COPY[loc]
    nav=''.join(f'<a href="{U(loc,k)}">{E(c["nav"][i])}</a>' for i,k in enumerate(NAV_KEYS))
    return f'''<footer class="footer"><div class="wrap footer-grid"><div class="footer-intro">{wordmark(loc)}<p class="footer-quote">{T(loc,'tagline')}</p></div><div class="footer-links"><h3>{T(loc,'social_title')}</h3><a data-nusya-link="instagram" href="{E(SOCIAL['instagram'])}" target="_blank" rel="noopener noreferrer">Instagram {arrow()}</a><a data-nusya-link="preply" href="{E(SOCIAL['preply'])}" target="_blank" rel="noopener noreferrer">Preply {arrow()}</a><a data-nusya-link="linkedin" hidden href="{E(SOCIAL['linkedin'])}" target="_blank" rel="noopener noreferrer">LinkedIn {arrow()}</a></div><nav class="footer-links" aria-label="{T(loc,'footer_label')}">{nav}</nav></div><div class="wrap footer-bottom"><div class="footer-meta"><span>{T(loc,'copyright')}</span><span class="developer-credit">{T(loc,'developer_label')} <a class="developer-link" href="{E(DEVELOPER_URL)}" target="_blank" rel="noopener noreferrer"><bdi>{T(loc,'developer_name')}</bdi><span class="developer-arrow" aria-hidden="true">{arrow()}</span></a></span></div><a href="{U(loc,'privacy')}">{T(loc,'privacy_title')}</a><span class="footer-dot">NUSYA · 2026</span></div></footer>'''
def icon_links(manifest=False):
    links='<link rel="icon" type="image/svg+xml" sizes="any" href="/assets/favicon.svg"><link rel="icon" type="image/x-icon" sizes="16x16 32x32 48x48" href="/favicon.ico">'
    links+=''.join(f'<link rel="icon" type="image/png" sizes="{size}x{size}" href="/assets/favicon-{size}x{size}.png">' for size in (16,32))
    return links+'<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">'+('<link rel="manifest" href="/site.webmanifest">' if manifest else '')

def json_script(value):
    return json.dumps(value,ensure_ascii=False,separators=(',',':')).replace('&','\\u0026').replace('<','\\u003c').replace('>','\\u003e').replace('\u2028','\\u2028').replace('\u2029','\\u2029')

def shell(loc,page,body,seo_title,seo_desc,indexable=True):
    c=COPY[loc];route=U(loc,page) if page!='404' else U(loc)+'404.html'
    alt=''.join(f'<link rel="alternate" hreflang="{l}" href="{CANONICAL}{U(l,page)}" />' for l in LOCALES)
    canonical=CANONICAL+route
    body_class=' page-'+page
    image_file=ROOT/'src'/'assets'/f'social-card-{loc}.png'
    image_url=f'{CANONICAL}/assets/social-card-{loc}.png?v={hashlib.sha256(image_file.read_bytes()).hexdigest()[:12]}'
    sharing=f'<meta property="og:locale" content="{OG_LOCALES[loc]}">'+''.join(f'<meta property="og:locale:alternate" content="{OG_LOCALES[l]}">' for l in LOCALES if l!=loc)
    sharing+=f'<meta property="og:image" content="{image_url}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:type" content="image/png"><meta property="og:image:alt" content="{E(IMAGE_ALT[loc])}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{E(seo_title)}"><meta name="twitter:description" content="{E(seo_desc)}"><meta name="twitter:image" content="{image_url}"><meta name="twitter:image:alt" content="{E(IMAGE_ALT[loc])}">'
    indexing=f'<link rel="canonical" href="{canonical}">{alt}<link rel="alternate" hreflang="x-default" href="{CANONICAL}{U("uk",page)}"><script id="nusya-schema" type="application/ld+json">{json_script(structured_data(loc,page,seo_title,seo_desc))}</script>' if indexable else '<meta name="robots" content="noindex,nofollow">'
    return f'''<!doctype html><html lang="{loc}" dir="{c['dir']}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#F8F4EE"><meta name="description" content="{E(seo_desc)}"><meta property="og:type" content="website"><meta property="og:site_name" content="NUSYA Linguistic Studio"><meta property="og:title" content="{E(seo_title)}"><meta property="og:description" content="{E(seo_desc)}">{('<meta property="og:url" content="'+canonical+'">') if indexable else ''}{sharing}<meta name="color-scheme" content="light">{indexing}{icon_links(True)}<link rel="stylesheet" href="{asset('tokens.css')}"><link rel="stylesheet" href="{asset('site.css')}"><title>{E(seo_title)} · NUSYA Linguistic Studio</title><script type="module" src="{asset('site.js')}"></script></head><body class="{body_class.strip()}">{header(loc,page)}<main id="main" tabindex="-1">{body}</main>{footer(loc)}<div id="live-announcer" class="sr-only" role="status" aria-live="polite"></div></body></html>'''
def portrait(loc,mode='hero'):
    # Generated editorial concept, explicitly disclosed in every supported locale.
    disclosure={'uk':'Ілюстрація, створена ШІ — не справжнє фото Ножі Бадаві.','en':'AI-generated illustration — not an authentic photo of Nozha Badavi.','ar':'رسم توضيحي مولّد بالذكاء الاصطناعي — ليس صورة حقيقية لنزهة بدوي.','ru':'Иллюстрация, созданная ИИ — не настоящая фотография Нузи Бадави.'}[loc]
    # An approved CMS portrait may replace this fallback at any time.
    return f'''<div class="portrait-art portrait-{mode}" data-nusya-media="{"heroPortrait" if mode=="hero" else "aboutPortrait"}" role="img" aria-label="{E(disclosure)}"><img class="portrait-concept" src="/assets/nozha-portrait-optimized.webp" width="560" height="700" alt="" decoding="async" loading="{"eager" if mode=="hero" else "lazy"}" /><span class="portrait-concept-disclosure" >{E(disclosure)}</span></div>'''

def page_intro(loc,eyebrow,head,lead):
    return f'<section class="page-intro"><div class="wrap">{label(eyebrow)}<h1 class="display page-heading" data-nusya-field="title">{E(head)}</h1><p class="page-lead" data-nusya-field="description">{E(lead)}</p></div></section>'
def cta_section(loc):
    c=COPY[loc]
    return f'''<section class="closing-section wrap"><div class="closing-box"><div class="closing-decoration" aria-hidden="true">{small_globe()}</div>{label(c['closing_eyebrow'])}<h2 class="display" data-nusya-field="closing_title">{T(loc,'closing_title')}</h2><p data-nusya-field="closing_desc">{T(loc,'closing_desc')}</p><div class="button-row">{pill(c['lessons_cta'],U(loc,'lessons'),'light')}{pill(c['request_cta'],U(loc,'contact'),'outline-light')}</div></div></section>'''
def video_section(loc):
    c=COPY[loc]
    return f'''<section class="video-section section-pad" data-nusya-video-section id="introduction"><div class="wrap video-grid"><div class="video-copy" data-reveal>{label(c['video_eyebrow'])}{title(loc,'video_title')}<p class="section-lead" data-nusya-field="video_desc">{T(loc,'video_desc')}</p><span class="fine-rule"></span><p class="quiet-aside">NUSYA · LINGUISTIC STUDIO</p></div><div class="video-poster" data-video data-vimeo="{VIMEO}" data-video-title="{T(loc,'video_play')}" data-video-error="{T(loc,'video_error')}"><div class="video-art"><img class="video-cover-image" src="/assets/nusya-introduction-cover-optimized.webp" width="896" height="504" alt="" loading="lazy" decoding="async" /><div class="video-editorial"><span class="eyebrow">{T(loc,'video_disclosure')}</span><p>{T(loc,'video_title')}</p></div></div><button type="button" class="video-play" aria-label="{T(loc,'video_play')}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7z" fill="currentColor"/></svg></button><div class="video-caption">{T(loc,'video_play')}</div><a class="video-fallback" href="{VIMEO_PUBLIC}" target="_blank" rel="noopener noreferrer">{T(loc,'video_link')} {arrow()}</a><noscript><a class="video-noscript" href="{VIMEO_PUBLIC}" target="_blank" rel="noopener noreferrer">{T(loc,'video_static')}</a></noscript></div></div></section>'''

def lesson_cards(loc,detail=False):
    c=COPY[loc];out=[]
    for i,key in enumerate(['english','russian','arabic']):
        desc_key=key+'_long' if detail else key+'_desc'
        target=SOCIAL['preply'] if detail and key=='english' else U(loc,'contact')+'?service=lesson&language='+key
        text=c['preply_cta'] if detail and key=='english' else c['learn_more'] if not detail else c['lessons_cta']
        link_label=text+' — '+c[key]
        deco=['A·Z','А·Я','أ·ي'][i]
        out.append(f'''<article class="lesson-card lang-{key}" data-nusya-service="{key}" data-reveal><div class="lesson-decor"><span class="lesson-index">0{i+1}</span><span aria-hidden="true" class="lesson-glyph">{deco}</span><div class="line-art" aria-hidden="true"></div></div><div class="lesson-card-body"><span class="mini-label">{T(loc,"language_label_short")} 0{i+1}</span><h3 class="card-heading" data-nusya-field="{key}">{E(c[key])}</h3><p data-nusya-field="{desc_key}">{E(c[desc_key])}</p>{availability(loc,key)}<a class="text-link" data-nusya-enquiry="{key}" aria-label="{E(link_label)}" hidden href="{E(target)}" {('target="_blank" rel="noopener noreferrer"' if detail and key=='english' else '')}>{E(text)}{arrow()}</a></div></article>''')
    return '<div class="lesson-grid">'+''.join(out)+'</div>'
def service_cards(loc):
    c=COPY[loc]
    items=[('translation_title','translation_desc','file-text','translation'),('interpretation_title','interpretation_desc','headphones','interpretation')]
    markup=[]
    for name,desc,icon,kind in items:
        icon_html='<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M12 7h16l8 8v26H12zM28 7v9h8M17 22h14M17 28h13M17 34h9"/></svg>' if icon=='file-text' else '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 26v-3a16 16 0 0 1 32 0v3M8 24h7v14H8a4 4 0 0 1-4-4v-6a4 4 0 0 1 4-4zM40 24h-7v14h7a4 4 0 0 0 4-4v-6a4 4 0 0 0-4-4z"/></svg>'
        markup.append(f'<article class="service-card" data-nusya-service="{kind}" data-reveal><div class="service-icon">{icon_html}</div><div><h3 class="card-heading" data-nusya-field="{name}">{T(loc,name)}</h3><p data-nusya-field="{desc}">{T(loc,desc)}</p>{availability(loc,kind)}<a class="text-link" data-nusya-enquiry="{kind}" hidden href="{U(loc,"contact")}?service={kind}">{T(loc,"quote_cta")}{arrow()}</a></div></article>')
    return '<div class="service-grid">'+''.join(markup)+'</div>'
def service_guide(loc):
    c=COPY[loc]
    cards=[]
    for i,(kind,head,desc,page) in enumerate([('lesson','lessons_title','lessons_desc','lessons'),('coaching','coaching_title','coaching_desc','coaching'),('translation','translation_title','translation_desc','translation'),('interpretation','interpretation_title','interpretation_desc','translation')]):
        cards.append(f'''<article class="guide-card" data-reveal {('data-nusya-service="'+kind+'"') if kind!='lesson' else ''}><div class="guide-top"><span class="guide-index" aria-hidden="true">0{i+1}</span>{field(loc,head,'h3','card-heading')}</div>{field(loc,desc,'p','guide-description')}<dl><dt>{T(loc,'share_label')}</dt><dd data-nusya-field="{kind}_share">{T(loc,kind+'_share')}</dd></dl><a class="text-link" href="{U(loc,page)}">{T(loc,'details_link')}{arrow()}</a></article>''')
    return f'<section class="section-pad wrap service-guide" id="services">{label(c["guide_label"])}{title(loc,"guide_title")}<p class="section-lead" data-nusya-field="guide_intro">{T(loc,"guide_intro")}</p><div class="guide-grid">'+''.join(cards)+f'</div><div class="guide-languages"><div class="section-heading">{label(c["lessons_eyebrow"])}</div>{lesson_cards(loc)}</div></section>'

def experience_timeline(loc, compact=False):
    c=COPY[loc]
    # Preserve the approved CV wording. Dates are extracted only from documented entries.
    selected=[3,4,2] if compact else list(range(len(c['journey'])))
    items=[]
    for i in selected:
        head,body=c['journey'][i]
        items.append(f'<li>{field(loc,f'journey_{i}_date','span','timeline-date')}{field(loc,f"journey_{i}_title","h3")}{field(loc,f"journey_{i}_body","p")}</li>')
    return '<ol class="experience-timeline'+(' compact-timeline' if compact else '')+'">'+''.join(items)+'</ol>'

def process_section(loc):
    c=COPY[loc]
    steps=''.join(f'<li class="process-card" data-reveal><span class="step-number" aria-hidden="true">{E(num)}</span>{field(loc,f"process_{i}_title","h3")}{field(loc,f"process_{i}_body","p")}</li>' for i,(num,head,text) in enumerate(c['process']))
    return f'<section class="section-pad wrap process-section">{label(c["source_label"])}{title(loc,"process_title")}<ol class="process-grid">{steps}</ol></section>'

def home(loc):
    c=COPY[loc]
    hero=f'''<section class="hero"><div class="wrap hero-grid"><div class="hero-copy">{label(c['eyebrow'])}<p class="hero-person">{T(loc,'person')}</p><h1 class="display hero-title" data-nusya-field="hero">{T(loc,'hero')}</h1><p class="hero-lead" data-nusya-field="hero_desc">{T(loc,'hero_desc')}</p><div class="button-row">{pill(c['lessons_cta'],U(loc,'lessons'))}{pill(c['request_cta'],U(loc,'contact'),'outline')}</div></div><div class="hero-visual">{portrait(loc)}<svg class="connection-route" viewBox="0 0 560 120" aria-hidden="true"><path d="M10 100C100 100 70 10 200 20S350 110 550 10"/><circle cx="550" cy="10" r="4"/></svg></div></div></section>'''
    proof='<div class="wrap proof-grid">'+''.join(f'<div class="proof-item"><span class="proof-icon" aria-hidden="true">{small_globe()}</span><span data-nusya-field="proof_{i}">{T(loc,f'proof_{i}')}</span></div>' for i,item in enumerate(c['proof']))+'</div>'
    about=f'''<section class="section-pad about-section"><div class="wrap about-grid"><div class="about-copy">{label(c['history_label'])}{title(loc,'about_title')}<p class="section-lead" data-nusya-field="about_desc">{T(loc,'about_desc')}</p>{pill(c['history_link'],U(loc,'about'),'outline')}</div>{experience_timeline(loc,True)}</div></section>'''
    faqs=f'''<section class="section-pad faq-section"><div class="wrap faq-grid"><div>{label(c['faq_eyebrow'])}{title(loc,'faq_title')}</div><div class="faq-list">{''.join(f'<details><summary>{field(loc,f"faq_{i}_question")}<span aria-hidden="true" class="faq-plus">+</span></summary>{field(loc,f"faq_{i}_answer","p")}</details>' for i,(q,a) in enumerate(c['faq']))}</div></div></section>'''
    return hero+f'<section class="proof-section">{proof}</section>'+video_section(loc)+service_guide(loc)+about+process_section(loc)+faqs+cta_section(loc)

def page_about(loc):
    c=COPY[loc]
    story=f'''<section class="section-pad wrap about-grid about-standalone"><div class="about-art">{portrait(loc,'about')}</div><div class="about-copy" data-reveal>{label(c['about_eyebrow'])}<h2 class="display" data-nusya-field="story_heading">{T(loc,'story_heading')}</h2><p class="section-lead" data-nusya-field="story_body">{T(loc,'story_body')}</p><div class="subtle-quote">“{T(loc,'tagline')}”</div></div></section>'''
    journey=f'<section class="section-pad journey-section"><div class="wrap">{title(loc,"journey_title")}{experience_timeline(loc)}</div></section>'
    return page_intro(loc,c['about_eyebrow'],c['about_page_title'],c['about_page_desc'])+story+journey+video_section(loc)+cta_section(loc)

def page_lessons(loc):
    c=COPY[loc]
    return page_intro(loc,c['lessons_eyebrow'],c['lessons_page_title'],c['lessons_page_desc'])+f'<section class="section-pad wrap">{lesson_cards(loc,True)}<p class="info-note">{T(loc,"lesson_note")}</p></section>'+process_section(loc)+cta_section(loc)

def page_coaching(loc):
    c=COPY[loc]
    cards=''.join(f'<article class="topic-card" data-reveal><span class="topic-no">0{i+1}</span>{field(loc,f"topic_{i}_title","h2","card-heading")}{field(loc,f"topic_{i}_body","p")}</article>' for i,(a,b) in enumerate(c['coaching_topics']))
    return page_intro(loc,c['coaching_eyebrow'],c['coaching_page_title'],c['coaching_page_desc'])+f'''<section class="section-pad wrap"><div class="topic-grid">{cards}</div><p class="info-note">{T(loc,'coaching_note')}</p>{availability(loc,'coaching')}{pill(c['coaching_cta'],U(loc,'contact')+'?service=coaching',extra='data-nusya-enquiry="coaching" hidden')}</section>'''+cta_section(loc)

def page_translation(loc):
    c=COPY[loc]
    steps=''.join(f'<article class="process-card"><span class="step-number">0{i+1}</span>{field(loc,f"translation_step_{i}_title","h3")}{field(loc,f"translation_step_{i}_body","p")}</article>' for i,(a,b) in enumerate(c['translation_steps']))
    return page_intro(loc,c['services_eyebrow'],c['translation_page_title'],c['translation_page_desc'])+f'''<section class="section-pad wrap">{service_cards(loc)}<div class="translation-steps"><h2 class="display">{T(loc,'process_title')}</h2><div class="process-grid">{steps}</div></div><p class="info-note">{T(loc,'translation_note')}</p>{pill(c['quote_cta'],U(loc,'contact')+'?service=translation',extra='data-nusya-enquiry="translation" hidden')}</section>'''+cta_section(loc)

def form_field(name,label_txt,kind='text',required=False,attrs='',id_suffix=''):
    req='required' if required else ''
    return f'<label class="field"><span>{E(label_txt)}{" *" if required else ""}</span><input id="field-{name}{id_suffix}" name="{name}" type="{kind}" dir="{'ltr' if kind=='email' else 'auto'}" {req} {attrs}></label>'
def select_field(name,title,options,initial='',required=False,id_suffix=''):
    req='required' if required else ''
    return f'<label class="field"><span>{E(title)}{" *" if required else ""}</span><select name="{name}" id="field-{name}{id_suffix}" {req}><option value="">{E(initial)}</option>'+''.join(f'<option value="{E(k)}">{E(v)}</option>' for k,v in options)+'</select></label>'
def enquiry_form(loc):
    c=COPY[loc]
    service_opts=[('lesson',c['form_choices'][0]),('coaching',c['form_choices'][1]),('translation',c['form_choices'][2]),('interpretation',c['form_choices'][3])]
    language_opts=list(zip(('en','ru','ar','uk'),c['form_langs']))
    lesson_opts=list(zip(('english','russian','arabic'),(c['english'],c['russian'],c['arabic'])))
    choices=''.join(f'<label class="service-option"><input type="radio" name="type" value="{kind}" {"checked" if kind=="lesson" else ""}><span>{E(text)}</span></label>' for kind,text in service_opts)
    notes=f'<p class="form-info">{T(loc,"form_info")}</p>'
    details=f'''<div class="form-detail" data-for="lesson">{select_field('language',c['form_language'],lesson_opts,c['form_pick'],required=True)}{form_field('goal',c['form_goal'],attrs='maxlength="160"',id_suffix='-lesson')}</div><div class="form-detail" data-for="coaching" hidden>{form_field('goal',c['form_goal'],required=True,attrs='maxlength="160"',id_suffix='-coaching')}</div><div class="form-detail" data-for="translation" hidden><div class="field-row">{select_field('sourceLanguage',c['form_from'],language_opts,c['form_pick'],required=True)}{select_field('targetLanguage',c['form_to'],language_opts,c['form_pick'],required=True)}</div>{form_field('dueDate',c['form_date'],'date',required=True)}</div><div class="form-detail" data-for="interpretation" hidden><div class="field-row">{select_field('sourceLanguage',c['form_from'],language_opts,c['form_pick'],required=True,id_suffix='-interpretation')}{select_field('targetLanguage',c['form_to'],language_opts,c['form_pick'],required=True,id_suffix='-interpretation')}</div>{form_field('eventDate',c['form_date'],'date',required=True)}{select_field('format',c['form_format'],list(zip(('remote','in_person','unsure'),c['form_formats'])),c['form_pick'])}</div>'''
    common=f'''<div class="field-row">{form_field('name',c['form_name'],required=True,attrs='autocomplete="name" maxlength="120"')}{form_field('email',c['form_email'],'email',True,'autocomplete="email" maxlength="254"')}</div><label class="field"><span>{T(loc,'form_message')} *</span><textarea id="field-message" name="message" dir="auto" required rows="5" maxlength="2500"></textarea></label><label class="check-field"><input name="privacyAcknowledged" type="checkbox" required><span>{T(loc,'form_consent')}</span></label>'''
    return f'''<form id="enquiry-form" class="enquiry-form" method="post" action="/api/v1/enquiries" novalidate data-locale="{loc}" data-messages="{E(json.dumps(EXPERIENCE[loc],ensure_ascii=False))}" data-error="{T(loc,'form_error')}" data-success="{T(loc,'form_success')}" data-same="{T(loc,'form_same')}"><fieldset class="service-choice"><legend>{T(loc,'form_service')}</legend>{choices}</fieldset><div class="form-fields">{details}{common}</div>{notes}<div id="nusya-turnstile" aria-live="polite"></div><div class="form-feedback" id="enquiry-feedback" role="status" aria-live="polite" hidden></div><p id="enquiry-readiness" role="status">{T(loc,"service_loading")}</p><button class="btn btn-primary" type="submit" disabled>{T(loc,'form_send')} {arrow()}</button><noscript><p>{T(loc,'form_error')}</p></noscript></form>'''
def page_contact(loc):
    c=COPY[loc]
    links=''.join(f'<a class="contact-social" data-nusya-link="{E(name)}" href="{E(href)}" target="_blank" rel="noopener noreferrer" {"hidden" if not href else ""}><span>{name}</span>{arrow()}</a>' for name,href in SOCIAL.items())
    return page_intro(loc,c['social_title'],c['contact_page_title'],c['contact_page_desc'])+f'''<section class="section-pad wrap contact-grid"><div class="form-panel"><h2 class="display">{T(loc,'form_title')}</h2>{enquiry_form(loc)}</div><aside class="contact-side">{label(c['contact_social'])}<h2 class="display">NUSYA</h2><p>{T(loc,'closing_desc')}</p><div class="contact-socials">{links}<a data-nusya-contact="email" hidden></a><a data-nusya-contact="phone" hidden></a></div><div class="contact-art" aria-hidden="true">◎</div></aside></section>'''
def page_privacy(loc):
    c=COPY[loc]
    return page_intro(loc,c['social_title'],c['privacy_title'],c['privacy_desc'])+f'<section class="section-pad wrap legal-copy"><p data-nusya-field="privacy_body">{T(loc,"privacy_body")}</p></section>'

def build_public():
    if PUBLIC.exists():shutil.rmtree(PUBLIC)
    PUBLIC.mkdir(parents=True)
    source=ROOT/'src'/'assets'
    shutil.copytree(source,PUBLIC/'assets',ignore=shutil.ignore_patterns('admin.*'))
    for name in ('favicon.ico','apple-touch-icon.png'):
        shutil.copy2(source/name,PUBLIC/name)
    (PUBLIC/'site.webmanifest').write_text(json.dumps({'name':BRAND,'short_name':'NUSYA','lang':'uk','start_url':'/uk/','display':'browser','theme_color':'#F8F4EE','background_color':'#F8F4EE','icons':[{'src':f'/assets/icon-{size}.png','sizes':f'{size}x{size}','type':'image/png','purpose':'any'} for size in (192,512)]}),encoding='utf-8')
    # Static asset security headers (served by Workers Static Assets without invoking the Worker).
    (PUBLIC/'_headers').write_text('/assets/*\n  X-Content-Type-Options: nosniff\n  Cache-Control: public, max-age=3600\n  Strict-Transport-Security: max-age=31536000; includeSubDomains\n/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Strict-Transport-Security: max-age=31536000; includeSubDomains\n',encoding='utf-8')
    pages={'home':home,'about':page_about,'lessons':page_lessons,'coaching':page_coaching,'translation':page_translation,'contact':page_contact,'privacy':page_privacy}
    for loc,c in COPY.items():
        for name,render in pages.items():
            folder=PUBLIC/loc/(name if name!='home' else '')
            folder.mkdir(parents=True,exist_ok=True)
            seo=metadata(loc,name)
            (folder/'index.html').write_text(shell(loc,name,render(loc),seo['title'],seo['description']),encoding='utf-8')
    (PUBLIC/'index.html').write_text('<!doctype html><html lang="uk"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/uk/"><link rel="canonical" href="https://nozha-badavi.com/uk/"></head><body><a href="/uk/">NUSYA — Українська</a></body></html>',encoding='utf-8')
    for loc in LOCALES:
        error=shell(loc,'404',page_intro(loc,'NUSYA',COPY[loc]['not_found'],COPY[loc]['not_found_desc'])+f'<div class="wrap error-actions">{pill(COPY[loc]["back_home"],U(loc))}{pill(COPY[loc]["lessons_cta"],U(loc,"lessons"),"outline")}</div>',COPY[loc]['not_found'],COPY[loc]['not_found_desc'],indexable=False)
        (PUBLIC/loc/'404.html').write_text(error,encoding='utf-8')
        if loc=='uk':(PUBLIC/'404.html').write_text(error,encoding='utf-8')
    (PUBLIC/'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: https://nozha-badavi.com/sitemap.xml\n',encoding='utf-8')
    routes=[f'{CANONICAL}{U(loc,page)}' for loc in LOCALES for page in PAGES]
    (PUBLIC/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join(f'<url><loc>{E(u)}</loc></url>' for u in routes)+'</urlset>',encoding='utf-8')
    print(f'Built {len(routes)} public pages to {PUBLIC}')
def build_admin():
    if ADMIN.exists():shutil.rmtree(ADMIN)
    ADMIN.mkdir(parents=True)
    shutil.copytree(ROOT/'src'/'assets',ADMIN/'assets')
    admin=(ROOT/'src/admin.html').read_text(encoding='utf-8')
    admin=admin.replace('<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">',icon_links())
    for name in ['tokens.css','admin.css','admin.js']:
        admin=admin.replace('/assets/'+name,asset(name))
    (ADMIN/'index.html').write_text(admin,encoding='utf-8')
    for name in ('favicon.ico','apple-touch-icon.png'):
        shutil.copy2(ROOT/'src'/'assets'/name,ADMIN/name)
    preview=ADMIN/'preview-public'
    shutil.copytree(PUBLIC,preview,ignore=shutil.ignore_patterns('assets','_headers'))
    (ADMIN/'robots.txt').write_text('User-agent: *\nDisallow: /\n',encoding='utf-8')
    print(f'Built protected admin UI (served only by the Access-protected admin Worker) to {ADMIN}')
if __name__=='__main__':
    assert all(set(COPY[loc])==set(COPY['en']) for loc in LOCALES)
    build_public()
    build_admin()
