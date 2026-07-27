#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
if [ -f "$PROJECT_ROOT/.env" ]; then
  set -a
  source "$PROJECT_ROOT/.env"
  set +a
fi

: "${APP_LINK_HOST:?Set APP_LINK_HOST}"

MANIFEST_PATH="$PROJECT_ROOT/android/app/src/main/AndroidManifest.xml"

APP_LINKS_BLOCK=$(cat <<EOF
      <!-- APP_LINKS_START -->
      <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW"/>
        <data android:scheme="https" android:host="${APP_LINK_HOST}"/>
        <category android:name="android.intent.category.BROWSABLE"/>
        <category android:name="android.intent.category.DEFAULT"/>
      </intent-filter>
      <!-- APP_LINKS_END -->
EOF
)

export APP_LINKS_BLOCK

if grep -q 'APP_LINKS_START' "$MANIFEST_PATH"; then
  echo "✅ Android App Links already enabled for ${APP_LINK_HOST}"
  exit 0
fi

perl -0777 -i -pe 's#(<activity\b[^>]*android:name="\.MainActivity"[^>]*>)#$1 . "\n" . $ENV{APP_LINKS_BLOCK}#se' "$MANIFEST_PATH"

echo "✅ Android App Links enabled for ${APP_LINK_HOST}"