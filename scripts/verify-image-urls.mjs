import ws from "ws";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = {};
for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i > 0) env[t.slice(0, i)] = t.slice(i + 1);
}

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: { transport: ws },
});

const { data } = await sb.from("product_images").select("url").limit(5);
console.log("Sample product_images URLs:");
for (const r of data || []) console.log(" -", r.url);

const { count: localCount } = await sb
  .from("product_images")
  .select("*", { count: "exact", head: true })
  .like("url", "/images/%");

const { count: httpsCount } = await sb
  .from("product_images")
  .select("*", { count: "exact", head: true })
  .like("url", "https://%");

console.log("\nLocal /images/ URLs remaining:", localCount);
console.log("HTTPS URLs in product_images:", httpsCount);

const { data: cats } = await sb.from("categories").select("name, image_url");
console.log("\nCategory images:");
for (const c of cats || []) console.log(` - ${c.name}: ${c.image_url}`);
