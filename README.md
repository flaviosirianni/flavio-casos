# Flavio Sirianni · Portfolio técnico

Portfolio personal con 37 casos de desarrollo web, datos, integraciones y asistentes con IA. Cada proyecto reúne el problema, las pantallas, la implementación y el stack completo. Incluye búsqueda, filtros combinados, modo oscuro y CV técnico imprimible.

**Repositorio privado de revisión:** https://github.com/flaviosirianni/flavio-casos

**URL prevista al publicar:** https://flaviosirianni.github.io/flavio-casos/

El portfolio está construido y validado localmente. La publicación pública espera autorización del titular.

## Desarrollo local

Requisitos: Python 3.10 o superior. Node.js solo para comprobar sintaxis JavaScript.

```sh
./build.sh
python3 -m http.server 4173 --directory dist
```

Abrir http://localhost:4173. También se puede abrir `dist/index.html` directamente: los recursos son relativos y no requieren backend.

```sh
python3 -m unittest discover -s tests -v
node --check src/app.js
node --check src/cv.js
```

## Organización

- `src/tools/`: un caso por archivo, con metadatos `data-title`, `data-cat`, `data-stack`, `data-summary` y `data-status` cuando corresponde.
- `src/shell-head.html`: presentación personal y catálogo.
- `src/shell-foot.html`: cierre del documento y pie.
- `src/styles.css`: componentes visuales y pantallas recreadas.
- `src/personal.css`: identidad personal, accesibilidad y estilos adaptables.
- `src/app.js`: gráficos, navegación, búsqueda, filtros y tema.
- `src/img/`: imágenes del demo público de reservas.
- `src/cv.css`, `src/cv.js`: estilo de impresión y botón del CV.
- `build.py`: compilación y generación del CV desde los casos.
- `tests/test_site.py`: validación de catálogo, anonimización, documentos y recursos portables.
- `qa/`: evidencia de la validación en navegador.

`dist/` se genera y no se versiona. Para compartir una copia offline, copiar toda la carpeta `dist/`.

## Actualizar contenido

Editar el fragmento del proyecto en `src/tools/` y ejecutar el build. El índice, el stack y los filtros se recalculan automáticamente. Para cambiar la selección del CV, editar `selected` en `render_cv`, en `build.py`.

Categorías: `datos`, `bots`, `apps`, `integ`, `sheets`, `prod`, `int`. Conservar los estados de beta, validación o prototipo. Las pantallas son ilustrativas, salvo las imágenes del demo público que se identifican como tales. Mantener clientes anónimos y no subir secretos, datos reales ni código de proyectos de clientes.

## Publicación

El workflow `.github/workflows/pages.yml` prueba y compila cada cambio en `main`. En un repositorio público, publica únicamente `dist/` en GitHub Pages. Mientras el repositorio sea privado, la publicación se omite. La configuración del repositorio usa **Settings → Pages → Source → GitHub Actions**. No se necesita dominio propio, servidor de pago ni servicios de terceros para este portfolio.

## Alcance del CV

El CV es una selección técnica de proyectos, sin cronología laboral, certificaciones o títulos inferidos. Se puede imprimir o guardar como PDF desde el navegador. El contacto público es el perfil de GitHub; otros datos personales se incorporan cuando el titular los indique.
