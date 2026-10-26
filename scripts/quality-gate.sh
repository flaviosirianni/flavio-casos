#!/usr/bin/env bash
# Por que existe: validar el sitio en cualquier checkout sin depender de skills locales.
# @returns: 0 si las comprobaciones pasan. Efectos secundarios: recompila dist/.
set -euo pipefail
cd "$(dirname "$0")/.."
python3 -m unittest discover -s tests -v
node --check src/app.js
node --check src/demos.js
node --check src/theme.js
node --check src/cv.js
