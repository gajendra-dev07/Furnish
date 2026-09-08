// Copies .env.local -> .dev.vars so `wrangler dev` / `opennextjs-cloudflare preview`
// sees the same server-side environment the Next dev server does.
// Wrangler does not read .env.local; it reads .dev.vars. Both are git-ignored.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const SRC = ".env.local";
const OUT = ".dev.vars";

if (!existsSync(SRC)) {
  console.error(`Missing ${SRC} — copy .env.local.example first.`);
  process.exit(1);
}

const lines = readFileSync(SRC, "utf8").split(/\r?\n/);
const kept = [];
const empty = [];

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  const value = trimmed.slice(eq + 1).trim();
  if (!value) {
    empty.push(key);
    continue;
  }
  kept.push(`${key}=${value}`);
}

writeFileSync(
  OUT,
  `# Generated from ${SRC} by scripts/sync-dev-vars.mjs — do not commit.\n` +
    kept.join("\n") +
    "\n"
);

console.log(`Wrote ${OUT} with ${kept.length} vars.`);
if (empty.length) {
  console.warn(`Skipped (empty in ${SRC}): ${empty.join(", ")}`);
}
