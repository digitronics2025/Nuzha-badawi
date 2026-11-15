"""Export the existing approved SVG mark; no new artwork or runtime dependency.

Uses optional QA dependencies (Playwright and Pillow). Generated files are committed.
"""
from io import BytesIO
from pathlib import Path
import shutil
from PIL import Image
from playwright.sync_api import sync_playwright

ASSETS = Path(__file__).resolve().parents[1] / 'src/assets'


def main():
    source = (ASSETS / 'favicon.svg').read_text(encoding='utf-8')
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=shutil.which('chromium'), args=['--no-sandbox'])
        page = browser.new_page(viewport={'width': 512, 'height': 512}, device_scale_factor=1)
        page.set_content('<style>body{margin:0}svg{width:512px;height:512px}</style>' + source)
        page.evaluate('document.fonts.ready')
        master = Image.open(BytesIO(page.locator('svg').screenshot(omit_background=True))).convert('RGBA')
        for size in (16, 32, 48):
            master.resize((size, size), Image.Resampling.LANCZOS).save(ASSETS / f'favicon-{size}x{size}.png', optimize=True)
        master.save(ASSETS / 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)], bitmap_format='bmp')
        for size, name in ((180, 'apple-touch-icon.png'), (192, 'icon-192.png'), (512, 'icon-512.png')):
            image = Image.new('RGB', (size, size), '#37231D')
            image.paste(master.resize((size, size), Image.Resampling.LANCZOS), mask=master.resize((size, size), Image.Resampling.LANCZOS).getchannel('A'))
            image.save(ASSETS / name, optimize=True)
        browser.close()
    # Preserve the approved sharing-card pixels, including Cyrillic and shaped Arabic.
    for path in ASSETS.glob('social-card-*.png'):
        image = Image.open(path)
        before = path.read_bytes()
        output = BytesIO()
        image.save(output, format='PNG', optimize=True)
        if len(output.getvalue()) < len(before):
            path.write_bytes(output.getvalue())
    print('Exported NUSYA icons and losslessly optimized existing sharing cards.')


if __name__ == '__main__':
    main()
