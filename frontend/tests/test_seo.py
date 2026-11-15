"""Public discovery contracts: metadata, canonical routes, schemas and real icons."""
import hashlib
import json
import struct
import sys
import unittest
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'src/content'))
from site_copy import LOCALES
from seo import CANONICAL, OG_LOCALES, PAGES, metadata, structured_data


class Document(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.tags = []
        self.schema = ''
        self.in_schema = False
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        if tag == 'script':
            self.in_schema = attrs.get('id') == 'nusya-schema'

    def handle_endtag(self, tag):
        if tag == 'script':
            self.in_schema = False

    def handle_data(self, data):
        if self.in_schema:
            self.schema += data


class SeoTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        from subprocess import run
        run([sys.executable, str(ROOT / 'scripts/build.py')], check=True, stdout=-1)

    def test_every_canonical_page_has_consistent_localized_metadata(self):
        titles, descriptions, routes = set(), set(), set()
        for locale in LOCALES:
            for page in PAGES:
                route = f'/{locale}/' + ('' if page == 'home' else page + '/')
                doc = Document((ROOT / 'dist-public' / route.lstrip('/') / 'index.html').read_text())
                meta = {a.get('name', a.get('property')): a.get('content') for t, a in doc.tags if t == 'meta'}
                links = [a for t, a in doc.tags if t == 'link']
                seo = metadata(locale, page)
                self.assertNotIn(seo['title'], titles)
                self.assertNotIn(seo['description'], descriptions)
                titles.add(seo['title']); descriptions.add(seo['description'])
                self.assertEqual(meta['og:title'], seo['title'])
                self.assertEqual(meta['twitter:title'], seo['title'])
                for key in ('description', 'og:description', 'twitter:description'):
                    self.assertEqual(meta[key], seo['description'])
                self.assertEqual(meta['og:locale'], OG_LOCALES[locale])
                self.assertEqual({a['content'] for t, a in doc.tags if t == 'meta' and a.get('property') == 'og:locale:alternate'}, {v for k, v in OG_LOCALES.items() if k != locale})
                self.assertEqual(meta['og:url'], CANONICAL + route)
                self.assertEqual([a['href'] for a in links if a.get('rel') == 'canonical'], [CANONICAL + route])
                expected = {l: CANONICAL + route.replace('/' + locale + '/', '/' + l + '/', 1) for l in LOCALES}
                expected['x-default'] = expected['uk']
                self.assertEqual({a['hreflang']: a['href'] for a in links if 'hreflang' in a}, expected)
                image = ROOT / 'src/assets' / f'social-card-{locale}.png'
                self.assertEqual(meta['og:image'], CANONICAL + f'/assets/social-card-{locale}.png?v=' + hashlib.sha256(image.read_bytes()).hexdigest()[:12])
                self.assertEqual(meta['twitter:image'], meta['og:image'])
                self.assertEqual(meta['twitter:image:alt'], meta['og:image:alt'])
                self.assertEqual((meta['og:image:width'], meta['og:image:height'], meta['og:image:type']), ('1200', '630', 'image/png'))
                self.assertEqual(json.loads(doc.schema), structured_data(locale, page, **seo))
                self.assertNotIn('image', doc.schema)
                routes.add(CANONICAL + route)
        sitemap = ET.parse(ROOT / 'dist-public/sitemap.xml')
        self.assertEqual({v.text for v in sitemap.iter() if v.tag.endswith('}loc')}, routes)

    def test_real_png_and_ico_device_icons(self):
        assets = ROOT / 'dist-public/assets'
        for size, name in [(16, 'favicon-16x16.png'), (32, 'favicon-32x32.png'), (48, 'favicon-48x48.png'), (180, 'apple-touch-icon.png'), (192, 'icon-192.png'), (512, 'icon-512.png')]:
            data = (assets / name).read_bytes()
            self.assertEqual(data[:8], b'\x89PNG\r\n\x1a\n')
            self.assertEqual(struct.unpack('>II', data[16:24]), (size, size))
            self.assertEqual(data[25], 6 if name.startswith('favicon') else 2)  # RGBA favicon / opaque RGB device icon
        data = (assets / 'favicon.ico').read_bytes()
        self.assertEqual(struct.unpack('<HHH', data[:6]), (0, 1, 3))
        sizes = []
        for offset in range(6, 54, 16):
            width, height, _, _, _, depth, length, start = struct.unpack('<BBBBHHII', data[offset:offset + 16])
            self.assertEqual(width, height); self.assertEqual(depth, 32)
            self.assertLessEqual(start + length, len(data))
            self.assertEqual(struct.unpack('<I', data[start:start + 4])[0], 40)  # Windows bitmap header
            sizes.append(width)
        self.assertEqual(sizes, [16, 32, 48])
        manifest = json.loads((ROOT / 'dist-public/site.webmanifest').read_text())
        self.assertEqual((manifest['lang'], manifest['start_url'], manifest['display']), ('uk', '/uk/', 'browser'))
        self.assertEqual([v['sizes'] for v in manifest['icons']], ['192x192', '512x512'])
        for output in ('dist-public', 'dist-admin'):
            self.assertEqual((ROOT / output / 'favicon.ico').read_bytes(), data)
            self.assertTrue((ROOT / output / 'apple-touch-icon.png').is_file())
            doc = Document((ROOT / output / ('uk/index.html' if output == 'dist-public' else 'index.html')).read_text())
            self.assertTrue(any(a.get('href') == '/favicon.ico' for t, a in doc.tags if t == 'link'))

    def test_error_page_does_not_impersonate_homepage(self):
        doc = Document((ROOT / 'dist-public/404.html').read_text())
        self.assertFalse(doc.schema)
        self.assertFalse(any('hreflang' in a or a.get('rel') == 'canonical' for _, a in doc.tags))
        self.assertTrue(any(a.get('name') == 'robots' and 'noindex' in a['content'] for _, a in doc.tags))

    def test_unverified_social_profile_is_never_a_public_fallback(self):
        for route in ('en/index.html', 'en/contact/index.html'):
            doc = Document((ROOT / 'dist-public' / route).read_text())
            self.assertTrue(all('hidden' in a and not a.get('href') for t, a in doc.tags if a.get('data-nusya-link') == 'linkedin'))

    def test_fallback_illustration_and_lesson_links_have_honest_accessible_names(self):
        for locale in LOCALES:
            doc = Document((ROOT / 'dist-public' / locale / 'index.html').read_text())
            self.assertTrue(all(a.get('aria-label') for _, a in doc.tags if a.get('data-nusya-media')))
            names = [a['aria-label'] for t, a in doc.tags if t == 'a' and 'aria-label' in a and a.get('class') == 'text-link']
            self.assertEqual(len(set(names)), 3)
