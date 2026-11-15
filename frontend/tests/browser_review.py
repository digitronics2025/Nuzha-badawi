"""Browser regressions over built assets and mocked APIs; no external writes.
Run after build: python3 frontend/tests/browser_review.py (Playwright + Chromium).
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json, os, shutil
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('NUSYA_QA_DIR','/tmp/nusya-review/verified'));OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':390,'height':844},reduced_motion='reduce')
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    requests=[]
    def serve(route):
        url=route.request.url
        if not url.startswith('http://public.test') and not url.startswith('http://admin.test'):
            route.abort();return
        admin=url.startswith('http://admin.test');path=url.split('.test',1)[1].split('?')[0]
        if path=='/api/v1/config':
            route.fulfill(json={'ready':True,'turnstileSiteKey':'test','approvedTranslationPairs':['en:ru'],'services':{k:{'visible':True,'acceptingRequests':True} for k in ['english','russian','arabic','coaching','translation','interpretation']}});return
        if path=='/api/v1/enquiries':
            requests.append(json.loads(route.request.post_data))
            if len(requests)==1:route.fulfill(status=503,json={'ok':False,'message':'Try again'})
            else:route.fulfill(status=201,json={'ok':True,'reference':'NS-1234567890ABCDEF'})
            return
        if path.startswith('/api/v1/admin/'):
            key=path.removeprefix('/api/v1/admin/')
            data={'ok':True}
            if key=='me':data.update(email='review@example.invalid',role='owner')
            elif key=='summary':data.update(openEnquiries=1,translationsToReview=1)
            elif key=='pages':data['pages']=[{'key':'home','locales':{l:{'status':'needs_review'} for l in ['uk','en','ar','ru']}}]
            elif key=='pages/home':data.update(defaultContent={'fields':{'hero':'Test heading','hero_desc':'Test description'}},fieldSchema={'hero':{'maxLength':260}},reviewStatus='ready')
            elif key=='enquiries':data['items']=[{'reference':'NS-1234567890ABCDEF','name':'Review visitor','email':'review@example.invalid','type':'lesson','status':'new','createdAt':'2026-11-15'}]
            elif key.startswith('enquiries/'):data.update(enquiry={'message':'Customer message is readable','details':{'goal':'Professional meetings'}},events=[{'created_at':'2026-11-15','event_type':'received','actor':'system'}])
            route.fulfill(json=data);return
        file=ROOT/('dist-admin' if admin else 'dist-public')/path.lstrip('/')
        if path.endswith('/'):file=file/'index.html'
        route.fulfill(path=str(file)) if file.is_file() else route.fulfill(status=404,body='Not found')
    page.route('**/*',serve)
    for locale in ['uk','en','ar','ru']:
        for width in [320,390,1440]:
            page.set_viewport_size({'width':width,'height':900})
            for route in ['', 'about/','lessons/','coaching/','translation/','contact/','privacy/']:
                page.goto(f'http://public.test/{locale}/{route}')
                assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),(locale,width,route,page.evaluate('[...document.querySelectorAll("body *")].filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>[e.tagName,e.className,e.textContent.slice(0,60)])'))
                assert page.locator('h1').count()==1
            if width==390:
                page.goto(f'http://public.test/{locale}/')
                page.screenshot(path=str(OUT/f'{locale}-mobile.png'),full_page=True)
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
    assert page.get_by_text('goal: Professional meetings').is_visible()
    page.screenshot(path=str(OUT/'admin-enquiry-mobile.png'),full_page=True)
    page.locator('[data-view=translations]').click();page.get_by_role('button',name='Українська — needs_review').wait_for(state='visible')
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
    assert not errors,errors
    browser.close()
print('PASS: 84 responsive page checks, four-language screenshots, unique form IDs, preselection, immutable retry, readable inbox, Ukrainian review and unsaved-edit protection')
