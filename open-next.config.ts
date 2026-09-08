// OpenNext Cloudflare adapter config.
// See https://opennext.js.org/cloudflare
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// No incremental cache override: this store reads live product data from
// Supabase on each request, so there is little to cache. To add R2-backed
// ISR caching later, create the bucket and pass `incrementalCache`.
export default defineCloudflareConfig();
