import { createClient } from "@/lib/supabase/server";
import styles from "@/app/account/account.module.css";

export const metadata = { title: "My Orders | Furnis" };

const STATUS_STYLE = {
  delivered: styles.badgeGreen,
  confirmed: styles.badgeGreen,
  shipped: styles.badgeAmber,
  processing: styles.badgeAmber,
  pending: styles.badgeGrey,
  cancelled: styles.badgeRed,
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: orders } = await supabase
    .from("orders")
    .select(
      `
      id, status, subtotal, gst_amount, total, created_at,
      order_items(id, quantity, unit_price, products(name, slug))
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <h1 className={styles.pageTitle}>My Orders</h1>
      <p className={styles.pageSub}>
        {orders?.length
          ? `${orders.length} order${orders.length !== 1 ? "s" : ""} placed`
          : "Your order history will appear here."}
      </p>

      <div className={styles.card}>
        {!orders?.length ? (
          <div className={styles.emptyState}>
            <svg
              width="48"
              height="48"
              fill="none"
              stroke="#d1c4b8"
              strokeWidth="1"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className={styles.emptyStateTitle}>No orders yet</p>
            <p style={{ fontSize: "0.82rem", color: "#9ca3af", marginTop: "4px" }}>
              When you place an order, it will show up here.
            </p>
          </div>
        ) : (
          <table className={styles.ordersTable}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <span
                      style={{ fontFamily: "monospace", fontSize: "0.78rem" }}
                    >
                      FURNISH-{order.id.slice(0, 8).toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {(order.order_items || []).map((item) => (
                      <div key={item.id} style={{ fontSize: "0.8rem" }}>
                        {item.products?.name} × {item.quantity}
                      </div>
                    ))}
                  </td>
                  <td>₹{Number(order.total).toLocaleString("en-IN")}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        STATUS_STYLE[order.status] || styles.badgeGrey
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>
                    {new Date(order.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
