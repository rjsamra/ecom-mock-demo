#!/usr/bin/env bash
# agentStop adapter. Invokes scripts/validate-feature.sh and prints one decision.
# Hook stdout is progress lines plus a single JSON object. Check output goes to stderr.
set -euo pipefail

root=$(cd "$(dirname "$0")/.." && pwd)
cd "$root"

input=$(cat || true)

active=$(printf '%s' "$input" | node --input-type=module -e '
let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  raw += chunk;
});
process.stdin.on("end", () => {
  if (!raw.trim()) {
    process.stdout.write("0");
    return;
  }
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    console.error("Invalid agentStop JSON payload.");
    process.exit(1);
  }
  process.stdout.write(data.stop_hook_active === true ? "1" : "0");
});
')

allow() {
  node --input-type=module -e 'process.stdout.write(JSON.stringify({ decision: "allow" }) + "\n")'
}

if [[ "$active" == "1" ]]; then
  echo "agentStop already continued this turn; skipping feature validation." >&2
  allow
  exit 0
fi

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  if [[ -z "$(git status --porcelain)" ]]; then
    echo "No repository changes; skipping feature validation." >&2
    allow
    exit 0
  fi
fi

node --input-type=module -e 'process.stdout.write(JSON.stringify({ type: "progress", message: "Running scripts/validate-feature.sh" }) + "\n")'

set +e
output=$(./scripts/validate-feature.sh 2>&1)
status=$?
set -e

printf '%s\n' "$output" >&2

printf '%s\n' "$output" | node --input-type=module -e '
let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  raw += chunk;
});
process.stdin.on("end", () => {
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    process.stdout.write(JSON.stringify({ type: "progress", message: line }) + "\n");
  }
});
'

if [[ "$status" -eq 0 ]]; then
  allow
  exit 0
fi

printf '%s' "$output" | STATUS="$status" node --input-type=module -e '
let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  raw += chunk;
});
process.stdin.on("end", () => {
  const tail = raw.trim().split("\n").slice(-30).join("\n").slice(-2000);
  const reason = [
    `scripts/validate-feature.sh failed with exit ${process.env.STATUS}.`,
    "Fix the failing check. Do not invoke this hook yourself.",
    tail,
  ].join("\n");
  process.stdout.write(JSON.stringify({ decision: "block", reason }) + "\n");
});
'
exit 0
