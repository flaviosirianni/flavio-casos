# Flavio Sirianni · Project portfolio

**Live website:** https://flaviosirianni.github.io/flavio-sirianni-projects/

Personal portfolio with **36 cases, Spanish and English, and 144 project-specific demo scenes**. Every project includes its technical implementation, complete stack and a guided interactive simulation. The catalog supports search, combined filters, animated previews, dark mode and mobile layouts. The technical CV is available in both languages and can be printed or saved as PDF.

## Local preview

Requires Python 3.10+; Node.js is used only for JavaScript syntax checks. No production dependencies or API keys.

```sh
./build.sh
python3 -m http.server 4174 --directory dist
```

Open http://localhost:4174 for Spanish or http://localhost:4174/en/ for English. The entire `dist/` folder is portable and can also be opened through `index.html` directly.

```sh
bash scripts/quality-gate.sh
```

## Structure

- `src/tools/`: 36 Spanish case fragments, verified against the source projects.
- `src/tools-en/`: matching English fragments with the same case IDs.
- `src/demos/`: one bilingual JSON walkthrough per case. Each scene defines localized text, a view type and fictional records.
- `src/demos.js`: scene renderer and player: play/pause, previous/next, restart, speed and direct step selection. It pauses outside the viewport and respects reduced motion.
- `src/app.js`: search, category and technology filters, shared-link handling and player mounting.
- `src/theme.js`: optional theme preference, loaded before paint.
- `src/styles.css`: responsive catalog, case pages and six simulation view types.
- `src/cv.css`, `src/cv.js`: printable CV layout and print control.
- `build.py`: dependency-free compiler for both catalogs, 72 case pages and two CVs.
- `tests/test_site.py`: release contracts for localization, content coverage, relative paths, stacks and portable output.
- `qa/`: runtime evidence and validation scope.

## Content and demos

All customer identities and operational records are replaced with fictional examples. The demonstrations illustrate implemented functions; they do not connect to live customer systems. Validation, prototype and beta states remain explicit. Inspect source code before changing a capability claim. Private source paths, customer names and source-audit records must remain outside this public repository.

A demo contains `slug`, `kind`, bilingual `title`, and a `steps` array. Each step has bilingual `title`, `description`, `action` and `view`. The renderer supports `chat`, `table`, `form`, `pipeline`, `chart` and `terminal`. Every screen label and sample record needs both languages.

When changing a case, update its Spanish fragment, English fragment and demo together. The build requires 36 unique matching case IDs. All visible technologies must also appear in `data-stack` so filters and the CV remain complete.

## Deployment

GitHub Actions validates the build and publishes only `dist/` to GitHub Pages from `main`. The portfolio repository is intentionally public. Other application repositories remain private. GitHub Pages is configured with **Source → GitHub Actions**.

Language routes: `index.html`, `en/index.html`; cases: `projects/<slug>.html`, `en/projects/<slug>.html`; CVs: `cv.html`, `en/cv.html`. Language switching preserves the case and selected demo scene. Older links with a case hash resolve to the standalone case page.
