"""Render the studio's vector wordmark card to sharing-compatible PNGs.
Requires the optional browser QA dependencies; generated assets are committed.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import shutil
assets=Path(__file__).resolve().parents[1]/'src/assets'
source=(assets/'social-card.svg').read_text().replace('EN / AR / RU','UK / EN / AR / RU')
copy={'en':('Learn a language.','Find your voice.'),'uk':('Вивчайте мови.','Знайдіть свій голос.'),'ru':('Изучайте языки.','Найдите свой голос.'),'ar':('تعلّم لغة.','عبّر بثقة.')}
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=shutil.which('chromium'),args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1200,'height':630})
    for locale,(first,second) in copy.items():
        svg=source.replace('Learn a language.',first).replace('Find your voice.',second)
        if locale=='ar':svg=svg.replace('x="95" y="360"','x="600" y="360" direction="rtl"').replace('x="95" y="425"','x="600" y="425" direction="rtl"')
        page.set_content('<style>body{margin:0}</style>'+svg)
        page.screenshot(path=str(assets/f'social-card-{locale}.png'))
    browser.close()
