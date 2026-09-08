import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { confirmPaidOrder } from "@/lib/checkout/confirmOrder";

export const runtime = "nodejs";

function verifySignature(orderId, paymentId, signature) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
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

/**
 * POST /api/razorpay/verify
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 *
 * The fast path: the customer's browser reports a successful payment, so we
 * can show them a confirmed order immediately rather than making them wait
 * for the webhook.
 *
 * Cart contents and the shipping address are NOT read from this request —
 * they were persisted as a `pending` order by /api/razorpay/create-order.
 * This route only proves the payment is genuine and confirms that order.
 */
export async function POST(request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Please sign in to complete your order" },
        { status: 401 }
      );
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = (await request.json()) || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment verification fields" },
        { status: 400 }
      );
    }

    if (
      !verifySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      )
    ) {
      return NextResponse.json(
        { error: "Payment signature verification failed" },
        { status: 400 }
      );
    }

    const result = await confirmPaidOrder(
      razorpay_order_id,
      razorpay_payment_id,
      { expectUserId: user.id }
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error("[verify]", err);
    return NextResponse.json(
      { error: err?.message || "Failed to verify payment" },
      { status: err?.status || 500 }
    );
  }
}
