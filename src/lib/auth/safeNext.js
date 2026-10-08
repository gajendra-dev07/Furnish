/**
 * Only allow same-site relative paths as post-auth redirect targets.
 * Blocks "https://evil.com", "//evil.com", "/\evil.com" and "@evil.com"
 * style values that would otherwise turn ?next= into an open redirect.
 */
export function safeNext(value, fallback = "/") {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
