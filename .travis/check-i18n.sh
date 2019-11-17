#!/bin/sh

set -o errexit
set -o nounset

npm run vue-i18n-extract -- report -v './src/**/*.vue' -l './src/i18n/*.json' -o i18n-report.json

grep -q '{"missingKeys":\[\],"unusedKeys":\[\]}' i18n-report.json
