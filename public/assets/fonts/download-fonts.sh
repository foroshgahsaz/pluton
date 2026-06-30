#!/usr/bin/env bash
# دانلود فونت‌های یکان باخ از سرور اصلی
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
BASE="https://avidgruop.ir/wp-content/uploads/2025/12"

fonts=(
  YekanBakhFaNum-Thin.woff
  YekanBakhFaNum-Light.woff
  YekanBakhFaNum-Regular.woff
  YekanBakhFaNum-SemiBold.woff
  YekanBakhFaNum-Bold.woff
  YekanBakhFaNum-ExtraBold.woff
  YekanBakhFaNum-Black.woff
)

for f in "${fonts[@]}"; do
  echo "Downloading $f ..."
  curl -fL "$BASE/$f" -o "$DIR/$f"
done

echo "Done. $(ls -1 "$DIR"/*.woff | wc -l) font files ready."
