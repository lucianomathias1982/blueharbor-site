#!/usr/bin/env bash
# Exporta a versão web do app BlueHarbor (modo demonstração) para app/ deste site.
# Uso: ./scripts/build-app.sh [caminho do repo blueharbor] [baseUrl]
set -euo pipefail

SITE="$(cd "$(dirname "$0")/.." && pwd)"
APP_REPO="${1:-$SITE/../blueharbor}"
BASE_URL="${2:-/blueharbor-site/app}"
MOBILE="$APP_REPO/apps/mobile"
CONFIG="$MOBILE/app.config.js"

# baseUrl só vale para este export: um app.config.js temporário sobrepõe o app.json.
[ -e "$CONFIG" ] && { echo "Já existe $CONFIG; não vou sobrescrever." >&2; exit 1; }
trap 'rm -f "$CONFIG"' EXIT
cat > "$CONFIG" <<JS
module.exports = ({ config }) => ({
  ...config,
  experiments: { ...config.experiments, baseUrl: '$BASE_URL' },
});
JS

# Sem .env.local o app roda em modo demonstração; garanta que nenhuma chave entre no site.
[ -e "$MOBILE/.env.local" ] && { echo "Remova $MOBILE/.env.local antes: o export público deve ser só demonstração." >&2; exit 1; }

rm -rf "$MOBILE/dist"
(cd "$MOBILE" && npx expo export --platform web --output-dir dist)

rm -rf "$SITE/app"
cp -R "$MOBILE/dist" "$SITE/app"

# GitHub Pages não tem rewrite: rotas profundas do app (/app/poita/...) caem no 404.html,
# que carrega o próprio app. Fora de /app, volta para a página inicial.
{
  printf '<script>if(!location.pathname.startsWith("%s"))location.replace("%s/");</script>\n' "$BASE_URL" "${BASE_URL%/app}"
  cat "$SITE/app/index.html"
} > "$SITE/404.html"

echo "App exportado em $SITE/app"
