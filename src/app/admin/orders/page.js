import { createAdminClient } from "@/lib/supabase/admin";
import styles from "../admin.module.css";

export const metadata = { title: "Orders | Admin – Furnish" };

export default async function AdminOrdersPage() {
  const admin = createAdminClient();

  const { data: orders } = await admin
    .from("orders")
    .select(
      `
      id, status, total, created_at,
      profiles(full_name, email)
    `
    )
    .order("created_at", { ascending: false });

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Orders</h1>
          <p className={styles.pageSub}>
            {orders?.length ?? 0} order{orders?.length !== 1 ? "s" : ""} total
          </p>
        </div>
      </div>

      <div className={styles.pageContent}>
        <div className={styles.tableCard}>
          {!orders?.length ? (
            <div className={styles.emptyState}>
              <svg
                width="48"
                height="48"
                fill="none"
                stroke="#d1d5db"
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
                Orders will appear here once Razorpay is connected.
              </p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <span style={{ fontFamily: "monospace", fontSize: "0.78rem" }}>
                        {order.id.slice(0, 8)}…
                      </span>
                    </td>
                    <td>
                      <div className={styles.productName}>
                        {order.profiles?.full_name || "—"}
                      </div>
                      <div className={styles.productSlug}>
                        {order.profiles?.email || ""}
                      </div>
                    </td>
                    <td>₹{Number(order.total).toLocaleString("en-IN")}</td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          order.status === "delivered"
                            ? styles.badgeGreen
                            : order.status === "cancelled"
                            ? styles.badgeRed
                            : styles.badgeAmber
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
      </div>
    </>
  );
}
