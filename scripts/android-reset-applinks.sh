#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MANIFEST_PATH="$PROJECT_ROOT/android/app/src/main/AndroidManifest.xml"

perl -0777 -i -pe 's#\n?\s*<!-- APP_LINKS_START -->.*?<!-- APP_LINKS_END -->##s' "$MANIFEST_PATH"

echo "✅ Android App Links changes removed"