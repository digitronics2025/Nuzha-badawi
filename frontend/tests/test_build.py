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
        self.assertIn(COPY['en']['form_info'],s)
        self.assertNotIn('Frontend preview:',s)
        self.assertNotIn('backend service is not yet connected',s)
        self.assertIn('id="enquiry-form"',s)
        self.assertIn('role="status"',s)
    def test_cv_experience_is_present_without_private_contact_data(self):
        from html import unescape
        institutions=('GoSchool','Mozhlyvist','ABC All About Children','Alsafir Group')
        for loc in LOCALES:
            about=unescape((DIST/loc/'about'/'index.html').read_text(encoding='utf8'))
            self.assertEqual(len(COPY[loc]['journey']),7)
            for item in institutions:
                self.assertIn(item,about,(loc,item))
            for year in ('2019','2021','2022','2023','2026'):
                self.assertIn(year,about,(loc,year))
            self.assertNotIn('nusyagemini@gmail.com',about)
            self.assertNotIn('+46 707 454 395',about)
            self.assertNotIn('+380 955 247 536',about)
            contact=unescape((DIST/loc/'contact'/'index.html').read_text(encoding='utf8'))
            self.assertIn(COPY[loc]['form_info'],contact)
            self.assertNotIn(COPY[loc]['form_error'],about)

    def test_editorial_media_assets_exist_and_are_localized(self):
        assets=DIST/'assets'
        for name in ('nozha-portrait-optimized.webp','nusya-introduction-cover-optimized.webp'):
            path=assets/name
            self.assertTrue(path.is_file(),name)
            self.assertLess(path.stat().st_size,120_000,name)
            data=path.read_bytes()
            self.assertGreater(len(data),1000,name)
            self.assertEqual(data[:4],b'RIFF',name)
            self.assertEqual(data[8:12],b'WEBP',name)
        for loc in LOCALES:
            for page in ('home','about'):
                html=(DIST/loc/('' if page=='home' else 'about')/'index.html').read_text(encoding='utf8')
                self.assertIn('/assets/nozha-portrait-optimized.webp',html,(loc,page))
                self.assertIn('/assets/nusya-introduction-cover-optimized.webp',html,(loc,page))
                self.assertIn('portrait-concept-disclosure',html,(loc,page))
                self.assertIn('data-nusya-media=',html,(loc,page))
                self.assertIn('data-video',html,(loc,page))
                self.assertNotIn('<iframe',html,(loc,page))

    def test_social_links_are_external_safe(self):
        s=(DIST/'en'/'index.html').read_text()
        self.assertIn('rel="noopener noreferrer"',s)
    def test_developer_credit_is_localized_and_safe_on_every_public_page(self):
        from html import unescape
        for loc in LOCALES:
            for page in ['home','about','lessons','coaching','translation','contact','privacy']:
                path=DIST/loc/(page if page!='home' else '')/'index.html'
                text=path.read_text(encoding='utf8')
                self.assertEqual(text.count('class="developer-link"'),1,(loc,page))
                self.assertIn(COPY[loc]['developer_label'],unescape(text))
                self.assertIn(COPY[loc]['developer_name'],unescape(text))
                self.assertIn('href="https://dr-badawi-abdalsalam.com/"',text)
                self.assertIn('target="_blank" rel="noopener noreferrer"',text)
                self.assertIn('<bdi>',text)
                self.assertLess(text.index('class="footer-meta"'),text.index('class="developer-credit"'))

    def test_ukrainian_is_the_default_language(self):
        root=(DIST/'index.html').read_text(encoding='utf8')
        self.assertIn('lang="uk"',root)
        self.assertIn('url=/uk/',root)
        self.assertIn('https://nozha-badavi.com/uk/',root)
        for loc in LOCALES:
            html=(DIST/loc/'index.html').read_text(encoding='utf8')
            self.assertIn('hreflang="x-default" href="https://nozha-badavi.com/uk/"',html)
            self.assertIn('href="/uk/"',html)
        self.assertIn('Українська',(DIST/'uk'/'index.html').read_text(encoding='utf8'))

    def test_sitemap_has_only_complete_locales(self):
        s=(DIST/'sitemap.xml').read_text()
        root=ET.fromstring(s)
        locs=[x.text for x in root.iter() if x.tag.endswith('loc')]
        self.assertEqual(len(locs),28)
        self.assertTrue(all('/uk/' in x or '/en/' in x or '/ar/' in x or '/ru/' in x for x in locs))
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
