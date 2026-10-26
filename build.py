#!/usr/bin/env python3
"""Build a portable Spanish/English portfolio from verified case fragments.
Por que existe: publicar catálogo, casos y CV sin dependencias de producción.
@returns: archivos estáticos en dist/.
Efectos secundarios: reemplaza únicamente dist/.
Errores esperados: catálogo incompleto, traducción o demo ausentes detienen el build.
"""
from html import escape
from html.parser import HTMLParser
from pathlib import Path
import json
import os
import shutil

ROOT = Path(__file__).resolve().parent
SITE = 'https://flaviosirianni.github.io/flavio-sirianni-projects/'
CATEGORIES = {
    'datos': ('Datos y BI', 'Data & BI'), 'bots': ('Bots e IA', 'Bots & AI'),
    'apps': ('Aplicaciones', 'Applications'), 'integ': ('Integraciones', 'Integrations'),
    'sheets': ('Planillas y automatización', 'Spreadsheets & automation'),
    'prod': ('Productos digitales', 'Digital products'), 'int': ('Herramientas internas', 'Internal tools')
}
COPY = {
'es': dict(tagline='Datos, automatización y soluciones digitales', projects='Proyectos', cv='CV',
    language='Read in English', languageCode='EN', theme='Cambiar tema', skip='Saltar al contenido',
    title='Casos de trabajo', eyebrow='Portfolio personal', cases='casos documentados', kinds='tipos de solución',
    search='Buscar proyecto, tecnología o sector', searchLabel='Buscar casos', technology='Tecnología',
    allTech='Todas las tecnologías', all='Todos', ongoing='En desarrollo / validación',
    filter='Filtrar por tipo de solución', results='casos', reset='Limpiar filtros',
    pause='Pausar demos', resume='Reanudar demos', empty='No hay casos con esos filtros. Probá otra búsqueda o limpiá los filtros.',
    open='Explorar el caso', stack='Stack', previous='Caso anterior', next='Caso siguiente',
    back='Todos los proyectos', demo='Demo interactiva', fiction='Demostraciones con datos ficticios. Clientes anónimos.',
    footer='Datos, software, automatización e IA aplicada.',
    description='Portfolio de Flavio Sirianni: 36 casos de datos, BI, automatización, software e IA con demos interactivas.'),
'en': dict(tagline='Data, automation & digital solutions', projects='Projects', cv='CV',
    language='Ver en español', languageCode='ES', theme='Change theme', skip='Skip to content',
    title='Selected work', eyebrow='Personal portfolio', cases='documented cases', kinds='solution types',
    search='Search by project, technology or industry', searchLabel='Search cases', technology='Technology',
    allTech='All technologies', all='All', ongoing='In development / validation',
    filter='Filter by solution type', results='cases', reset='Clear filters',
    pause='Pause previews', resume='Resume previews', empty='No cases match these filters. Try another search or clear the filters.',
    open='Explore the case', stack='Stack', previous='Previous case', next='Next case',
    back='All projects', demo='Interactive demo', fiction='Demonstrations use fictional data. Clients are anonymous.',
    footer='Data, software, automation & applied AI.',
    description='Flavio Sirianni’s portfolio: 36 data, BI, automation, software and AI cases with interactive demos.')
}

class CatalogParser(HTMLParser):
    """Por que existe: extraer metadatos declarados. @returns: parser. Efectos secundarios: acumula casos."""
    def __init__(self):
        """Por que existe: inicializar parser. @returns: None. Efectos secundarios: crea lista."""
        super().__init__(); self.cases=[]
    def handle_starttag(self, tag, attrs):
        """Por que existe: detectar casos. @returns: None. Efectos secundarios: guarda atributos."""
        attributes=dict(attrs)
        if tag=='section' and 'tool' in attributes.get('class','').split():
            self.cases.append(attributes)

def relative(target, current):
    """Por que existe: construir enlaces portables. @returns: str. Efectos secundarios: ninguno."""
    return Path(os.path.relpath(target,Path(current).parent)).as_posix()

def locale_path(lang, name='index.html'):
    """Por que existe: ubicar páginas según idioma. @returns: str. Efectos secundarios: ninguno."""
    return ('en/' if lang=='en' else '')+name

def head(lang, current, title, description=None):
    """Por que existe: generar cabecera semántica. @returns: str HTML. Efectos secundarios: ninguno."""
    t=COPY[lang];description=description or t['description']
    return f'''<!doctype html><html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{escape(title)} · Flavio Sirianni</title><meta name="description" content="{escape(description,quote=True)}"><meta name="author" content="Flavio Sirianni"><meta name="theme-color" content="#176451"><meta property="og:title" content="{escape(title,quote=True)} · Flavio Sirianni"><meta property="og:description" content="{escape(description,quote=True)}"><meta property="og:type" content="website"><link rel="canonical" href="{SITE+current}"><link rel="icon" href="{relative('favicon.svg',current)}" type="image/svg+xml"><link rel="stylesheet" href="{relative('styles.css',current)}"><link rel="stylesheet" href="{relative('demo-themes.css',current)}"><script src="{relative('theme.js',current)}"></script></head><body>'''

