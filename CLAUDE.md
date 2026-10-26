
<!-- quality-mantra-defaults:start -->
## Quality Mantra Defaults (quality-mantra-defaults)

- Fuente de verdad:
  - `GUIDELINES_DESARROLLO.md`
  - `docs/CODE_QUALITY_TRACKER.tsv`
  - `docs/CODE_QUALITY_TRACKER_SUMMARY.md`
  - `docs/CODE_QUALITY_TEST_GAPS.md`
- Regla operativa:
  - Todo simbolo (clase/metodo/funcion) requiere docblock completo.
  - Todo simbolo requiere test_mode y referencia (test_ref o qa_ref).
- Comandos minimos:
  - `bash scripts/quality-gate.sh`
  - `bash scripts/install-git-hooks.sh`
- Ultima sincronizacion: 2026-10-26
<!-- quality-mantra-defaults:end -->

## Registro editorial privado

Antes de agregar, quitar o reconstruir casos, leer `../.flavio-portfolio-internal/README.md` y `registry.json`, resolviendo la ruta respecto del checkout principal (`git worktree list`), no de un worktree temporal. El registro está fuera de Git y no debe copiarse a archivos públicos. Respetar exclusiones explícitas y aliases; un pedido genérico de nuevos proyectos no las revoca. No confundir ausencias con exclusiones: los candidatos no catalogados requieren revisión. Si el registro falta, recuperarlo o consultar al titular antes de ampliar el catálogo. Actualizarlo al incorporar o retirar casos.
