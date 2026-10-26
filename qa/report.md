# Validación del portfolio

26 de octubre de 2026. Resultado local: aprobado.

Build y seis pruebas de contrato aprobados: 37 casos únicos con implementación y stack; ausencia de identidad corporativa; recursos y enlaces relativos válidos; estructura de documentos y CV.

Playwright MCP: filtros combinados, búsqueda sin acentos, vacío y recuperación, todos los casos por ancla, navegación anterior/siguiente y atrás del navegador, recuperación de ancla desconocida y apertura del CV. La etiqueta accesible del selector de tecnología se corrigió durante la validación y se volvió a comprobar.

Verificados escritorio de 1440px, móvil de 390px y tema oscuro. Sin desborde horizontal en catálogo y detalle. Sin errores de JavaScript durante los recorridos. El botón del CV invoca la impresión nativa; guardar el PDF depende del diálogo del navegador del visitante.

La validación cubre el portfolio. No prueba las aplicaciones de clientes ni sus servicios externos.

Publicación pública pendiente de autorización. El repositorio se conserva privado y el workflow omite despliegues mientras mantenga esa visibilidad.

Revisión adicional: reconciliados los stacks de las fichas con los metadatos usados en los filtros, y corregidas las rutas del CV para navegar también desde una copia file://. Dos pruebas de regresión reprodujeron ambos fallos antes de la corrección y pasan después.

Revisión independiente posterior a las correcciones: seis pruebas y ambas comprobaciones de sintaxis aprobadas; sin bloqueos críticos o importantes para la entrega privada. GitHub Actions también valida la rama de entrega.
