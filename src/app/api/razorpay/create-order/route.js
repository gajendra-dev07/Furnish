import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createRazorpayOrder, getRazorpayKeyId } from "@/lib/razorpay";
import {
  buildPricedLineItems,
  computeOrderTotals,
  validateShippingAddress,
} from "@/lib/checkout/orderTotals";

export const runtime = "nodejs";

/**
 * POST /api/razorpay/create-order
 * Body: { items: [{ productId, quantity, selectedColor? }], shippingAddress }
 *
 * Recalculates totals from live product prices (never trusts browser amounts),
 * creates a Razorpay order in INR, and persists a `pending` order so the
 * webhook can confirm it even if the customer's browser never comes back.
 */
export async function POST(request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Please sign in to place an order" },
        { status: 401 }
      );
    }

    const keyId = getRazorpayKeyId();
    if (!keyId || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: "Payment is not configured. Add Razorpay keys to .env.local." },
        { status: 503 }
      );
    }

    const body = await request.json();

    // The shipping address is captured up front so the pending order is
    // complete before payment — the webhook has no browser to ask later.
    const shipping = validateShippingAddress(body?.shippingAddress);
    const lineItems = await buildPricedLineItems(supabase, body?.items);
    const { subtotal, gst_amount, total, amountPaise } =
      computeOrderTotals(lineItems);

    const receipt = `furnish_${user.id.slice(0, 8)}_${Date.now()}`;

    const order = await createRazorpayOrder({
      amount: amountPaise,
      currency: "INR",
      receipt: receipt.slice(0, 40),
      notes: {
        user_id: user.id,
        item_count: String(lineItems.length),
      },
    });

    // Persist the order as `pending`. Confirmation (status flip + stock
    // decrement) happens in confirm_order(), called by whichever of the
    // verify route or the webhook arrives first.
    const admin = createAdminClient();

    const { data: dbOrder, error: orderErr } = await admin
      .from("orders")
      .insert({
        user_id: user.id,
        status: "pending",
        subtotal,
        gst_amount,
        total,
        shipping_address: shipping,
        razorpay_order_id: order.id,
      })
      .select("id")
      .single();

    if (orderErr) {
      throw new Error(`Could not save order: ${orderErr.message}`);
    }

    const { error: itemsErr } = await admin.from("order_items").insert(
      lineItems.map((item) => ({
        order_id: dbOrder.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        selected_color: item.selected_color,
        product_snapshot: item.product_snapshot,
      }))
    );

    if (itemsErr) {
      // Don't leave a payable order with no line items behind.
      await admin.from("orders").delete().eq("id", dbOrder.id);
      throw new Error(`Could not save order items: ${itemsErr.message}`);
    }

    return NextResponse.json({
      keyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      breakdown: {
        subtotal,
        gst_amount,
        total,
      },
    });
  } catch (err) {
    const message = err?.message || "Failed to create payment order";
    const status =
      message.includes("empty") ||
      message.includes("invalid") ||
      message.includes("not found") ||
      message.includes("stock") ||
      message.includes("Missing") ||
      message.includes("required") ||
      message.includes("too low")
        ? 400
        : 500;

    console.error("[create-order]", err);
    return NextResponse.json({ error: message }, { status });
  }
}