def header(lang, current, alternate):
    """Por que existe: ofrecer navegación consistente e idioma contextual. @returns: str HTML. Efectos secundarios: ninguno."""
    t=COPY[lang]
    return f'''<a class="skip-link" href="#content">{t['skip']}</a><header class="topbar"><div class="wrap topbar-inner"><a class="brand" href="{relative(locale_path(lang),current)}"><span class="monogram" aria-hidden="true">FS<span>.</span></span><span>Flavio Sirianni<small>{t['tagline']}</small></span></a><nav class="main-nav" aria-label="{'Navegación principal' if lang=='es' else 'Main navigation'}"><a class="nav-projects" href="{relative(locale_path(lang),current)}">{t['projects']}</a><a href="{relative(locale_path(lang,'cv.html'),current)}">{t['cv']}</a><a class="language-switch" href="{relative(alternate,current)}" lang="{'en' if lang=='es' else 'es'}" hreflang="{'en' if lang=='es' else 'es'}" aria-label="{t['language']}">{t['languageCode']}</a><button id="theme-toggle" class="theme-toggle" type="button" aria-label="{t['theme']}" title="{t['theme']}"><span aria-hidden="true">◐</span></button></nav></div></header>'''

def footer(lang, current):
    """Por que existe: identificar autor y alcance. @returns: str HTML. Efectos secundarios: ninguno."""
    t=COPY[lang]
    return f'''<footer class="wrap site-footer"><a href="{relative(locale_path(lang),current)}">Flavio Sirianni</a><p>{t['footer']}<br>{t['fiction']}</p><a href="{relative(locale_path(lang,'cv.html'),current)}">{'CV imprimible' if lang=='es' else 'Printable CV'} ↗</a></footer>'''

def scripts(current):
    """Por que existe: cargar datos y motores offline. @returns: str HTML. Efectos secundarios: ninguno."""
    return ''.join(f'<script src="{relative(name,current)}?v=project-palettes-1" defer></script>' for name in ['demos-data.js','demos.js','app.js'])+'</body></html>'

def catalog(lang, cases):
    """Por que existe: generar catálogo accesible sin JavaScript. @returns: str HTML. Efectos secundarios: ninguno."""
    t=COPY[lang]; current=locale_path(lang);alt=locale_path('en' if lang=='es' else 'es')
    page=head(lang,current,t['projects'])+header(lang,current,alt)
    page+=f'''<main id="content" class="wrap catalog"><div class="catalog-top"><div><p class="eyebrow">{t['eyebrow']}</p><h1>{t['title']}</h1></div><div class="facts"><div class="kpi"><b>{len(cases)}</b><span>{t['cases']}</span></div><div class="kpi"><b>{len(CATEGORIES)}</b><span>{t['kinds']}</span></div></div></div><div class="search-row"><label class="search-label"><span class="sr-only">{t['searchLabel']}</span><input id="search" type="search" placeholder="{t['search']}" aria-label="{t['searchLabel']}"></label><label class="technology-label" for="technology">{t['technology']}</label><select id="technology"><option value="">{t['allTech']}</option>'''
    technologies=sorted({v.strip() for c in cases for v in c['data-stack'].split(',')})
    page+=''.join(f'<option value="{escape(v,quote=True)}">{escape(v)}</option>' for v in technologies)+'</select></div>'
    page+=f'<div id="filters" class="filters" role="group" aria-label="{t["filter"]}">'
    keys=[('all',t['all'])]+[(key,labels[lang=='en']) for key,labels in CATEGORIES.items()]+[('ongoing',t['ongoing'])]
    for key,label in keys:
        count=sum(1 for c in cases if key=='all' or (key=='ongoing' and c.get('data-status') not in [None,'','Implementado','Implemented']) or c['data-cat']==key)
        page+=f'<button type="button" class="filter-chip" data-category="{key}" aria-pressed="{str(key=="all").lower()}">{label}<span>{count}</span></button>'
    page+=f'''</div><div class="results-bar"><p id="result-count" role="status" aria-live="polite">{len(cases)} / {len(cases)} {t['results']}</p><div class="catalog-controls"><button type="button" id="preview-toggle" aria-pressed="false">Ⅱ {t['pause']}</button><button type="button" id="reset-filters" hidden>{t['reset']} ↺</button></div></div><p class="empty" id="empty" hidden>{t['empty']}</p><div class="case-grid" id="grid">'''
    for case in cases:
        slug=case['id'];status=case.get('data-status');href=relative(locale_path(lang,f'projects/{slug}.html'),current)
        attrs={'data-slug':slug,'data-category':case['data-cat'],'data-stack':case['data-stack'],'data-status':status or '', 'data-title':case['data-title'],'data-sector':case['data-sector'],'data-summary':case['data-summary']}
        attrstr=' '.join(f'{k}="{escape(v,quote=True)}"' for k,v in attrs.items())
        tags=''.join(f'<span class="tag">{escape(v.strip())}</span>' for v in case['data-stack'].split(','))
        badge=f'<span class="status">{escape(status)}</span>' if status else ''
        page+=f'''<a class="case-card" href="{href}" {attrstr}><div class="card-demo"><div class="demo-preview" data-demo="{slug}" aria-hidden="true"></div>{badge}<span class="demo-label">▷ {t['demo']}</span></div><div class="card-body"><p class="sector">{escape(case['data-sector'])}</p><h2>{escape(case['data-title'])}</h2><p class="summary">{escape(case['data-summary'])}</p><div class="card-stack"><span class="stack-label">{t['stack']}</span><div>{tags}</div></div><span class="card-open">{t['open']} <span aria-hidden="true">↗</span></span></div></a>'''
    page+='</div></main>'+footer(lang,current)+scripts(current)
    return page

