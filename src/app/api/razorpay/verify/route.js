import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRazorpayClient } from "@/lib/razorpay";
import {
  buildPricedLineItems,
  computeOrderTotals,
  validateShippingAddress,
} from "@/lib/checkout/orderTotals";

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
 * Body: {
 *   razorpay_order_id, razorpay_payment_id, razorpay_signature,
 *   items, shippingAddress
 * }
 *
 * Verifies HMAC, recalculates cart totals from DB, confirms Razorpay order
 * amount, then persists orders + order_items.
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

    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      shippingAddress,
    } = body || {};

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

    const shipping = validateShippingAddress(shippingAddress);
    const lineItems = await buildPricedLineItems(supabase, items);
    const { subtotal, gst_amount, total, amountPaise } =
      computeOrderTotals(lineItems);

    // Confirm the Razorpay order amount matches server-calculated total
    const razorpay = getRazorpayClient();
    const rzOrder = await razorpay.orders.fetch(razorpay_order_id);

    if (!rzOrder || Number(rzOrder.amount) !== amountPaise) {
      return NextResponse.json(
        { error: "Payment amount does not match order total" },
        { status: 400 }
      );
    }

    if (rzOrder.notes?.user_id && rzOrder.notes.user_id !== user.id) {
      return NextResponse.json(
        { error: "Payment order does not belong to this user" },
        { status: 403 }
      );
    }

    const admin = createAdminClient();

    // Idempotency: return existing order if this Razorpay payment was already saved
    const { data: existing } = await admin
      .from("orders")
      .select("id, status, total")
      .eq("razorpay_order_id", razorpay_order_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        orderId: existing.id,
        orderNumber: `FURNISH-${existing.id.slice(0, 8).toUpperCase()}`,
        status: existing.status,
        total: existing.total,
        alreadyProcessed: true,
      });
    }

    const { data: order, error: orderErr } = await admin
      .from("orders")
      .insert({
        user_id: user.id,
        status: "confirmed",
        subtotal,
        gst_amount,
        total,
        shipping_address: shipping,
        razorpay_order_id,
        razorpay_payment_id,
      })
      .select("id, status, total")
      .single();

    if (orderErr) {
      // Unique violation on razorpay_order_id (race) — re-fetch
      if (orderErr.code === "23505") {
        const { data: raced } = await admin
          .from("orders")
          .select("id, status, total")
          .eq("razorpay_order_id", razorpay_order_id)
          .single();

        if (raced) {
          return NextResponse.json({
            orderId: raced.id,
            orderNumber: `FURNISH-${raced.id.slice(0, 8).toUpperCase()}`,
            status: raced.status,
            total: raced.total,
            alreadyProcessed: true,
          });
        }
      }
      throw new Error(orderErr.message);
    }

    const orderItemRows = lineItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      selected_color: item.selected_color,
      product_snapshot: item.product_snapshot,
    }));

    const { error: itemsErr } = await admin
      .from("order_items")
      .insert(orderItemRows);

    if (itemsErr) {
      // Best-effort cleanup so a half-written order isn't left confirmed
      await admin.from("orders").delete().eq("id", order.id);
      throw new Error(itemsErr.message);
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber: `FURNISH-${order.id.slice(0, 8).toUpperCase()}`,
      status: order.status,
      total: order.total,
    });
  } catch (err) {
    const message = err?.message || "Failed to verify payment";
    const status =
      message.includes("empty") ||
      message.includes("invalid") ||
      message.includes("not found") ||
      message.includes("stock") ||
      message.includes("Missing") ||
      message.includes("too low")
        ? 400
        : 500;

    console.error("[verify]", err);
    return NextResponse.json({ error: message }, { status });
  }
}
