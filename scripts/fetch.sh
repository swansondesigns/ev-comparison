#!/usr/bin/env bash
# Fetch one page with browser-like headers and save it to sources/.
# Usage: scripts/fetch.sh <url> <slug> [ext]   (ext defaults to html)
# Writes sources/<slug>.<ext> and appends a line to sources/fetch-log.tsv.
# Set REFERER=<page url> for hosts that refuse hotlinked files.
set -u
url="$1"
slug="$2"
ext="${3:-html}"
root="$(cd "$(dirname "$0")/.." && pwd)"
out="$root/sources/$slug.$ext"
extra=()
[ -n "${REFERER:-}" ] && extra=(-H "Referer: $REFERER")

status=$(curl -sS -L --compressed -o "$out" -w '%{http_code}' "${extra[@]}" \
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36' \
  -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8' \
  -H 'Accept-Language: en-US,en;q=0.9' \
  -H 'Upgrade-Insecure-Requests: 1' \
  -H 'Sec-Fetch-Dest: document' \
  -H 'Sec-Fetch-Mode: navigate' \
  -H 'Sec-Fetch-Site: none' \
  -H 'Sec-Fetch-User: ?1' \
  "$url")

size=$(wc -c < "$out")
printf '%s\t%s\t%s\t%s\t%s\n' "$(date +%F)" "$status" "$size" "$slug" "$url" >> "$root/sources/fetch-log.tsv"
echo "$status $size $slug"
