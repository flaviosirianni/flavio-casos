"""Contract checks for the generated public portfolio and its portable resources."""
import importlib.util
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('portfolio_build', ROOT / 'build.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class PageParser(HTMLParser):
    """Por que existe: inspeccionar contratos HTML. @returns: parser. Efectos secundarios: acumula nodos."""
    def __init__(self):
        """Por que existe: inicializar listas. @returns: None. Efectos secundarios: inicializa estado."""
        super().__init__()
        self.nodes = []
    def handle_starttag(self, tag, attrs):
        """Por que existe: capturar etiquetas. @returns: None. Efectos secundarios: agrega nodo."""
        self.nodes.append((tag, dict(attrs)))

class SiteTests(unittest.TestCase):
    """Por que existe: detectar regresiones de publicación. @returns: suite. Efectos secundarios: build local."""
    @classmethod
    def setUpClass(cls):
        """Por que existe: probar una compilación limpia. @returns: None. Efectos secundarios: regenera dist/."""
        module.build()
        cls.output = ROOT / 'dist'
        cls.html = (cls.output / 'index.html').read_text()
        cls.parser = PageParser()
        cls.parser.feed(cls.html)

    def test_complete_unique_catalog_with_stack_and_implementation(self):
        """Por que existe: evitar pérdidas de casos. @returns: None. Efectos secundarios: ninguno."""
        cases = [attrs for tag, attrs in self.parser.nodes if tag == 'section' and attrs.get('class') == 'tool']
        self.assertEqual(len(cases), 37)
        self.assertEqual(len(set(c['id'] for c in cases)), 37)
        self.assertEqual(self.html.count('Implementación técnica'), 37)
        for case in cases:
            self.assertTrue(case['data-stack'])
            self.assertTrue(case['data-summary'])
        self.assertEqual(next(c for c in cases if c['id'] == 'entrenamiento')['data-status'], 'Beta')

    def test_no_corporate_identity_in_public_output(self):
        """Por que existe: asegurar identidad independiente. @returns: None. Efectos secundarios: ninguno."""
        for f in self.output.rglob('*'):
            if f.suffix in ['.html', '.js', '.css', '.svg']:
                text = f.read_text().lower()
                self.assertNotRegex(text, r'santa\s*ia|santaia|logo_data_uri|claude\.ai/artifact')

    def test_portable_resources_and_case_links(self):
        """Por que existe: prevenir 404 en GitHub Pages bajo subruta. @returns: None. Efectos secundarios: ninguno."""
        case_ids = {a['id'] for t, a in self.parser.nodes if t == 'section' and a.get('class') == 'tool'}
        index_ids = {a['id'] for t, a in self.parser.nodes if 'id' in a}
        for file in [self.output/'index.html', self.output/'cv.html']:
            parser = PageParser(); parser.feed(file.read_text())
            for tag, attrs in parser.nodes:
                for attr in ['src', 'href']:
                    value = attrs.get(attr, '')
                    parsed = urlsplit(value)
                    if not value or parsed.scheme or parsed.netloc:
                        continue
                    self.assertFalse(value.startswith('/'), value)
                    if parsed.path and parsed.path != './':
                        self.assertTrue((file.parent/unquote(parsed.path)).is_file(), value)
                    if parsed.fragment:
                        self.assertIn(parsed.fragment, case_ids | index_ids, value)
                if tag == 'img':
                    self.assertIn('alt', attrs)
                if attrs.get('target') == '_blank':
                    self.assertIn('noopener', attrs.get('rel', ''))

    def test_valid_document_structure_and_printable_cv(self):
        """Por que existe: validar documentos y alternativa de CV. @returns: None. Efectos secundarios: ninguno."""
        for name in ['index.html','cv.html']:
            html = (self.output/name).read_text()
            self.assertTrue(html.lower().startswith('<!doctype html>'))
            self.assertEqual(html.count('<head>'),1)
            self.assertEqual(html.count('</head>'),1)
            self.assertEqual(html.count('<body>'),1)
            self.assertEqual(html.count('</body>'),1)
        cv = (self.output/'cv.html').read_text()
        self.assertEqual(cv.count('<article>'),6)
        self.assertIn('Imprimir / Guardar PDF', cv)
        self.assertIn('@media print', (self.output/'cv.css').read_text())

if __name__ == '__main__':
    unittest.main()
