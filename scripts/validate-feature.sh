#!/usr/bin/env bash
# Runs the existing feature checks. Does not start Playwright or the production build.
set -euo pipefail

root=$(cd "$(dirname "$0")/.." && pwd)
cd "$root"

echo "ShopSphere feature validation"
echo "Runs: lint, typecheck, unit and component tests, format check."
echo "Does not run browser or end-to-end tests."
echo "Run separately when needed:"
echo "  npm run test:e2e  Playwright; starts the dev server."
echo "  npm run build     Production build."

run_check() {
  local script=$1
  echo ""
  echo "==> npm run ${script}"
  npm run "${script}"
}

run_check lint
run_check typecheck
run_check test
run_check format:check

echo ""
echo "Feature validation passed."
echo "Not run: npm run test:e2e, npm run build."
