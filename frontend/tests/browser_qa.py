"""Isolated Chromium visual/interaction QA using inline assets.
The runtime blocks all external navigations, including localhost; therefore this
inspects actual generated HTML/CSS/JS with page.set_content on about:blank.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'qa';OUT.mkdir(exist_ok=True)
public_css=(ROOT/'dist-public/assets/site.css').read_text()
public_js=(ROOT/'dist-public/assets/site.js').read_text()
admin_css=(ROOT/'dist-admin/assets/admin.css').read_text()
admin_js=(ROOT/'dist-admin/assets/admin.js').read_text()

def load(page,source,css,js):
    html=source.read_text()
    html=html.replace('<link rel="stylesheet" href="/assets/site.css">','').replace('<script type="module" src="/assets/site.js"></script>','')
    html=html.replace('<link rel="stylesheet" href="/assets/admin.css">','').replace('<script src="/assets/admin.js" type="module"></script>','')
    page.set_content(html,wait_until='domcontentloaded')
    page.add_style_tag(content=css)
    page.add_script_tag(content=js)

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    for locale in ('en','ar','ru'):
        for mode,w,h in [('desktop',1440,900),('mobile',390,844)]:
            page=browser.new_page(viewport={'width':w,'height':h},device_scale_factor=1,reduced_motion='reduce')
            issues=[];page.on('pageerror',lambda e:issues.append(str(e)))
            load(page,ROOT/f'dist-public/{locale}/index.html',public_css,public_js)
            page.screenshot(path=str(OUT/f'{locale}-{mode}.png'),full_page=True,animations='disabled')
            overflow=page.evaluate('document.documentElement.scrollWidth > window.innerWidth')
            print(f'{locale}/{mode}: h1={page.locator("h1").inner_text()[:48]!r}, overflow={overflow}, errors={issues}')
            if locale=='en' and mode=='mobile':
                button=page.locator('.menu-toggle');button.click()
                print('  menu displayed:',page.locator('#mobile-menu').evaluate('(e)=>getComputedStyle(e).display'))
                page.keyboard.press('Escape')
                print('  menu closed:',page.locator('#mobile-menu').evaluate('(e)=>getComputedStyle(e).display'))
            page.close()
    page=browser.new_page(viewport={'width':390,'height':844})
    load(page,ROOT/'dist-public/en/contact/index.html',public_css,public_js)
    page.locator('[name="name"]').fill('Example Visitor')
    page.locator('[name="email"]').fill('sample@example.invalid')
    page.locator('[name="message"]').fill('Please share information about lessons.')
    page.locator('[name="privacyAcknowledged"]').check()
    page.locator('[type="submit"]').click()
    page.wait_for_timeout(500)
    print('form outcome:',page.locator('#enquiry-feedback').inner_text()[:160])
    page.screenshot(path=str(OUT/'contact-mobile.png'),full_page=True)
    page.close()
    page=browser.new_page(viewport={'width':1440,'height':900})
    load(page,ROOT/'dist-admin/index.html',admin_css,admin_js)
    page.screenshot(path=str(OUT/'admin-desktop.png'),full_page=True)
    page.locator('[data-view="pages"]').click()
    page.locator('#hero-title').fill('Preview headline change')
    page.locator('#preview-content').click()
    print('admin editor preview:',page.locator('#preview-heading').inner_text())
    page.screenshot(path=str(OUT/'admin-editor.png'),full_page=True)
    page.close()
    browser.close()
