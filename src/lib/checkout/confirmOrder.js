import { createAdminClient } from "@/lib/supabase/admin";
import { getRazorpayClient } from "@/lib/razorpay";
import { sendOrderConfirmationEmail } from "@/lib/email/orderConfirmation";

/**
 * Human-facing order reference. Kept in one place so the checkout screen,
 * the account order list and the confirmation email all agree.
 */
export function orderNumberFor(orderId) {
  return `FURNISH-${String(orderId).slice(0, 8).toUpperCase()}`;
}

/**
 * Confirm a paid Razorpay order.
 *
 * Called from two places that race each other by design:
 *   - /api/razorpay/verify  (the customer's browser, immediately after payment)
 *   - /api/razorpay/webhook (Razorpay server-to-server, payment.captured)
 *
 * All the mutating work lives in the confirm_order() Postgres function, which
 * locks the order row and is a no-op on an already-confirmed order. Whichever
 * caller gets there first wins; the other returns alreadyConfirmed.
 *
 * @param {string} razorpayOrderId
 * @param {string|null} razorpayPaymentId
 * @param {{ expectUserId?: string, verifyAmount?: boolean, paidAmountPaise?: number }} [opts]
 */
export async function confirmPaidOrder(
  razorpayOrderId,
  razorpayPaymentId,
  opts = {}
) {
  const { expectUserId, verifyAmount = true, paidAmountPaise } = opts;
  const admin = createAdminClient();

  const { data: order, error: lookupErr } = await admin
    .from("orders")
    .select("id, user_id, status, total, needs_review")
    .eq("razorpay_order_id", razorpayOrderId)
    .maybeSingle();

  if (lookupErr) throw new Error(lookupErr.message);
  if (!order) {
    throw new Error(`No order found for payment ${razorpayOrderId}`);
  }

  if (expectUserId && order.user_id !== expectUserId) {
    const err = new Error("Payment order does not belong to this user");
    err.status = 403;
    throw err;
  }

  // Cross-check what Razorpay thinks was charged against what we recorded,
  // so a tampered client can't pay ₹1 for a ₹10,000 basket.
  if (verifyAmount) {
    const expectedPaise = Math.round(Number(order.total) * 100);

    // The webhook payload is already signature-verified and carries the
    // amount, so it passes it in and we skip the extra round trip. The
    // browser path has no trustworthy amount and must ask Razorpay.
    let actualPaise = paidAmountPaise;
    if (actualPaise == null) {
      const razorpay = getRazorpayClient();
      const rzOrder = await razorpay.orders.fetch(razorpayOrderId);
      actualPaise = rzOrder ? Number(rzOrder.amount) : null;
    }

    if (Number(actualPaise) !== expectedPaise) {
      const err = new Error("Payment amount does not match order total");
      err.status = 400;
      throw err;
    }
  }

  const { data, error: rpcErr } = await admin.rpc("confirm_order", {
    p_razorpay_order_id: razorpayOrderId,
    p_razorpay_payment_id: razorpayPaymentId || null,
  });

  if (rpcErr) throw new Error(rpcErr.message);

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error("confirm_order returned no result");

  const result = {
    orderId: row.order_id,
    orderNumber: orderNumberFor(row.order_id),
    status: row.order_status,
    total: row.order_total,
    alreadyProcessed: row.already_confirmed,
    needsReview: row.order_needs_review,
  };

  // First confirmation only — don't email twice when verify and the
  // webhook both land. Never let a mail failure fail a paid order.
  if (!result.alreadyProcessed) {
    try {
      await sendOrderConfirmationEmail(result.orderId);
    } catch (mailErr) {
      console.error("[confirmOrder] confirmation email failed", mailErr);
    }
  }

  return result;
}
