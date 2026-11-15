"""Capture inspectable design boards from isolated assets and synthetic API data."""
import argparse, json, sys, os, shutil
from pathlib import Path
from html import escape
from playwright.sync_api import sync_playwright
from pypdf import PdfWriter
from review_fixture import ReviewFixture

parser=argparse.ArgumentParser()
parser.add_argument('--root',default=str(Path(__file__).resolve().parents[1]))
parser.add_argument('--output',default='/workspace/artifacts/nusya-design')
parser.add_argument('--quick',action='store_true')
args=parser.parse_args();root=Path(args.root);out=Path(args.output);out.mkdir(parents=True,exist_ok=True)
fixture=ReviewFixture(root);boards=[];pdfs=[]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':1000},reduced_motion='reduce')
 page.route('**/*',fixture.serve)
 errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
 def capture(name,viewport_only=False):
  page.evaluate('document.fonts.ready');height=page.evaluate('document.body.scrollHeight')
  if not viewport_only:
   for y in range(0,height,900):page.evaluate('(y)=>scrollTo(0,y)',y);page.wait_for_timeout(25)
  page.evaluate("async()=>{await Promise.all([...document.images].map(img=>{img.loading='eager';return img.decode().catch(()=>null)}))}");page.evaluate('scrollTo(0,0)');page.wait_for_timeout(80)
  file=name+'.png';page.screenshot(path=str(out/file),full_page=not viewport_only)
  pdf=out/(name+'.pdf');print_style=page.add_style_tag(content=f'.sidebar{{height:{page.viewport_size["height"]}px!important}} .admin-layout{{min-height:0!important}} *{{print-color-adjust:exact}}');page.pdf(path=str(pdf),width=str(page.viewport_size['width'])+'px',height=str(page.viewport_size['height'] if viewport_only else height+2)+'px',print_background=True,page_ranges='1');print_style.evaluate('(el)=>el.remove()')
  pdfs.append(pdf)
  overflow=page.evaluate('document.documentElement.scrollWidth>innerWidth')
  boards.append({'name':name,'file':file,'width':page.viewport_size['width'],'overflow':overflow})
  print(name,'overflow='+str(overflow),flush=True)
 for locale in (['uk','ar'] if args.quick else ['uk','en','ar','ru']):
  for width in [1440,390]:
   page.set_viewport_size({'width':width,'height':1000})
   for route in ([''] if args.quick else ['','about/','lessons/','coaching/','translation/','contact/','privacy/','404.html']):
    page.goto(f'http://public.test/{locale}/{route}')
    capture(f'{locale}-{route.strip("/").replace(".html","") or "home"}-{width}')
 for width in [1440,390]:
  page.set_viewport_size({'width':width,'height':1000});page.goto('http://admin.test/')
  page.wait_for_function('document.querySelector(".demo-banner").textContent.includes("SECURE ADMIN")')
  for view in (['overview','pages'] if args.quick else ['overview','pages','translations','services','video','enquiries','settings']):
   page.locator(f'[data-view="{view}"]').evaluate('(e)=>e.click()')
   page.wait_for_timeout(180)
   if view=='pages':page.wait_for_function('!document.querySelector("#hero-title").disabled')
   if view=='enquiries':page.get_by_role('button',name='Read enquiry').click();page.get_by_text('Internal note',exact=True).wait_for()
   capture(f'admin-{view}-{width}')
  if not args.quick:
   page.locator('[data-view=pages]').evaluate('(e)=>e.click()');page.wait_for_function('!document.querySelector("#hero-title").disabled')
   for locale in ['en','ar','ru']:
    page.locator(f'[data-locale={locale}]').click();page.wait_for_timeout(150);page.wait_for_function('!document.querySelector("#hero-title").disabled');capture(f'admin-editor-{locale}-{width}')
   page.get_by_role('button',name='History / rollback').click();page.locator('#revision-history').wait_for();capture(f'admin-history-{width}')
   fixture.failures[('PUT','/api/v1/admin/pages/home')]=(409,'EDIT_CONFLICT')
   page.locator('#hero-title').fill('Preserved local draft');page.locator('#save-draft').click();page.get_by_text('Your unsaved input is preserved.',exact=False).wait_for();capture(f'admin-conflict-{width}')
   fixture.failures.clear();page.once('dialog',lambda d:d.accept());page.locator('[data-view=overview]').evaluate('(e)=>e.click()')
   fixture.failures[('GET','/api/v1/admin/summary')]=(503,'SERVICE_UNAVAILABLE');page.locator('[data-view=overview]').evaluate('(e)=>e.click()');page.get_by_text('Connection unavailable',exact=True).wait_for();capture(f'admin-connection-error-{width}');fixture.failures.clear()
 if not args.quick:
  page.set_viewport_size({'width':390,'height':900})
  page.goto('http://public.test/uk/contact/?service=lesson&language=english');page.wait_for_function('document.querySelector("form").dataset.backendReady==="true"')
  page.locator('[type=submit]').click();capture('uk-contact-validation')
  page.locator('[name=name]').fill('Synthetic visitor');page.locator('[name=email]').fill('visitor@example.invalid');page.locator('[name=message]').fill('A synthetic lesson enquiry for design review.');page.locator('[name=privacyAcknowledged]').check()
  page.evaluate("()=>{const e=document.createElement('input');e.name='cf-turnstile-response';e.value='synthetic-token';document.querySelector('form').append(e)}")
  fixture.failures[('POST','/api/v1/enquiries')]=(503,'SERVICE_UNAVAILABLE');page.locator('[type=submit]').click();page.wait_for_function('document.querySelector("[name=name]").disabled');capture('uk-contact-retry');fixture.failures.clear()
  pending=[];page.route('**/api/v1/enquiries',lambda route:pending.append(route));page.locator('[type=submit]').click();page.wait_for_function('document.querySelector("form").getAttribute("aria-busy")==="true"');capture('uk-contact-loading')
  pending[0].fulfill(status=201,json={'ok':True,'reference':'NS-1234567890ABCDEF','notificationStatus':'pending'});page.wait_for_function('document.querySelector("#enquiry-feedback").textContent.includes("NS-")');capture('uk-contact-success');page.unroute('**/api/v1/enquiries')
  fixture.empty_inbox=True;page.goto('http://admin.test/');page.wait_for_function('document.querySelector(".demo-banner").textContent.includes("SECURE ADMIN")');page.locator('[data-view=enquiries]').evaluate('(e)=>e.click()');page.get_by_text('No enquiries match this view.',exact=False).wait_for();capture('admin-enquiries-empty');fixture.empty_inbox=False
  fixture.failures[('GET','/api/v1/admin/me')]=(401,'AUTH_REQUIRED');page.goto('http://admin.test/');page.wait_for_function('document.querySelector(".status-chip").textContent.includes("Sign-in")');capture('admin-sign-in-required');fixture.failures.clear()
  page.goto('http://public.test/uk/');page.locator('[data-video]').evaluate('(el)=>el.dataset.vimeo="invalid"');page.locator('.video-play').click();page.locator('.video-error').wait_for();capture('uk-video-fallback')
  page.set_viewport_size({'width':1440,'height':1000});page.emulate_media(reduced_motion='no-preference');page.goto('http://public.test/en/');page.evaluate('document.fonts.ready')
  for time in [0,140,220,280,420,640,900]:
   page.evaluate('(time)=>document.getAnimations().forEach(a=>{a.pause();a.currentTime=time})',time);capture(f'motion-{time:03d}ms',viewport_only=True)
  page.emulate_media(reduced_motion='reduce');capture('motion-reduced',viewport_only=True)
  page.keyboard.press('Tab');capture('keyboard-focus',viewport_only=True)
 if errors:raise AssertionError(errors)
 browser.close()

