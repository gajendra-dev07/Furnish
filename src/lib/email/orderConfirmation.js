import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";

const inr = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Send the "we got your order" email.
 *
 * Deliberately a no-op (not an error) when Resend isn't configured, so that
 * a missing API key can never turn a successful payment into a failed order.
 * The caller also wraps this in try/catch for the same reason.
 *
 * @param {string} orderId  orders.id
 * @returns {Promise<{sent: boolean, reason?: string}>}
 */
export async function sendOrderConfirmationEmail(orderId) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    return { sent: false, reason: "Resend not configured" };
  }

  const admin = createAdminClient();

  const { data: order, error } = await admin
    .from("orders")
    .select(
      `
      id, status, subtotal, gst_amount, total, shipping_address, created_at,
      order_items(quantity, unit_price, selected_color, product_snapshot)
    `
    )
    .eq("id", orderId)
    .single();

  if (error || !order) {
    return { sent: false, reason: error?.message || "Order not found" };
  }

  const shipping = order.shipping_address || {};
  const to = shipping.email;
  if (!to) return { sent: false, reason: "No recipient email on order" };

  const orderNumber = `FURNISH-${String(order.id).slice(0, 8).toUpperCase()}`;

  const rows = (order.order_items || [])
    .map((item) => {
      const snap = item.product_snapshot || {};
      const colour = item.selected_color
        ? ` <span style="color:#8a8078">(${escapeHtml(item.selected_color)})</span>`
        : "";
      return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee7e0">
            ${escapeHtml(snap.name || "Item")}${colour}<br>
            <span style="color:#8a8078;font-size:13px">Qty ${item.quantity}</span>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #eee7e0;text-align:right;white-space:nowrap">
            ${inr(item.unit_price * item.quantity)}
          </td>
        </tr>`;
    })
    .join("");

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#3d2c29">
    <h1 style="font-size:22px;margin:0 0 4px">Thank you for your order</h1>
    <p style="color:#8a8078;margin:0 0 24px">Order ${escapeHtml(orderNumber)}</p>

    <table style="width:100%;border-collapse:collapse">${rows}</table>

    <table style="width:100%;border-collapse:collapse;margin-top:12px">
      <tr>
        <td style="padding:4px 0;color:#8a8078">Subtotal</td>
        <td style="padding:4px 0;text-align:right">${inr(order.subtotal)}</td>
      </tr>
      ${order.gst_amount > 0 ? `<tr>
        <td style="padding:4px 0;color:#8a8078">GST</td>
        <td style="padding:4px 0;text-align:right">${inr(order.gst_amount)}</td>
      </tr>` : `<tr>
        <td style="padding:4px 0;color:#8a8078">Taxes</td>
        <td style="padding:4px 0;text-align:right">Included</td>
      </tr>`}

      <tr>
        <td style="padding:10px 0;font-weight:600;border-top:1px solid #eee7e0">Total paid</td>
        <td style="padding:10px 0;text-align:right;font-weight:600;border-top:1px solid #eee7e0">${inr(order.total)}</td>
      </tr>
    </table>

    <h2 style="font-size:15px;margin:28px 0 8px">Delivering to</h2>
    <p style="margin:0;color:#5b4f49;line-height:1.6">
      ${escapeHtml(`${shipping.firstName || ""} ${shipping.lastName || ""}`.trim())}<br>
      ${escapeHtml(shipping.address)}<br>
      ${escapeHtml(shipping.city)}, ${escapeHtml(shipping.state)} ${escapeHtml(shipping.zip)}<br>
      ${escapeHtml(shipping.phone)}
    </p>

    <p style="color:#8a8078;font-size:13px;margin-top:28px">
      We'll email you again as soon as your order ships.
    </p>
  </div>`;

  const resend = new Resend(apiKey);

  const { error: sendErr } = await resend.emails.send({
    from,
    to,
    subject: `Your Furnis order ${orderNumber}`,
    html,
  });

  if (sendErr) return { sent: false, reason: sendErr.message };
  return { sent: true };
}
