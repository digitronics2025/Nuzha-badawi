"""Responsive WCAG and owner workflow checks over isolated synthetic browser data."""
from pathlib import Path
import json, os, re, shutil
from playwright.sync_api import sync_playwright
from review_fixture import ReviewFixture

ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('NUSYA_QA_DIR','/tmp/nusya-verified'));OUT.mkdir(parents=True,exist_ok=True)
AXE=ROOT.parent/'workers/node_modules/axe-core/axe.min.js'
fixture=ReviewFixture(ROOT)
results=[];violations=[];errors=[];requests=[]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
 context=browser.new_context(viewport={'width':390,'height':900},reduced_motion='reduce')
 context.route('**/*',fixture.serve)
 page=context.new_page();page.on('pageerror',lambda error:errors.append(str(error)));page.on('request',lambda request:requests.append(request.url))
 def ready():page.wait_for_function('document.querySelector("form").dataset.backendReady==="true"')
 def admin(view):
  nav=page.locator(f'[data-view={view}]')
  if not nav.is_visible():page.get_by_role('button',name='Toggle admin navigation').click()
  nav.click();page.wait_for_timeout(100)
 def audit(name):
  page.evaluate('document.fonts.ready')
  for y in range(0,page.evaluate('document.body.scrollHeight'),1000):page.evaluate('(y)=>scrollTo(0,y)',y)
  page.evaluate('scrollTo(0,0)');page.wait_for_timeout(60)
  assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),name
  page.add_script_tag(path=str(AXE))
  issues=page.evaluate("""async()=>{const result=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return result.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));}""")
  if issues:violations.append({'page':name,'issues':issues})
  results.append(name)
 for locale in ['uk','en','ar','ru']:
  for width in [390,1440]:
   page.set_viewport_size({'width':width,'height':1000})
   for route in ['','about/','lessons/','coaching/','translation/','contact/','privacy/','404.html']:
    page.goto(f'http://public.test/{locale}/{route}')
    if route=='contact/':ready()
    assert page.locator('html').get_attribute('lang')==locale
    assert page.locator('h1').count()==1
    if locale=='ar':assert page.locator('html').get_attribute('dir')=='rtl'
    audit(f'{locale}/{route or "home"}@{width}')
  print(f'Public accessibility checked: {locale}',flush=True)
 page.set_viewport_size({'width':390,'height':900})
 page.goto('http://public.test/uk/')
 assert not any('vimeo.com' in url for url in requests)
 page.get_by_role('button',name=page.locator('.menu-toggle').get_attribute('aria-label')).click()
 assert page.locator('.mobile-menu a').first.evaluate('(el)=>el===document.activeElement')
 page.keyboard.press('Escape');assert page.locator('.menu-toggle').evaluate('(el)=>el===document.activeElement')
 assert page.locator('.menu-toggle').get_attribute('aria-expanded')=='false'
 page.locator('.video-play').click();assert page.locator('[data-video] iframe').is_visible();assert page.locator('.video-fallback').is_visible()
 assert 'h=3416a6f4f5' in page.locator('[data-video] iframe').get_attribute('src')
 page.goto('http://public.test/ar/contact/?service=lesson&language=arabic');ready()
 assert page.locator('[name=language]').input_value()=='arabic'
 assert 'service=lesson' in page.locator('.lang-link[lang=en]').first.get_attribute('href')
 page.locator('[type=submit]').click()
 assert page.locator('[aria-invalid=true]').count()>0
 assert page.locator('#enquiry-feedback').inner_text()=='يرجى التحقق من الحقول المحددة.'
 page.locator('[name=name]').fill('Synthetic visitor');page.locator('[name=email]').fill('visitor@example.invalid');page.locator('[name=message]').fill('A synthetic request about language lessons.');page.locator('[name=privacyAcknowledged]').check()
 page.evaluate("()=>{const token=document.createElement('input');token.name='cf-turnstile-response';token.value='synthetic-token';document.querySelector('form').append(token)}")
 fixture.failures[('POST','/api/v1/enquiries')]=(503,'SERVICE_UNAVAILABLE')
 page.locator('[type=submit]').click();page.wait_for_function('document.querySelector("[name=name]").disabled')
 assert page.locator('[name=name]').input_value()=='Synthetic visitor'
 # The retry must carry the same immutable request identity and payload.
 pending=page.evaluate('document.querySelector("form")._pendingRequest')
 fixture.failures.clear();page.locator('[type=submit]').click();page.wait_for_function('document.querySelector("#enquiry-feedback").textContent.includes("NS-")')
 assert fixture.enquiries[-1]==pending
 assert not page.locator('[name=name]').is_disabled()
 assert page.locator('#enquiry-feedback').get_attribute('role')=='status'
 page.goto('http://admin.test/');page.wait_for_function('document.querySelector(".demo-banner").textContent.includes("SECURE ADMIN")')
 for width in [390,1440]:
  page.set_viewport_size({'width':width,'height':1000})
  for view in ['overview','pages','translations','services','video','enquiries','settings']:
   admin(view)
   if view=='pages':page.wait_for_function('!document.querySelector("#hero-title").disabled')
   if view=='enquiries':page.get_by_role('button',name='Read enquiry').click();page.get_by_text('Internal note',exact=True).wait_for()
   audit(f'admin/{view}@{width}')
  print(f'Admin accessibility checked: {width}',flush=True)
 (OUT/'accessibility.json').write_text(json.dumps({'audited':results,'violations':violations,'browserErrors':errors},ensure_ascii=False,indent=2)+'\n')
 admin('pages');page.wait_for_function('!document.querySelector("#hero-title").disabled')
 page.locator('[data-locale=uk]').focus();page.keyboard.press('ArrowRight')
 page.wait_for_function('document.querySelector("#hero-title").lang==="en"&&!document.querySelector("#hero-title").disabled')
 page.keyboard.press('ArrowRight');page.wait_for_function('document.querySelector("#hero-title").dir==="rtl"&&!document.querySelector("#hero-title").disabled')
 assert page.locator('#source-heading').get_attribute('lang')=='en'
 assert page.locator('#publish-page').is_disabled()
 page.locator('#hero-title').fill('Preserved draft after conflict')
 fixture.failures[('PUT','/api/v1/admin/pages/home')]=(409,'EDIT_CONFLICT')
 page.locator('#save-draft').click();page.wait_for_function('document.querySelector("#workspace-feedback").dataset.kind==="error"')
 page.wait_for_timeout(4700)
 assert page.locator('#workspace-feedback').is_visible()
 assert page.locator('#hero-title').input_value()=='Preserved draft after conflict'
 page.once('dialog',lambda d:d.dismiss());page.locator('[data-locale=uk]').click()
 assert page.locator('[data-locale=ar]').get_attribute('aria-selected')=='true'
 fixture.failures.clear();page.locator('#save-draft').click();page.wait_for_function('document.querySelector("#editor-dirty").textContent==="No unsaved changes"')
 page.get_by_role('button',name='Approve translation').click();page.wait_for_function('!document.querySelector("#publish-page").disabled')
 page.once('dialog',lambda d:d.accept());page.locator('#publish-page').click();page.wait_for_function('document.querySelector("#workspace-feedback").textContent.includes("Published revision")')
 page.get_by_role('button',name='History / rollback').click();page.locator('#revision-history').wait_for()
 restores=page.get_by_role('button',name='Restore published revision');assert restores.nth(0).is_disabled();assert restores.nth(1).is_enabled()
 admin('video');page.locator('#video-enabled').wait_for();page.locator('#video-url').fill('https://player.vimeo.com/video/1171310337?h=3416a6f4f5 ')
 page.locator('[name=file]').set_input_files(str(ROOT/'src/assets/nozha-portrait-optimized.webp'))
 page.locator('[name=altText]').fill('Synthetic fixture illustration');page.locator('[name=source]').fill('Existing disclosed studio artwork; local test only')
 page.get_by_role('button',name='Upload privately').click();page.get_by_text('Private media ID:',exact=False).wait_for()
 assert ('POST','/api/v1/admin/media/review_private_image/publish') not in fixture.calls
 # Saving the upload must not clear unsaved video settings.
 page.once('dialog',lambda d:d.dismiss());page.locator('[data-view=overview]').click();assert page.locator('#view-video').is_visible()
 page.locator('#save-video').click();page.wait_for_function('document.querySelector("#workspace-feedback").textContent.includes("Settings published")')
 admin('enquiries');page.get_by_role('button',name='Read enquiry').click();page.get_by_text('Internal note',exact=True).wait_for()
 note=page.locator('[data-enquiry-note]');note.fill('Keep this note while opening and closing the detail.')
 page.get_by_role('button',name='Read enquiry').click();page.get_by_role('button',name='Read enquiry').click();assert note.input_value().startswith('Keep this note')
 page.once('dialog',lambda d:d.dismiss());page.locator('[data-view=overview]').click();assert page.locator('#view-enquiries').is_visible()
 page.get_by_role('button',name='Update status').click();page.wait_for_function('document.querySelector("#workspace-feedback").textContent.includes("updated.")')
 fixture.role='editor';page.goto('http://admin.test/');page.wait_for_function('document.querySelector(".demo-banner").textContent.includes("EDITOR")')
 admin('services');page.get_by_role('button',name='Publish service settings').wait_for();assert page.get_by_role('button',name='Publish service settings').is_disabled()
 admin('pages');page.wait_for_function('!document.querySelector("#hero-title").disabled');assert page.locator('#publish-page').is_disabled()
 fixture.failures[('GET','/api/v1/admin/me')]=(401,'AUTH_REQUIRED');page.goto('http://admin.test/');page.wait_for_function('document.querySelector(".status-chip").textContent.includes("Sign-in")')
 assert page.locator('#save-draft').is_disabled()
 fixture.failures.clear()
 # JavaScript-free content and dynamic reduced-motion changes.
 nojs=browser.new_context(java_script_enabled=False,viewport={'width':320,'height':900});nojs.route('**/*',fixture.serve);static=nojs.new_page();static.goto('http://public.test/ar/')
 assert static.locator('h1').is_visible();assert static.locator('.guide-card').first.is_visible();assert static.locator('.experience-timeline').is_visible();nojs.close()
 motion=context.new_page();motion.emulate_media(reduced_motion='no-preference');motion.goto('http://public.test/en/');assert 'motion-on' in motion.locator('html').get_attribute('class');motion.emulate_media(reduced_motion='reduce');motion.wait_for_function('!document.documentElement.classList.contains("motion-on")')
 assert motion.locator('.connection-route path').evaluate('(el)=>getComputedStyle(el).animationName')=='none';motion.close()
 assert not errors,errors
 browser.close()
(OUT/'accessibility.json').write_text(json.dumps({'audited':results,'violations':violations,'browserErrors':errors,'data':'synthetic API fixture; no production writes'},ensure_ascii=False,indent=2)+'\n')
if violations:raise AssertionError(json.dumps(violations,ensure_ascii=False,indent=2))
print(f'PASS: {len(results)} responsive WCAG audits, localized errors, immutable retry, keyboard, roles, draft/review/publish/history, media separation, unsaved notes and no-JS/reduced-motion checks')
