#!/bin/bash
#
# Renders favicon.svg into the home-screen icons (icon-180/192/512.png).
# The artwork is scaled down and centered on a transparent square, so
# the rounded corners iOS applies never cut into it.
#
# Needs: inkscape, ImageMagick (magick or convert)
#
# Usage: ./make-icons.sh [artwork-percent]   (default 68 = 16% border per side)

set -e

cd "$(dirname "$0")"

SOURCE=favicon.svg
SIZES="180 192 512"
PERCENT="${1:-68}"

if ! command -v inkscape >/dev/null; then
  echo "inkscape is required" >&2
  exit 1
fi
if command -v magick >/dev/null; then
  IM=magick
elif command -v convert >/dev/null; then
  IM=convert
else
  echo "ImageMagick is required" >&2
  exit 1
fi

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

for size in $SIZES; do
  inner=$(( size * PERCENT / 100 ))
  inkscape "$SOURCE" --export-type=png --export-filename="$TMP/inner.png" -w "$inner" -h "$inner" >/dev/null 2>&1
  $IM -background none "$TMP/inner.png" -gravity center -extent "${size}x${size}" "icon-$size.png"
  echo "icon-$size.png ($inner px artwork on ${size}x${size})"
done
