/**
 * Server-only Razorpay client.
 * Uses RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET — never import this from client code.
 *
 * This talks to the REST API over fetch rather than using the `razorpay` npm
 * SDK. The SDK depends on axios, which pulls in node:http2 and https-proxy-agent;
 * neither exists on Cloudflare Workers, so every payment route 500'd in
 * production while working fine under `next dev` on Node.
 */

const API_BASE = "https://api.razorpay.com/v1";

function authHeader() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not configured");
  }

  return `Basic ${btoa(`${keyId}:${keySecret}`)}`;
}

async function razorpayRequest(path, init = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const detail = body?.error?.description || `HTTP ${res.status}`;
    throw new Error(`Razorpay request failed: ${detail}`);
  }

  return body;
}

export function createRazorpayOrder({ amount, currency, receipt, notes }) {
  return razorpayRequest("/orders", {
    method: "POST",
    body: JSON.stringify({ amount, currency, receipt, notes }),
  });
}

export function fetchRazorpayOrder(orderId) {
  return razorpayRequest(`/orders/${encodeURIComponent(orderId)}`);
}

export function getRazorpayKeyId() {
  // Prefer the public key for Checkout.js; fall back to server key id.
  return (
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    process.env.RAZORPAY_KEY_ID ||
    null
  );
}
