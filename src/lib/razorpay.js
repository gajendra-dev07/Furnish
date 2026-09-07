import Razorpay from "razorpay";

/**
 * Server-only Razorpay client.
 * Uses RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET — never import this from client code.
 */
export function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error("Razorpay credentials are not configured");
  }

  return new Razorpay({ key_id, key_secret });
}

export function getRazorpayKeyId() {
  // Prefer the public key for Checkout.js; fall back to server key id.
  return (
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    process.env.RAZORPAY_KEY_ID ||
    null
  );
}
