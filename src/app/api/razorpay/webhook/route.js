import { NextResponse } from "next/server";
import crypto from "crypto";
import { confirmPaidOrder } from "@/lib/checkout/confirmOrder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/razorpay/webhook
 *
 * The safety net. The browser can die between "payment succeeded" and
 * /api/razorpay/verify — a closed tab, a dead battery, a tunnel. Razorpay
 * calls this server-to-server regardless, so the order still gets confirmed.
 *
 * Set up in Razorpay Dashboard -> Settings -> Webhooks:
 *   URL     https://<your-domain>/api/razorpay/webhook
 *   Events  payment.captured, payment.failed
 *   Secret  -> RAZORPAY_WEBHOOK_SECRET
 *
 * Note the signing secret is NOT your API key secret; it's generated when you
 * create the webhook.
 */

function verifyWebhookSignature(rawBody, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const received = String(signature);
  if (expected.length !== received.length) return false;

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(received, "utf8")
    );
  } catch {
    return false;
  }
}

export async function POST(request) {
  // Must read the raw body: the signature is over the exact bytes sent,
  // so re-serialising parsed JSON would produce a different digest.
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    console.error("[webhook] RAZORPAY_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 503 }
    );
  }

  if (!verifyWebhookSignature(rawBody, signature)) {
    console.warn("[webhook] rejected: bad signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
  }

  const type = event?.event;
  const payment = event?.payload?.payment?.entity;

  try {
    switch (type) {
      case "payment.captured": {
        if (!payment?.order_id) break;

        const result = await confirmPaidOrder(payment.order_id, payment.id, {
          paidAmountPaise: Number(payment.amount),
        });

        console.log(
          `[webhook] payment.captured ${payment.order_id} -> ${
            result.alreadyProcessed ? "already confirmed" : "confirmed"
          }${result.needsReview ? " (NEEDS REVIEW)" : ""}`
        );
        break;
      }

      case "payment.failed": {
        // Leave the order `pending`. It is a record of an attempt, not a sale,
        // and stock was never decremented for it.
        console.log(
          `[webhook] payment.failed ${payment?.order_id}: ${
            payment?.error_description || "no reason given"
          }`
        );
        break;
      }

      default:
        // Unsubscribed events still get a 200 so Razorpay stops retrying.
        break;
    }
  } catch (err) {
    console.error(`[webhook] ${type} handler failed`, err);

    // 500 tells Razorpay to retry — right for a transient DB blip. But an
    // order we can't find is never going to appear, so don't loop on it.
    const permanent = /No order found/i.test(err?.message || "");
    if (!permanent) {
      return NextResponse.json({ error: "Handler failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
