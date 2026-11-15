"""Localized search metadata; visible editorial headings remain in site_copy."""
from site_copy import COPY

CANONICAL = 'https://nozha-badavi.com'
BRAND = 'NUSYA Linguistic Studio'
OG_LOCALES = {'uk': 'uk_UA', 'en': 'en_GB', 'ar': 'ar_SA', 'ru': 'ru_RU'}
TITLES = {
    'uk': ('Нозха Бадаві — мовні заняття та спілкування', 'Про Нозху Бадаві', 'Заняття з англійської, російської та арабської', 'Підготовка до професійного спілкування', 'Письмовий та усний переклад — Нозха Бадаві', 'Зв’язатися з Нозхою Бадаві', 'Конфіденційність і захист даних'),
    'en': ('Nozha Badavi — language lessons and coaching', 'About Nozha Badavi', 'English, Russian and Arabic lessons', 'Professional communication coaching', 'Translation and interpretation — Nozha Badavi', 'Contact Nozha Badavi', 'Privacy and data protection'),
    'ar': ('نزهة بدوي — دروس لغات وتواصل مهني', 'تعرّف على نزهة بدوي', 'دروس الإنجليزية والروسية والعربية', 'التدريب على التواصل المهني', 'الترجمة التحريرية والشفوية — نزهة بدوي', 'تواصل مع نزهة بدوي', 'الخصوصية وحماية البيانات'),
    'ru': ('Нузя Бадави — языковые уроки и общение', 'О Нузе Бадави', 'Уроки английского, русского и арабского', 'Подготовка к профессиональному общению', 'Письменный и устный перевод — Нузя Бадави', 'Связаться с Нузей Бадави', 'Конфиденциальность и защита данных'),
}
PAGES = ('home', 'about', 'lessons', 'coaching', 'translation', 'contact', 'privacy')
IMAGE_ALT = {
    'uk': 'NUSYA Linguistic Studio — «Вивчайте мови. Знайдіть свій голос.» на тлі стилізованого глобуса.',
    'en': 'NUSYA Linguistic Studio — “Learn a language. Find your voice.” with an editorial globe illustration.',
    'ar': 'NUSYA Linguistic Studio — «تعلّم لغة. عبّر بثقة.» مع رسم توضيحي للكرة الأرضية.',
    'ru': 'NUSYA Linguistic Studio — «Изучайте языки. Найдите свой голос.» на фоне стилизованного глобуса.',
}


def metadata(locale, page):
    description_key = 'hero_desc' if page == 'home' else 'privacy_desc' if page == 'privacy' else page + '_page_desc'
    return {'title': TITLES[locale][PAGES.index(page)], 'description': COPY[locale][description_key]}


def structured_data(locale, page, title, description):
    route = f'/{locale}/' + ('' if page == 'home' else page + '/')
    person_id = CANONICAL + '/#person'
    website_id = CANONICAL + '/#website'
    webpage = {
        '@type': 'AboutPage' if page == 'about' else 'WebPage',
        '@id': CANONICAL + route + '#webpage', 'url': CANONICAL + route,
        'name': title, 'description': description, 'inLanguage': locale,
        'isPartOf': {'@id': website_id}, 'about': {'@id': person_id},
    }
    if page == 'about':
        webpage['mainEntity'] = {'@id': person_id}
    return {'@context': 'https://schema.org', '@graph': [
        {'@type': 'WebSite', '@id': website_id, 'url': CANONICAL + '/uk/', 'name': BRAND, 'inLanguage': list(COPY)},
        {'@type': 'Person', '@id': person_id, 'name': 'Nozha Badavi', 'url': CANONICAL + f'/{locale}/about/'},
        webpage,
    ]}
