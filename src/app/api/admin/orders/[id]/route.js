import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// Mirrors the CHECK constraint on orders.status, minus `pending`:
// pending means "created but not paid" and is set by the payment flow only.
const SETTABLE_STATUSES = [
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

// GET /api/admin/orders/[id] — full order with line items and customer
export async function GET(_request, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const admin = createAdminClient();

  const { data, error: dbErr } = await admin
    .from("orders")
    .select(
      `
      id, status, subtotal, gst_amount, total, shipping_address,
      razorpay_order_id, razorpay_payment_id, needs_review, review_reason,
      created_at, updated_at,
      profiles(id, full_name, email, phone),
      order_items(id, quantity, unit_price, selected_color, product_snapshot, product_id)
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (dbErr) {
    return NextResponse.json({ error: dbErr.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order: data });
}

// PATCH /api/admin/orders/[id] — move an order through fulfilment
export async function PATCH(request, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const status = body?.status;
  const clearReview = body?.clearReview === true;

  if (status !== undefined && !SETTABLE_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: `status must be one of: ${SETTABLE_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  if (status === undefined && !clearReview) {
    return NextResponse.json(
      { error: "Nothing to update" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const { data: existing, error: findErr } = await admin
    .from("orders")
    .select("id, status")
    .eq("id", id)
    .maybeSingle();

  if (findErr) {
    return NextResponse.json({ error: findErr.message }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // An unpaid order has no money behind it — moving it into fulfilment
  // would be lying about a sale that never happened.
  if (existing.status === "pending") {
    return NextResponse.json(
      {
        error:
          "This order has not been paid for yet. It will confirm itself once payment is captured.",
      },
      { status: 409 }
    );
  }

  const patch = { updated_at: new Date().toISOString() };
  if (status !== undefined) patch.status = status;
  if (clearReview) {
    patch.needs_review = false;
    patch.review_reason = null;
  }

  const { data, error: updateErr } = await admin
    .from("orders")
    .update(patch)
    .eq("id", id)
    .select("id, status, needs_review, review_reason, updated_at")
    .single();

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ order: data });
}
