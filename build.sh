#!/usr/bin/env bash
# Por que existe: entrada de build compatible con el flujo original.
# @returns: código del compilador Python. Efectos secundarios: regenera dist/.
set -euo pipefail
cd "$(dirname "$0")"
exec python3 build.py
