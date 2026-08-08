/**
 * Upload homepage hero + logo assets to Supabase Storage
 * and print the public URL map.
 */
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BUCKET = "product-images";

function loadEnv() {
  const env = {};
  for (const line of readFileSync(join(ROOT, ".env.local"), "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i > 0) env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return env;
}

const files = [
  { local: "public/images/hero-tray-1.jpg", storage: "hero/hero-tray-1.jpg" },
  { local: "public/images/hero-tray-2.jpg", storage: "hero/hero-tray-2.jpg" },
  { local: "public/images/hero-board-1.jpg", storage: "hero/hero-board-1.jpg" },
  { local: "public/images/hero-board-2.jpg", storage: "hero/hero-board-2.jpg" },
  { local: "public/images/hero.png", storage: "hero/hero.png" },
  { local: "public/images/hero_acacia_spread.png", storage: "hero/hero_acacia_spread.png" },
  { local: "public/images/logo/furnis-logo.png", storage: "logo/furnis-logo.png" },
];

async function main() {
  const env = loadEnv();
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: ws },
  });

  const map = {};

  for (const f of files) {
    const full = join(ROOT, f.local);
    if (!existsSync(full)) {
      console.warn("MISSING", f.local);
      continue;
    }
    const buffer = readFileSync(full);
    const ext = f.local.split(".").pop().toLowerCase();
    const contentType =
      ext === "png" ? "image/png" : ext === "jpg" || ext === "jpeg" ? "image/jpeg" : "application/octet-stream";

    const { error } = await supabase.storage.from(BUCKET).upload(f.storage, buffer, {
      contentType,
      upsert: true,
    });
    if (error) {
      console.error("FAIL", f.storage, error.message);
      continue;
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(f.storage);
    map[f.local.replace("public", "")] = publicUrl;
    console.log("OK", f.local, "→", publicUrl);
  }

  console.log("\nURL_MAP_JSON");
  console.log(JSON.stringify(map, null, 2));
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
