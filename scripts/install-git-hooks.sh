#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOOKS_DIR="$ROOT_DIR/.git/hooks"
PRE_PUSH="$HOOKS_DIR/pre-push"

if [[ ! -d "$ROOT_DIR/.git" ]]; then
  echo "ERROR: $ROOT_DIR no es un repo git inicializado"
  exit 1
fi

mkdir -p "$HOOKS_DIR"

cat > "$PRE_PUSH" <<'HOOK'
#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

if command -v pnpm >/dev/null 2>&1 && [[ -f package.json ]] && rg -q '"quality:gate"' package.json; then
  pnpm run quality:gate
else
  bash ./scripts/quality-gate.sh
fi
HOOK

chmod +x "$PRE_PUSH"
echo "HOOK_INSTALLED=$PRE_PUSH"