def project(lang, case, fragment, cases):
    """Por que existe: publicar cada caso con URL propia. @returns: str HTML. Efectos secundarios: ninguno."""
    current=locale_path(lang,f'projects/{case["id"]}.html');alt=locale_path('en' if lang=='es' else 'es',f'projects/{case["id"]}.html');t=COPY[lang]
    page=head(lang,current,case['data-title'],case['data-summary'])+header(lang,current,alt)
    crumb=f'<div class="wrap breadcrumbs"><a href="{relative(locale_path(lang),current)}">← {t["back"]}</a><span>/</span><span>{CATEGORIES[case["data-cat"]][lang=="en"]}</span></div>'
    page+='<main id="content">'+crumb+fragment
    index=cases.index(case);previous=cases[(index-1)%len(cases)];nextcase=cases[(index+1)%len(cases)]
    page+='<nav class="wrap pager" aria-label="'+('Otros proyectos' if lang=='es' else 'Other projects')+'">'
    for key,c in [('previous',previous),('next',nextcase)]:
        href=relative(locale_path(lang,'projects/'+c['id']+'.html'),current)
        page+=f'<a href="{href}"><span>{t[key]}</span><b>{escape(c["data-title"])}</b></a>'
    return page+'</nav></main>'+footer(lang,current)+scripts(current)

def render_cv(lang, cases):
    """Por que existe: producir CV completamente localizado. @returns: str HTML. Efectos secundarios: ninguno."""
    t=COPY[lang];current=locale_path(lang,'cv.html');alt=locale_path('en' if lang=='es' else 'es','cv.html');en=lang=='en'
    selected=['datos-comerciales','asistente-negocio','stock','parte-diario','sitios-web','entrenamiento']
    page=f'''<!doctype html><html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{'Technical CV' if en else 'CV técnico'} · Flavio Sirianni</title><link rel="icon" href="{relative('favicon.svg',current)}"><link rel="stylesheet" href="{relative('cv.css',current)}"></head><body><nav><a href="{relative(locale_path(lang),current)}">← {'Back to portfolio' if en else 'Volver al portfolio'}</a><a class="language-switch" href="{relative(alt,current)}" lang="{'es' if en else 'en'}">{t['languageCode']}</a><button id="print-cv" type="button">{'Print / Save PDF' if en else 'Imprimir / Guardar PDF'}</button></nav><main><header><p class="eyebrow">{'Technical profile / Project portfolio' if en else 'Perfil técnico / Portfolio de proyectos'}</p><h1>Flavio Sirianni</h1><p class="role">{t['tagline']}</p><a href="{SITE+locale_path(lang)}">{SITE.removeprefix('https://')+('en/' if en else '')}</a></header>'''
    profile=('I build data pipelines, analytical models, business applications, integrations and AI assistants. I work with Python, SQL, JavaScript and TypeScript to turn operational needs into usable tools. This portfolio documents 36 cases, with their implementation, technology stack and interactive demonstrations.' if en else 'Desarrollo pipelines de datos, modelos analíticos, aplicaciones de negocio, integraciones y asistentes con IA. Trabajo con Python, SQL, JavaScript y TypeScript para transformar necesidades operativas en herramientas utilizables. Este portfolio documenta 36 casos con su implementación, tecnologías y demostraciones interactivas.')
    page+=f'<section><h2>{"Profile" if en else "Perfil"}</h2><p>{profile}</p></section><section><h2>{"Technical skills" if en else "Competencias técnicas"}</h2><dl>'
    skills=[(('Datos, BI y ETL','Data, BI & ETL'),'Python, SQL, BigQuery, Apache Superset, PostgreSQL, Google Sheets.'),(('Aplicaciones web y móviles','Web & mobile applications'),'React, Next.js, TypeScript, Astro, Expo, React Native, HTML, CSS, Vite.'),(('Backend e integraciones','Backend & integrations'),'FastAPI, Node.js, Express, REST APIs, webhooks, OAuth2, Google Apps Script.'),(('IA, infraestructura y calidad','AI, infrastructure & quality'),'OpenAI, Telegram, WhatsApp Cloud API, Cloud Run, Supabase, Cloudflare Workers, Vercel, Docker, Vitest, Playwright.')]
    for labels,value in skills:page+=f'<dt>{labels[en]}</dt><dd>{value}</dd>'
    page+='</dl></section><section><h2>'+('Selected projects' if en else 'Proyectos seleccionados')+'</h2>'
    for slug in selected:
        c=next(c for c in cases if c['id']==slug)
        status=' · '+escape(c['data-status']) if c.get('data-status') else ''
        page+=f'<article><h3><a href="{relative(locale_path(lang,f"projects/{slug}.html"),current)}">{escape(c["data-title"])}</a>{status}</h3><p>{escape(c["data-summary"])}</p><p class="stack-line">{escape(c["data-stack"].replace(","," · "))}</p></article>'
    note=('Project selection, without an employment timeline. Anonymous clients and fictional demo data.<br>Updated: October 2026.' if en else 'Selección de proyectos, sin cronología laboral. Clientes anónimos y demostraciones con datos ficticios.<br>Actualizado: octubre de 2026.')
    return page+f'</section><footer>{note}</footer></main><script src="{relative("cv.js",current)}" defer></script></body></html>'

