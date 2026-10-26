# Portfolio personal

Sitio estático: HTML, CSS, JavaScript y compilador Python estándar. Mantener identidad de Flavio Sirianni y el catálogo completo. No publicar nombres de clientes, datos reales, claves o enlaces a repositorios privados.

Trabajar en ramas de tarea y publicar desde main solo después de validar. Para actualizar el sitio: ejecutar `python3 -m unittest discover -s tests -v`, `node --check src/app.js` y `node --check src/cv.js`. Toda modificación de navegación o filtros exige recorrido real en navegador móvil y escritorio, con evidencia en qa/runtime-evidence.tsv.

Los estados de proyectos se basan en código y documentación; no inferir que todos están en producción. Mantener documentación de funciones y tracker de calidad según GUIDELINES_DESARROLLO.md.

## Registro editorial privado

Antes de agregar, quitar o reconstruir casos, leer `../.flavio-portfolio-internal/README.md` y `registry.json`, resolviendo la ruta respecto del checkout principal (`git worktree list`), no de un worktree temporal. El registro está fuera de Git y no debe copiarse a archivos públicos. Respetar exclusiones explícitas y aliases; un pedido genérico de nuevos proyectos no las revoca. No confundir ausencias con exclusiones: los candidatos no catalogados requieren revisión. Si el registro falta, recuperarlo o consultar al titular antes de ampliar el catálogo. Actualizarlo al incorporar o retirar casos.
