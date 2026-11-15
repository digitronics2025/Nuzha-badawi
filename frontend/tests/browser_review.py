"""Browser regressions over built assets and mocked APIs; no external writes.
Run after build and tools/review-runtime.mjs: python3 frontend/tests/browser_review.py.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json, os, shutil, base64
from urllib.parse import urlsplit,parse_qs
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('NUSYA_QA_DIR','/tmp/nusya-review/verified'));OUT.mkdir(parents=True,exist_ok=True)
FIXTURES=Path(os.environ.get('NUSYA_REVIEW_FIXTURES','/tmp/nusya-testimonial-runtime'))
manifest=(ROOT.parent/'workers'/'shared'/'defaults.js').read_text().split('export default ',1)[1].strip().removesuffix(';')
defaults=json.loads(manifest)
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':390,'height':844},reduced_motion='reduce')
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    requests=[]
    unavailable=set()
    review_pages=False
    image_requests=[]
    saved_pages={}
    saves=[]
    def serve(route):
        url=route.request.url
        if not url.startswith('http://public.test') and not url.startswith('http://admin.test'):
            route.abort();return
        admin=url.startswith('http://admin.test');path=url.split('.test',1)[1].split('?')[0]
        if path.startswith('/media/'):
            image_requests.append(path)
            if path=='/media/approvedimage123':
                route.fulfill(content_type='image/png',body=base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='))
            else:route.fulfill(status=404,body='Image unavailable')
            return
        if review_pages and path in [f'/{locale}/' for locale in ['uk','en','ar','ru']]:
            route.fulfill(path=str(FIXTURES/(path.strip('/')+'.html')));return
        if path=='/api/v1/config':
            route.fulfill(json={'ready':True,'turnstileSiteKey':'test','approvedTranslationPairs':['en:ru'],'services':{k:{'visible':True,'acceptingRequests':k not in unavailable} for k in ['english','russian','arabic','coaching','translation','interpretation']}});return
        if path=='/api/v1/enquiries':
            requests.append(json.loads(route.request.post_data))
            if len(requests)==1:route.fulfill(status=503,json={'ok':False,'message':'Try again'})
            else:route.fulfill(status=201,json={'ok':True,'reference':'NS-1234567890ABCDEF'})
            return
        if path.startswith('/api/v1/admin/'):
            key=path.removeprefix('/api/v1/admin/')
            data={'ok':True}
            if key=='me':data.update(email='review@example.invalid',role='owner')
            elif key=='settings':data['settings']={'video':{'enabled':True,'url':'https://player.vimeo.com/video/1171310337?h=3416a6f4f5','posterMediaId':None},'services':{},'contact':{},'links':{}}
            elif key=='summary':data.update(openEnquiries=1,translationsToReview=1)
            elif key=='pages':data['pages']=[{'key':'home','locales':{l:{'status':'needs_review'} for l in ['uk','en','ar','ru']}}]
            elif key=='pages/home':
                locale=parse_qs(urlsplit(url).query).get('locale',['uk'])[0]
                content=json.loads(json.dumps(defaults[locale]['home']))
                content['fields'].update(hero='Test heading',hero_desc='Test description')
                if route.request.method=='PUT':
                    payload=json.loads(route.request.post_data)['payload'];saves.append(payload);saved_pages[locale]=payload
                    data.update(revision=len(saves))
                else:data.update(defaultContent=content,draft=saved_pages.get(locale),draftRevision=len(saves) or None,fieldSchema=json.loads((FIXTURES/(locale+'-schema.json')).read_text()),reviewStatus='ready')
            elif key=='enquiries':data['items']=[{'reference':'NS-1234567890ABCDEF','name':'Review visitor','email':'review@example.invalid','type':'lesson','status':'new','createdAt':'2026-11-15'}]
            elif key.startswith('enquiries/'):data.update(enquiry={'message':'Customer message is readable','details':{'goal':'Professional meetings'}},events=[{'created_at':'2026-11-15','event_type':'received','actor':'system'}])
            route.fulfill(json=data);return
        file=ROOT/('dist-admin' if admin else 'dist-public')/path.lstrip('/')
        if path.endswith('/'):file=file/'index.html'
        route.fulfill(path=str(file)) if file.is_file() else route.fulfill(status=404,body='Not found')
    page.route('**/*',serve)
    for locale in ['uk','en','ar','ru']:
        for width in [320,390,768,1440]:
            page.set_viewport_size({'width':width,'height':900})
            for route in ['', 'about/','lessons/','coaching/','translation/','contact/','privacy/']:
                page.goto(f'http://public.test/{locale}/{route}')
                assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),(locale,width,route,page.evaluate('[...document.querySelectorAll("body *")].filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>[e.tagName,e.className,e.textContent.slice(0,60)])'))
                assert page.locator('h1').count()==1
            if width==390:
                page.goto(f'http://public.test/{locale}/')
                page.screenshot(path=str(OUT/f'{locale}-mobile.png'),full_page=True)
                page.locator('.video-play').first.click()
                assert not page.locator('.video-art').first.is_visible(),'Poster obscures playing iframe'
                assert page.locator('[data-video] iframe').first.is_visible()
                assert page.locator('.video-fallback').first.is_visible()
    unavailable.add('arabic')
    page.goto('http://public.test/en/contact/?service=lesson&language=arabic')
    page.wait_for_function('document.querySelector("form").dataset.backendReady==="true"')
    assert page.locator('[name=language]').input_value()==''
    assert page.locator('[name=language] option[value=arabic]').evaluate('(option)=>option.disabled')
    assert not page.locator('[name=language]').evaluate('(el)=>el.checkValidity()')
    unavailable.clear()
    page.goto('http://public.test/en/contact/?service=lesson&language=arabic')
    page.wait_for_function('document.querySelector("form").dataset.backendReady==="true"')
    assert page.locator('[name=language]').input_value()=='arabic'
    ids=page.locator('[id]').evaluate_all('(els)=>els.map(e=>e.id)');assert len(ids)==len(set(ids))
    page.locator('[name=name]').fill('Test Visitor');page.locator('[name=email]').fill('qa@example.invalid')
    page.locator('[name=message]').fill('Please help with conversation lessons.');page.locator('[name=privacyAcknowledged]').check()
    page.evaluate("()=>{const e=document.createElement('input');e.name='cf-turnstile-response';e.value='test-token';document.querySelector('form').append(e)}")
    page.locator('[type=submit]').click();page.wait_for_function('document.querySelector("[name=name]").disabled')
    page.locator('[type=submit]').click();page.wait_for_function('document.querySelector("#enquiry-feedback").textContent.includes("NS-")')
    assert requests[0]==requests[1],'Ambiguous retry changed request identity or payload'
    assert not page.locator('[name=name]').is_disabled()
    page.goto('http://admin.test/')
    page.wait_for_function('document.querySelector(".demo-banner").textContent.includes("SECURE ADMIN")')
    page.locator('[data-view=enquiries]').click();page.get_by_role('button',name='Read enquiry').click()
    page.get_by_text('Message: Customer message is readable').wait_for(state='visible')
    assert page.get_by_text('Goal: Professional meetings').is_visible()
    page.screenshot(path=str(OUT/'admin-enquiry-mobile.png'),full_page=True)
    page.locator('[data-view=translations]').click();page.get_by_role('button',name='Українська — Needs review').wait_for(state='visible')
    page.locator('[data-view=pages]').click();page.wait_for_function('document.querySelector("#hero-title").value==="Test heading"&&!document.querySelector("#hero-title").disabled');page.locator('#hero-title').fill('Unsaved change')
    page.once('dialog',lambda d:d.dismiss());page.locator('#admin-page-select').select_option('about')
    assert page.locator('#admin-page-select').input_value()=='home'
    assert page.locator('#hero-title').input_value()=='Unsaved change'
    discard_dialogs=[]
    def accept_discard(dialog):
        discard_dialogs.append(dialog.message);dialog.accept()
    page.on('dialog',accept_discard)
    page.locator('[data-view=overview]').click()
    page.locator('[data-view=enquiries]').click()
    assert len(discard_dialogs)==1,'Confirmed discard left the editor dirty'
    for selector,value in [('#video-url','https://player.vimeo.com/video/1171310337?h=3416a6f4f5'),('#video-enabled',False),('#video-poster-id','approved-test-image')]:
        page.locator('[data-view=video]').click()
        page.locator('#video-poster-id').wait_for(state='visible')
        if selector=='#video-enabled':page.locator(selector).uncheck()
        else:page.locator(selector).fill(value+' ' if selector=='#video-url' else value)
        before=len(discard_dialogs)
        page.locator('[data-view=overview]').click()
        assert len(discard_dialogs)==before+1,'Video change did not warn on navigation'
    page.locator('[data-view=pages]').click()
    page.locator('#testimonials-enabled').wait_for(state='visible')
    assert not page.locator('#testimonials-enabled').is_checked()
    page.locator('#testimonials-enabled').check()
    page.locator('[data-content-key=review_yura_quote]').fill('Owner-approved review excerpt')
    page.locator('[data-review-media=reviewYuraScreenshot]').fill('approvedimage123')
    page.locator('#save-draft').click()
    page.wait_for_function('document.querySelector("#editor-message").textContent.includes("Saved draft: 1")')
    assert saves[-1]['testimonialsEnabled'] is True
    assert saves[-1]['fields']['review_yura_quote']=='Owner-approved review excerpt'
    assert saves[-1]['fields']['hero']=='Test heading'
    assert saves[-1]['media']['reviewYuraScreenshot']=='approvedimage123'
    page.locator('[data-review-media=reviewYuraScreenshot]').fill('')
    page.locator('#save-draft').click()
    page.wait_for_function('document.querySelector("#editor-message").textContent.includes("Saved draft: 2")')
    assert 'reviewYuraScreenshot' not in saves[-1]['media']
    page.locator('[data-locale=ar]').click()
    page.wait_for_function('document.querySelector("[data-content-key=review_yura_quote]").dir==="rtl"')
    for width in [390,1440]:
        page.set_viewport_size({'width':width,'height':900})
        assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),('admin',width)
        page.locator('.testimonial-editor').screenshot(path=str(OUT/f'admin-testimonials-{width}.png'))
    saved_pages['ru']={'fields':{'hero':'Test heading','proof_age':'Legacy owner evidence'},'media':{},'seo':{}}
    page.locator('[data-locale=ru]').click()
    page.wait_for_function('document.querySelector("[data-content-key=proof_0]").value==="Legacy owner evidence"')

    # These pages were rendered by the real Workers HTMLRewriter, not edited DOM fixtures.
    review_pages=True
    for locale in ['uk','en','ar','ru']:
        for width in [320,390,1440]:
            page.set_viewport_size({'width':width,'height':900})
            page.goto(f'http://public.test/{locale}/')
            assert page.locator('[data-nusya-testimonials]').is_visible()
            assert page.locator('[data-review-card]').count()==3
            assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),(locale,width,'testimonials')
            assert not image_requests,'Review images were loaded before opening the source'
            if width==390:
                page.add_script_tag(path=str(ROOT.parent/'workers'/'node_modules'/'axe-core'/'axe.min.js'))
                violations=page.evaluate('''async()=>{const result=await axe.run(document.querySelector('[data-nusya-testimonials]'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}));}''')
                assert not violations,(locale,'testimonials accessibility',violations)
            if width in [390,1440]:
                page.locator('[data-nusya-testimonials]').screenshot(path=str(OUT/f'testimonials-{locale}-{width}.png'),style='.site-header,.skip-link{visibility:hidden!important}')
    source=page.locator('[data-review-image=reviewYuraScreenshot]')
    source.focus();page.keyboard.press('Enter')
    page.locator('[data-review-image-target]').wait_for(state='visible')
    assert len(image_requests)==1
    assert page.locator('[data-review-close]').evaluate('(el)=>el===document.activeElement')
    page.keyboard.press('Shift+Tab')
    assert page.locator('[data-review-dialog]').evaluate('(el)=>el.contains(document.activeElement)')
    page.keyboard.press('Escape')
    assert not page.locator('[data-review-dialog]').is_visible()
    assert source.evaluate('(el)=>el===document.activeElement')
    page.locator('[data-review-image=reviewMScreenshot]').click()
    page.locator('[data-review-error]').wait_for(state='visible')
    assert page.locator('[data-review-card=m] blockquote').is_visible()
    page.locator('[data-review-close]').click()
    nojs=browser.new_context(java_script_enabled=False)
    nojs.route('**/*',serve)
    fallback=nojs.new_page();fallback.goto('http://public.test/en/')
    assert fallback.locator('[data-review-image=reviewYuraScreenshot]').get_attribute('href')=='/media/approvedimage123'
    fallback.locator('[data-review-image=reviewYuraScreenshot]').click()
    fallback.wait_for_url('**/media/approvedimage123')
    nojs.close()
    assert not errors,errors
    browser.close()
print('PASS: responsive pages, CMS review editing/media removal/RTL, native testimonial output, lazy screenshots, dialog keyboard/failure/no-JS, forms, inbox and unsaved edits')
