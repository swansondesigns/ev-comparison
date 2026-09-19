#!/usr/bin/env bash
# Fetch a Subaru media press kit, then its spec PDF (via the viewer page's signed S3 link).
# Usage: scripts/subaru-kit.sh <newsrelease id> <mid> <slug-prefix>
# Example: scripts/subaru-kit.sh 2460 333 subaru-2027-solterra
set -eu
id="$1"; mid="$2"; prefix="$3"
root="$(cd "$(dirname "$0")/.." && pwd)"
kit="https://media.subaru.com/newsrelease.do?id=$id&mid=$mid"

bash "$root/scripts/fetch.sh" "$kit" "$prefix-press-kit"
spec=$(tr '\n' ' ' < "$root/sources/$prefix-press-kit.html" | grep -oE 'href="/view-spec.do\?bFileId=[0-9]+"[^>]*>(\s|<[^>]+>)*[^<]*Specifications[^<]*' | head -1 | grep -oE 'bFileId=[0-9]+' || true)
[ -z "$spec" ] && { echo "no spec link in press kit"; exit 0; }

sleep 3
REFERER="$kit" bash "$root/scripts/fetch.sh" "https://media.subaru.com/view-spec.do?$spec" "$prefix-specifications-viewer"
pdf=$(grep -oE 'https://s3.amazonaws.com/subarumedia[^"]*' "$root/sources/$prefix-specifications-viewer.html" | head -1 | sed 's/&amp;/\&/g')
[ -z "$pdf" ] && { echo "no PDF link in viewer"; exit 0; }

sleep 3
bash "$root/scripts/fetch.sh" "$pdf" "$prefix-specifications" pdf
echo "spec viewer: https://media.subaru.com/view-spec.do?$spec"