intro='<h1>NUSYA · The Art of Connection</h1><p>Autonomously selected reference designs. Public pages use existing approved facts and unchanged illustration assets. Admin boards use synthetic data and do not establish production authentication or delivery.</p>'
links=''.join(f'<article><h2>{escape(board["name"])}</h2><a href="{board["file"]}"><img src="{board["file"]}" loading="lazy" alt="Full-page design: {escape(board["name"])}"></a><p><a href="{board["file"]}">Open full-size board</a></p></article>' for board in boards)
style='body{background:#f8f4ee;color:#37231d;font:16px/1.6 system-ui;margin:40px}h1{font:48px Georgia}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px}article{background:#fffaf4;border:1px solid #dfd0c2;border-radius:12px;padding:20px}img{width:100%;max-height:700px;object-fit:contain;object-position:top}a{color:inherit}@media print{article{break-inside:avoid}img{max-height:900px}}'
(out/'index.html').write_text(f'<!doctype html><html lang="en"><meta charset="utf-8"><title>NUSYA design gallery</title><style>{style}</style>{intro}<p><a href="review-package.pdf">Open the full PDF review package</a></p><main>{links}</main></html>')
(out/'manifest.json').write_text(json.dumps({'fixture':True,'boards':boards,'errors':errors},indent=2)+'\n')
writer=PdfWriter()
for pdf in pdfs:writer.append(str(pdf))
writer.compress_identical_objects(remove_duplicates=True,remove_unreferenced=True)
writer.write(str(out/'review-package.pdf'));writer.close()
for pdf in pdfs:pdf.unlink()
print(f'Gallery: {out}/index.html; {len(boards)} boards and PDF package',flush=True)
