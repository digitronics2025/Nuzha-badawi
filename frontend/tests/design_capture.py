"""Capture inspectable design boards from isolated assets and synthetic API data."""
import argparse, json, sys, os, shutil
from pathlib import Path
from html import escape
from playwright.sync_api import sync_playwright
from review_fixture import ReviewFixture

parser=argparse.ArgumentParser()
parser.add_argument('--root',default=str(Path(__file__).resolve().parents[1]))
parser.add_argument('--output',default='/workspace/artifacts/nusya-design')
parser.add_argument('--quick',action='store_true')
args=parser.parse_args();root=Path(args.root);out=Path(args.output);out.mkdir(parents=True,exist_ok=True)
fixture=ReviewFixture(root);boards=[]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':1000},reduced_motion='reduce')
 page.route('**/*',fixture.serve)
 errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
 def capture(name):
  page.evaluate('document.fonts.ready');height=page.evaluate('document.body.scrollHeight')
  for y in range(0,height,900):page.evaluate('(y)=>scrollTo(0,y)',y);page.wait_for_timeout(25)
  page.evaluate('scrollTo(0,0)');page.wait_for_timeout(80)
  file=name+'.png';page.screenshot(path=str(out/file),full_page=True)
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
 if errors:raise AssertionError(errors)
 browser.close()

intro='<h1>NUSYA · The Art of Connection</h1><p>Autonomously selected reference designs. Public pages use existing approved facts and unchanged illustration assets. Admin boards use synthetic data and do not establish production authentication or delivery.</p>'
links=''.join(f'<article><h2>{escape(board["name"])}</h2><a href="{board["file"]}"><img src="{board["file"]}" loading="lazy" alt="Full-page design: {escape(board["name"])}"></a><p><a href="{board["file"]}">Open full-size board</a></p></article>' for board in boards)
style='body{background:#f8f4ee;color:#37231d;font:16px/1.6 system-ui;margin:40px}h1{font:48px Georgia}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px}article{background:#fffaf4;border:1px solid #dfd0c2;border-radius:12px;padding:20px}img{width:100%;max-height:700px;object-fit:contain;object-position:top}a{color:inherit}@media print{article{break-inside:avoid}img{max-height:900px}}'
(out/'index.html').write_text(f'<!doctype html><html lang="en"><meta charset="utf-8"><title>NUSYA design gallery</title><style>{style}</style>{intro}<main>{links}</main></html>')
(out/'manifest.json').write_text(json.dumps({'fixture':True,'boards':boards,'errors':errors},indent=2)+'\n')
print(f'Gallery: {out}/index.html; {len(boards)} boards',flush=True)
