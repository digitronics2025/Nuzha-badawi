import sys
import unittest
from pathlib import Path
from html import unescape

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'src'/'content'))
from site_copy import COPY,LOCALES


class TestTestimonials(unittest.TestCase):
    def test_review_evidence_and_translations_are_attributed(self):
        self.assertEqual(COPY['en']['review_yura_quote'],'I am not afraid to speak English anymore.')
        self.assertEqual(COPY['en']['review_m_quote'],'she is a clever teacher who explains information very clearly')
        self.assertEqual(COPY['en']['review_serg_quote'],'The lessons are clear, interesting and well-organised.')
        for locale in LOCALES:
            page=unescape((ROOT/'dist-public'/locale/'index.html').read_text())
            self.assertIn('data-nusya-testimonials hidden',page)
            self.assertLess(page.index('id="languages"'),page.index('data-nusya-testimonials'))
            self.assertLess(page.index('data-nusya-testimonials'),page.index('class="section-pad coaching-section"'))
            self.assertEqual(page.count('data-review-card='),3)
            for field in ('proof_age','proof_levels','proof_formats','testimonials_rating','testimonials_snapshot'):
                self.assertIn(COPY[locale][field],page)
            self.assertNotIn('AggregateRating',page)
            self.assertNotIn('109',COPY[locale]['testimonials_rating'])
            self.assertNotIn('<img data-review-image-target src=',page)
            for route in ('about','lessons'):
                content=unescape((ROOT/'dist-public'/locale/route/'index.html').read_text())
                self.assertIn(COPY[locale]['teaching_experience'],content)
            if locale!='en':
                self.assertNotEqual(COPY[locale]['review_attribution'],COPY['en']['review_attribution'])


if __name__=='__main__':
    unittest.main()
