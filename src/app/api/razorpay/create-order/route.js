import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRazorpayClient, getRazorpayKeyId } from "@/lib/razorpay";
import {
  buildPricedLineItems,
  computeOrderTotals,
} from "@/lib/checkout/orderTotals";

export const runtime = "nodejs";

/**
 * POST /api/razorpay/create-order
 * Body: { items: [{ productId, quantity, selectedColor? }] }
 *
 * Recalculates totals from live product prices (never trusts browser amounts),
 * creates a Razorpay order in INR, and returns Checkout.js options.
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
        { error: "Payment is not configured. Add Razorpay test keys to .env.local." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const items = body?.items;

    const lineItems = await buildPricedLineItems(supabase, items);
    const { subtotal, gst_amount, total, amountPaise } =
      computeOrderTotals(lineItems);

    const razorpay = getRazorpayClient();
    const receipt = `furnish_${user.id.slice(0, 8)}_${Date.now()}`;

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: receipt.slice(0, 40),
      notes: {
        user_id: user.id,
        item_count: String(lineItems.length),
      },
    });

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
      message.includes("too low")
        ? 400
        : 500;

    console.error("[create-order]", err);
    return NextResponse.json({ error: message }, { status });
  }
}
