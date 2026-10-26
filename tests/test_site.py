"""Release contracts for the bilingual, anonymous and portable interactive portfolio."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import importlib.util
import json
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('portfolio_build', ROOT / 'build.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class PageParser(HTMLParser):
    """Por que existe: inspeccionar contratos HTML. @returns: parser. Efectos secundarios: acumula nodos."""
    def __init__(self):
        """Por que existe: inicializar nodos. @returns: None. Efectos secundarios: inicializa estado."""
        super().__init__()
        self.nodes = []
    def handle_starttag(self, tag, attrs):
        """Por que existe: registrar etiquetas. @returns: None. Efectos secundarios: agrega nodos."""
        self.nodes.append((tag, dict(attrs)))

def parse(path):
    """Por que existe: leer una salida HTML. @returns: PageParser. Efectos secundarios: lee archivo."""
    parser = PageParser()
    parser.feed(path.read_text())
    return parser

class SiteTests(unittest.TestCase):
    """Por que existe: validar lo publicado. @returns: suite. Efectos secundarios: recompila dist/."""
    @classmethod
    def setUpClass(cls):
        """Por que existe: validar un build limpio. @returns: None. Efectos secundarios: regenera dist/."""
        module.build()
        cls.output = ROOT / 'dist'

    def test_bilingual_catalog_and_individual_pages(self):
        """Por que existe: impedir pérdida de casos o traducciones. @returns: None. Efectos secundarios: ninguno."""
        identifiers = []
        for language, prefix in [('es',''),('en','en/')]:
            index = self.output/prefix/'index.html'
            nodes = parse(index).nodes
            self.assertEqual(next(a['lang'] for t,a in nodes if t=='html'), language)
            cards = [a for t,a in nodes if 'case-card' in a.get('class','').split()]
            self.assertEqual(len(cards),36)
            slugs = {c['data-slug'] for c in cards}
            self.assertEqual(len(slugs),36)
            identifiers.append(slugs)
            for slug in slugs:
                case = self.output/prefix/'projects'/f'{slug}.html'
                self.assertTrue(case.is_file(),case)
                content = case.read_text()
                self.assertIn('data-demo="'+slug+'"',content)
                self.assertTrue(('implementation' if language=='en' else 'implementación') in content.lower(), str(case))
        self.assertEqual(*identifiers)

    def test_every_demo_has_localized_specific_scenes(self):
        """Por que existe: exigir demos completas ES/EN. @returns: None. Efectos secundarios: lee JSON."""
        files = list((ROOT/'src/demos').glob('*.json'))
        self.assertEqual(len(files),36)
        for file in files:
            demo = json.loads(file.read_text())
            self.assertEqual(file.stem,demo['slug'])
            self.assertGreaterEqual(len(demo['steps']),4)
            self.assertLessEqual(len(demo['steps']),8)
            for step in demo['steps']:
                for field in ['title','description','action','view']:
                    self.assertEqual(set(step[field]),{'es','en'},f'{file}:{field}')
                    self.assertTrue(step[field]['es'])
                    self.assertTrue(step[field]['en'])
                for lang in ['es','en']:
                    view=step['view'][lang]
                    self.assertIn(view['type'],['chat','table','form','pipeline','chart','terminal'])
                    self.assertTrue(view['heading'])
                    if view['type']=='table':
                        self.assertTrue(view['columns'])
                        self.assertTrue(view['rows'])
                        self.assertTrue(all(len(r)==len(view['columns']) for r in view['rows']),file)
                    if view['type']=='chart':
                        self.assertTrue(all(isinstance(b['value'],(float,int)) for b in view['bars']),file)

    def test_no_client_identity_or_removed_case_in_public_output(self):
        """Por que existe: preservar anonimización. @returns: None. Efectos secundarios: ninguno."""
        # Private source/client identities are audited outside this public repository.
        forbidden = r'logo_data_uri|claude\.ai/artifact|/users/|/private/tmp/'
        for file in self.output.rglob('*'):
            if file.suffix in ['.html','.js','.css','.svg','.json']:
                self.assertIsNone(re.search(forbidden,file.read_text().lower()),str(file))
                for address in re.findall(r'[a-z0-9._%+-]+@([a-z0-9.-]+\.[a-z]{2,})',file.read_text().lower()):
                    self.assertTrue(address.endswith(('.invalid','.test','.example')) or address in ['example.com','example.org','example.net'],str(file))

    def test_all_relative_links_and_assets_resolve(self):
        """Por que existe: verificar GitHub Pages y copia offline. @returns: None. Efectos secundarios: ninguno."""
        for file in self.output.rglob('*.html'):
            nodes=parse(file).nodes
            self.assertEqual(sum(t=='head' for t,a in nodes),1)
            self.assertEqual(sum(t=='body' for t,a in nodes),1)
            for tag,attrs in nodes:
                for attr in ['src','href']:
                    value=attrs.get(attr,'');url=urlsplit(value)
                    if not value or url.scheme or url.netloc or value.startswith('#'):
                        continue
                    self.assertFalse(value.startswith('/'),f'{file}: {value}')
                    target=(file.parent/unquote(url.path)).resolve()
                    self.assertTrue(target.is_file(),f'{file}: {value}')
                if attrs.get('target')=='_blank':
                    self.assertIn('noopener',attrs.get('rel',''))

    def test_language_switch_preserves_project_and_cv(self):
        """Por que existe: mantener contexto al cambiar idioma. @returns: None. Efectos secundarios: ninguno."""
        for file in self.output.rglob('*.html'):
            if file.name=='404.html':
                continue
            links=[a for t,a in parse(file).nodes if t=='a' and 'language-switch' in a.get('class','').split()]
            self.assertEqual(len(links),1,str(file))
            target=(file.parent/links[0]['href']).resolve()
            self.assertEqual(target.name,file.name)
            self.assertNotEqual(target,file.resolve())

    def test_portable_printable_cv_in_both_languages(self):
        """Por que existe: conservar CV bilingüe. @returns: None. Efectos secundarios: ninguno."""
        for lang,prefix in [('es',''),('en','en/')]:
            cv=self.output/prefix/'cv.html';text=cv.read_text()
            self.assertEqual(text.count('<article>'),6)
            self.assertIn('Save PDF' if lang=='en' else 'Guardar PDF',text)
            self.assertNotIn('Desarrollo de software, datos y automatización',text)
        self.assertIn('@media print',(self.output/'cv.css').read_text())

    def test_minimal_intro_only_two_kpis(self):
        """Por que existe: evitar reintroducir la portada retirada. @returns: None. Efectos secundarios: ninguno."""
        text=(self.output/'index.html').read_text()
        self.assertFalse('profile-panel' in text)
        self.assertFalse('hero-copy' in text)
        self.assertFalse('tecnologías y plataformas' in text)
        self.assertEqual(text.count('class="kpi"'),2)
        self.assertIn('Datos, automatización y soluciones digitales',text)

    def test_catalog_offers_a_localized_motion_control(self):
        """Por que existe: permitir detener movimiento automático. @returns: None. Efectos secundarios: ninguno."""
        for lang,prefix in [('es',''),('en','en/')]:
            nodes=parse(self.output/prefix/'index.html').nodes
            controls=[a for t,a in nodes if t=='button' and a.get('id')=='preview-toggle']
            self.assertEqual(len(controls),1)
            self.assertIn('aria-pressed',controls[0])

    def test_metadata_and_visible_stack_agree(self):
        """Por que existe: garantizar filtros completos. @returns: None. Efectos secundarios: ninguno."""
        for folder in ['tools','tools-en']:
            for file in (ROOT/'src'/folder).glob('*.html'):
                text=file.read_text()
                metadata=set(re.search('data-stack="([^"]+)"',text).group(1).split(','))
                details=[re.sub('<[^>]+>','',t) for stack in re.findall('<div class="stack">(.*?)</div>',text,re.S) for t in re.findall('<span class="tag">(.*?)</span>',stack)]
                self.assertEqual(set(details),metadata,str(file))

if __name__=='__main__':
    unittest.main()