def load_cases(lang):
    """Por que existe: exigir catálogo completo y válido. @returns: lista de metadatos y fragmentos. Efectos secundarios: lee fuentes.
    Errores esperados: ValueError si faltan traducciones o se repiten slugs.
    """
    result=[]
    for file in sorted((ROOT/'src'/('tools-en' if lang=='en' else 'tools')).glob('*.html')):
        fragment=file.read_text();parser=CatalogParser();parser.feed(fragment)
        if len(parser.cases)!=1:raise ValueError(f'{file.name}: expected one case')
        c=parser.cases[0]
        if c['data-cat'] not in CATEGORIES:raise ValueError(f'{file.name}: unknown category')
        for key in ['data-title','data-sector','data-summary','data-stack']:
            if not c.get(key):raise ValueError(f'{file.name}: missing {key}')
        result.append((c,fragment))
    if len(result)!=36 or len({c['id'] for c,f in result})!=36:
        raise ValueError(f'{lang}: expected 36 unique translated cases; found {len(result)}')
    return result

def build():
    """Por que existe: generar sitio bilingüe revisable. @returns: None. Efectos secundarios: reemplaza dist/.
    Errores esperados: ValueError ante paridad incompleta; OSError por archivos ausentes.
    """
    localized={lang:load_cases(lang) for lang in ['es','en']}
    slugs={c['id'] for c,f in localized['es']}
    if slugs!={c['id'] for c,f in localized['en']}:raise ValueError('Different case IDs between languages')
    demos={f.stem:json.loads(f.read_text()) for f in sorted((ROOT/'src/demos').glob('*.json'))}
    if set(demos)!=slugs:raise ValueError('Each case requires a matching localized demo')
    out=ROOT/'dist'
    if out.exists():shutil.rmtree(out)
    (out/'en/projects').mkdir(parents=True);(out/'projects').mkdir()
    for name in ['styles.css','demo-themes.css','theme.js','app.js','demos.js','favicon.svg','cv.css','cv.js']:
        shutil.copy2(ROOT/'src'/name,out/name)
    (out/'demos-data.js').write_text('window.PORTFOLIO_DEMOS = '+json.dumps(demos,ensure_ascii=False,separators=(',',':'))+';\n')
    for lang,items in localized.items():
        cases=[c for c,f in items]
        (out/locale_path(lang)).write_text(catalog(lang,cases))
        (out/locale_path(lang,'cv.html')).write_text(render_cv(lang,cases))
        for c,fragment in items:(out/locale_path(lang,f'projects/{c["id"]}.html')).write_text(project(lang,c,fragment,cases))
    (out/'.nojekyll').touch()
    print(f'Build OK: 36 cases × 2 languages; {sum(len(d["steps"]) for d in demos.values())} localized demo scenes; {out}')

if __name__=='__main__':build()
