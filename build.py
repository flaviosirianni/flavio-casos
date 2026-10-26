#!/usr/bin/env python3
"""Compile the static portfolio with Python's standard library.
Por que existe: generar un sitio portable sin servicios de build externos.
@returns: genera dist/index.html, cv.html y recursos estáticos.
Efectos secundarios: reemplaza únicamente la salida dist/.
Errores esperados: fuentes ausentes o catálogo con slugs duplicados abortan el build.
"""
from html import escape
from html.parser import HTMLParser
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parent

class CatalogParser(HTMLParser):
    """Por que existe: leer metadatos de casos sin dependencias.
    @returns: instancia con un catálogo de diccionarios.
    Efectos secundarios: acumula metadatos durante el parsing.
    """
    def __init__(self):
        """Por que existe: inicializar el parser. @returns: None. Efectos secundarios: crea la lista de casos."""
        super().__init__()
        self.cases = []

    def handle_starttag(self, tag, attrs):
        """Por que existe: reconocer secciones de casos. @returns: None. Efectos secundarios: agrega sus metadatos."""
        attributes = dict(attrs)
        if tag == 'section' and attributes.get('class') == 'tool':
            self.cases.append(attributes)

def render_cv(cases):
    """Por que existe: ofrecer una presentación técnica imprimible.
    @returns: str, HTML del CV. Efectos secundarios: ninguno.
    """
    selected = ['reservas-velozia', 'datos-comerciales', 'asistente-negocio', 'parte-diario', 'sitios-web', 'entrenamiento']
    items = []
    for slug in selected:
        case = next(c for c in cases if c['id'] == slug)
        status = ' · ' + escape(case['data-status']) if case.get('data-status') else ''
        items.append('<article><h3><a href="index.html#'+slug+'">'+escape(case['data-title'])+'</a>'+status+'</h3><p>'+escape(case['data-summary'])+'</p><p class="stack-line">'+escape(case['data-stack'].replace(',', ' · '))+'</p></article>')
    return '''<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CV técnico · Flavio Sirianni</title><link rel="icon" href="favicon.svg"><link rel="stylesheet" href="cv.css"></head><body><nav><a href="index.html">← Volver al portfolio</a><button id="print-cv" type="button">Imprimir / Guardar PDF</button></nav><main><header><p class="eyebrow">Perfil técnico / Portfolio de proyectos</p><h1>Flavio Sirianni</h1><p class="role">Desarrollo de software, datos y automatización</p><a href="https://github.com/flaviosirianni">github.com/flaviosirianni</a></header><section><h2>Perfil</h2><p>Desarrollo aplicaciones web, herramientas operativas, pipelines de datos e integraciones. Trabajo con TypeScript, JavaScript, Python y SQL para conectar sistemas, automatizar procesos y construir asistentes con IA. Mi portfolio reúne '''+str(len(cases))+''' casos documentados con implementación y stack tecnológico.</p></section><section><h2>Competencias técnicas</h2><dl><dt>Aplicaciones web y móviles</dt><dd>React, Next.js, TypeScript, Astro, Expo, React Native, HTML, CSS, Tailwind, Vite.</dd><dt>Backend e integraciones</dt><dd>Python, FastAPI, Node.js, Express, APIs REST, webhooks, OAuth2, Google Apps Script.</dd><dt>Datos y persistencia</dt><dd>SQL, BigQuery, PostgreSQL, Supabase, Prisma, SQLite, Firestore, Google Sheets.</dd><dt>IA, infraestructura y calidad</dt><dd>OpenAI, Claude, Telegram, WhatsApp Cloud API, Cloud Run, Cloudflare Workers, Vercel, Docker, Vitest, Playwright.</dd></dl></section><section><h2>Proyectos seleccionados</h2>'''+''.join(items)+'''</section><footer>Portfolio completo: <a href="https://flaviosirianni.github.io/flavio-casos/">flaviosirianni.github.io/flavio-casos/</a><br>Selección de proyectos, sin cronología laboral. Clientes anónimos y capturas de demostración.<br>Actualizado: octubre de 2026.</footer></main><script src="cv.js" defer></script></body></html>'''

def build():
    """Por que existe: compilar fragmentos y recursos en una salida autocontenida.
    @returns: None. Efectos secundarios: reemplaza dist/ dentro del proyecto.
    Errores esperados: AssertionError por catálogo vacío o slugs repetidos; OSError por fuentes ausentes.
    """
    source = ROOT / 'src'
    fragments = [f.read_text() for f in sorted((source / 'tools').glob('*.html'))]
    parser = CatalogParser()
    parser.feed(''.join(fragments))
    assert parser.cases and len({c['id'] for c in parser.cases}) == len(parser.cases), 'Catálogo vacío o slugs repetidos'
    output = ROOT / 'dist'
    if output.exists():
        shutil.rmtree(output)
    output.mkdir()
    for name in ['styles.css', 'personal.css', 'app.js', 'favicon.svg', 'cv.css', 'cv.js']:
        shutil.copy2(source / name, output / name)
    shutil.copytree(source / 'img', output / 'img')
    page = '<!doctype html>\n<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
    page += (source / 'shell-head.html').read_text() + '\n'.join(fragments) + (source / 'shell-foot.html').read_text() + '</body></html>\n'
    (output / 'index.html').write_text(page)
    (output / 'cv.html').write_text(render_cv(parser.cases))
    (output / '.nojekyll').touch()
    print(f'Build OK: {len(parser.cases)} casos; salida {output}')

if __name__ == '__main__':
    build()
