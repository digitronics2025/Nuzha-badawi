"""Static output and security contract tests. Run with `npm test`."""
import sys,unittest,xml.etree.ElementTree as ET
from pathlib import Path
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'src'/'content'))
from site_copy import COPY,LOCALES
DIST=ROOT/'dist-public'

class Parser(HTMLParser):
    def __init__(self):super().__init__();self.tags=[]
    def handle_starttag(self,tag,attrs):self.tags.append((tag,dict(attrs)))

class FrontendBuildTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        from subprocess import run
        run([sys.executable,str(ROOT/'scripts'/'build.py')],check=True,stdout=-1)
    def test_locales_have_same_complete_keys(self):
        for loc in LOCALES:self.assertEqual(set(COPY['en']),set(COPY[loc]))
    def test_all_routes_and_languages(self):
        for loc in LOCALES:
            for page in ['home','about','lessons','coaching','translation','contact','privacy']:
                source=DIST/loc/(page if page!='home' else '')/'index.html'
                self.assertTrue(source.exists(),str(source))
                text=source.read_text(encoding='utf8')
                self.assertIn(f'lang="{loc}"',text)
                self.assertIn('dir="rtl"' if loc=='ar' else 'dir="ltr"',text)
                self.assertIn('<main id="main"',text)
                self.assertIn('rel="canonical"',text)
                self.assertIn('hreflang="en"',text)
                self.assertIn('hreflang="ar"',text)
                self.assertIn('hreflang="ru"',text)
                self.assertIn('/assets/site.css',text)
                self.assertNotIn('Korean',text)
                self.assertNotIn('корейск',text.lower())
    def test_video_is_click_to_load(self):
        s=(DIST/'en'/'index.html').read_text()
        self.assertIn('1171310337?h=3416a6f4f5',s)
        self.assertNotIn('<iframe',s)
        self.assertIn('data-video',s)
    def test_no_contact_success_before_backend(self):
        s=(DIST/'en'/'contact'/'index.html').read_text()
        self.assertIn('Frontend preview:',s)
        self.assertIn('id="enquiry-form"',s)
        self.assertIn('role="status"',s)
    def test_social_links_are_external_safe(self):
        s=(DIST/'en'/'index.html').read_text()
        self.assertIn('rel="noopener noreferrer"',s)
    def test_sitemap_has_only_complete_locales(self):
        s=(DIST/'sitemap.xml').read_text()
        root=ET.fromstring(s)
        locs=[x.text for x in root.iter() if x.tag.endswith('loc')]
        self.assertEqual(len(locs),21)
        self.assertTrue(all('/en/' in x or '/ar/' in x or '/ru/' in x for x in locs))
    def test_admin_is_separate_and_private_by_design(self):
        a=ROOT/'dist-admin'
        self.assertTrue((a/'index.html').exists())
        self.assertTrue((a/'robots.txt').read_text().find('Disallow: /')!=-1)
        self.assertFalse((DIST/'admin'/'index.html').exists())
        self.assertIn('NO AUTHENTICATION', (a/'index.html').read_text())
    def test_html_structure(self):
        for loc in LOCALES:
            for page in ['home','about','contact']:
                s=(DIST/loc/(page if page!='home' else '')/'index.html').read_text()
                p=Parser();p.feed(s)
                self.assertEqual(len([t for t,a in p.tags if t=='h1']),1)
                self.assertEqual(len([t for t,a in p.tags if t=='main']),1)
    def test_output_payload(self):
        css=(DIST/'assets'/'site.css').stat().st_size
        js=(DIST/'assets'/'site.js').stat().st_size
        self.assertLess(css,46000)
        self.assertLess(js,12000)

if __name__=='__main__':unittest.main()
