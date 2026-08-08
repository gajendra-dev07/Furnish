/**
 * One-time migration:
 * 1. Ensure public bucket `product-images` exists
 * 2. Upload every file under public/images/products and public/images/categories
 * 3. Rewrite product_images.url and categories.image_url from /images/... → Storage public URLs
 *
 * Usage (from project root):
 *   node scripts/migrate-images-to-supabase.mjs
 */

import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, relative, extname } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");
const BUCKET = "product-images";

function loadEnv() {
  const envPath = join(ROOT, ".env.local");
  if (!existsSync(envPath)) {
    throw new Error(".env.local not found");
  }
  const text = readFileSync(envPath, "utf8");
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function walkFiles(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walkFiles(full));
    else out.push(full);
  }
  return out;
}

function contentType(filePath) {
  const ext = extname(filePath).toLowerCase();
  const map = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
  };
  return map[ext] || "application/octet-stream";
}

async function main() {
  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: ws },
  });

  console.log("Ensuring storage bucket exists…");
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = (buckets || []).some((b) => b.id === BUCKET || b.name === BUCKET);
  if (!exists) {
    const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    });
    if (createErr) {
      console.warn("createBucket warning:", createErr.message);
    } else {
      console.log("Created public bucket:", BUCKET);
    }
  } else {
    console.log("Bucket already exists:", BUCKET);
    await supabase.storage.updateBucket(BUCKET, { public: true });
  }

  const uploadRoots = [
    join(ROOT, "public", "images", "products"),
    join(ROOT, "public", "images", "categories"),
  ];

  const files = uploadRoots.flatMap(walkFiles).filter((f) => {
    const ext = extname(f).toLowerCase();
    return [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext);
  });

  if (files.length === 0) {
    throw new Error(
      "No image files found under public/images/products or public/images/categories"
    );
  }

  console.log(`Uploading ${files.length} images…`);

  /** Map local public path → storage public URL
   *  e.g. /images/products/foo.jpg → https://.../storage/v1/object/public/product-images/products/foo.jpg
   */
  const urlMap = new Map();
  let uploaded = 0;
  let skipped = 0;

  for (const filePath of files) {
    const relFromPublic = relative(join(ROOT, "public"), filePath).replace(
      /\\/g,
      "/"
    );
    // storage path without leading "images/"
    // public/images/products/x.jpg → products/x.jpg
    const storagePath = relFromPublic.replace(/^images\//, "");
    const localUrl = `/${relFromPublic}`;
    const buffer = readFileSync(filePath);

    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: contentType(filePath),
        upsert: true,
      });

    if (uploadErr) {
      console.error(`  FAIL ${storagePath}:`, uploadErr.message);
      continue;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

    urlMap.set(localUrl, publicUrl);
    // also map encoded / space variants if filenames have spaces
    urlMap.set(encodeURI(localUrl), publicUrl);
    uploaded++;
    console.log(`  OK  ${localUrl}`);
  }

  console.log(`\nUploaded: ${uploaded}, skipped/failed: ${files.length - uploaded}`);

  // Rewrite product_images
  console.log("\nUpdating product_images URLs in database…");
  const { data: images, error: imgErr } = await supabase
    .from("product_images")
    .select("id, url");

  if (imgErr) throw imgErr;

  let updatedImages = 0;
  for (const row of images || []) {
    if (!row.url) continue;
    if (row.url.startsWith("http")) {
      skipped++;
      continue;
    }
    const next = urlMap.get(row.url) || urlMap.get(decodeURI(row.url));
    if (!next) {
      console.warn(`  No upload match for product_images: ${row.url}`);
      continue;
    }
    const { error } = await supabase
      .from("product_images")
      .update({ url: next })
      .eq("id", row.id);
    if (error) {
      console.error(`  FAIL update image ${row.id}:`, error.message);
    } else {
      updatedImages++;
    }
  }
  console.log(`Updated product_images rows: ${updatedImages}`);

  // Rewrite categories.image_url
  console.log("\nUpdating categories.image_url…");
  const { data: cats, error: catErr } = await supabase
    .from("categories")
    .select("id, image_url");

  if (catErr) throw catErr;

  let updatedCats = 0;
  for (const row of cats || []) {
    if (!row.image_url) continue;
    if (row.image_url.startsWith("http")) continue;
    const next = urlMap.get(row.image_url) || urlMap.get(decodeURI(row.image_url));
    if (!next) {
      console.warn(`  No upload match for category: ${row.image_url}`);
      continue;
    }
    const { error } = await supabase
      .from("categories")
      .update({ image_url: next })
      .eq("id", row.id);
    if (error) {
      console.error(`  FAIL update category ${row.id}:`, error.message);
    } else {
      updatedCats++;
    }
  }
  console.log(`Updated categories rows: ${updatedCats}`);

  console.log("\nDone. Sample mapped URL:");
  const sample = [...urlMap.entries()][0];
  if (sample) console.log(`  ${sample[0]} → ${sample[1]}`);
}

main().catch((err) => {
  console.error("\nMigration failed:", err.message);
  process.exit(1);
});
