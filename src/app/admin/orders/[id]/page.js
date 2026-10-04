import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import OrderStatusControl from "./OrderStatusControl";
import styles from "../../admin.module.css";

export const metadata = { title: "Order | Admin – Furnis" };

const BADGE = {
  delivered: styles.badgeGreen,
  confirmed: styles.badgeGreen,
  shipped: styles.badgeAmber,
  processing: styles.badgeAmber,
  pending: styles.badgeGrey,
  cancelled: styles.badgeRed,
};

const inr = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

export default async function AdminOrderDetailPage({ params }) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select(
      `
      id, status, subtotal, gst_amount, total, shipping_address,
      razorpay_order_id, razorpay_payment_id, needs_review, review_reason,
      created_at,
      profiles(full_name, email, phone),
      order_items(id, quantity, unit_price, selected_color, product_snapshot)
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (!order) notFound();

  const ship = order.shipping_address || {};
  const orderNumber = `FURNISH-${order.id.slice(0, 8).toUpperCase()}`;

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{orderNumber}</h1>
          <p className={styles.pageSub}>
            Placed{" "}
            {new Date(order.created_at).toLocaleString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            &bull;{" "}
            <span className={`${styles.badge} ${BADGE[order.status] || styles.badgeGrey}`}>
              {order.status}
            </span>
          </p>
        </div>
        <Link href="/admin/orders" className={styles.btnSecondary}>
          Back to orders
        </Link>
      </div>

      <div className={styles.pageContent}>
        {order.status === "pending" && (
          <div className={styles.formError} style={{ marginBottom: "16px" }}>
            <strong>Not paid yet.</strong> This order was created when the
            customer opened the payment window but no payment has been captured.
            It will confirm itself automatically if payment completes.
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2fr) minmax(260px, 1fr)",
            gap: "20px",
            alignItems: "start",
          }}
        >
          {/* Items + totals */}
          <div>
            <div className={styles.tableCard}>
              <div className={styles.tableHeader}>
                <h2 className={styles.tableTitle}>Items</h2>
              </div>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Unit</th>
                    <th>Line total</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.order_items || []).map((item) => {
                    const snap = item.product_snapshot || {};
                    return (
                      <tr key={item.id}>
                        <td>
                          <div className={styles.productName}>
                            {snap.name || "—"}
                          </div>
                          <div className={styles.productSlug}>
                            {snap.slug || ""}
                            {item.selected_color ? ` · ${item.selected_color}` : ""}
                          </div>
                        </td>
                        <td>{item.quantity}</td>
                        <td>{inr(item.unit_price)}</td>
                        <td>{inr(item.unit_price * item.quantity)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div
                style={{
                  padding: "14px 20px",
                  borderTop: "1px solid #eee7e0",
                  display: "grid",
                  gap: "6px",
                  justifyItems: "end",
                  fontSize: "0.9rem",
                }}
              >
                <div>Subtotal &nbsp; {inr(order.subtotal)}</div>
                {Number(order.gst_amount) > 0 && <div>GST &nbsp; {inr(order.gst_amount)}</div>}
                <div style={{ fontWeight: 600 }}>
                  Total paid &nbsp; {inr(order.total)}
                </div>

              </div>
            </div>

            <div className={styles.formCard} style={{ marginTop: "20px" }}>
              <div className={styles.formSectionTitle}>Payment</div>
              <p style={{ fontSize: "0.85rem", lineHeight: 1.8, margin: 0 }}>
                <span style={{ color: "#8a8078" }}>Razorpay order</span>{" "}
                <code>{order.razorpay_order_id || "—"}</code>
                <br />
                <span style={{ color: "#8a8078" }}>Razorpay payment</span>{" "}
                <code>{order.razorpay_payment_id || "—"}</code>
              </p>
            </div>
          </div>

          {/* Fulfilment + addresses */}
          <div style={{ display: "grid", gap: "20px" }}>
            <OrderStatusControl
              orderId={order.id}
              currentStatus={order.status}
              needsReview={order.needs_review}
              reviewReason={order.review_reason}
            />

            <div className={styles.formCard}>
              <div className={styles.formSectionTitle}>Ship to</div>
              <p style={{ fontSize: "0.85rem", lineHeight: 1.8, margin: 0 }}>
                {`${ship.firstName || ""} ${ship.lastName || ""}`.trim() || "—"}
                <br />
                {ship.address}
                <br />
                {ship.city}, {ship.state} {ship.zip}
                <br />
                {ship.phone}
                <br />
                {ship.email}
              </p>
            </div>

            <div className={styles.formCard}>
              <div className={styles.formSectionTitle}>Account</div>
              <p style={{ fontSize: "0.85rem", lineHeight: 1.8, margin: 0 }}>
                {order.profiles?.full_name || "—"}
                <br />
                {order.profiles?.email || "—"}
                <br />
                {order.profiles?.phone || "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
