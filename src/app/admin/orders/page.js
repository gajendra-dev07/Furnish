import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import styles from "../admin.module.css";

export const metadata = { title: "Orders | Admin – Furnish" };

const BADGE = {
  delivered: styles.badgeGreen,
  confirmed: styles.badgeGreen,
  shipped: styles.badgeAmber,
  processing: styles.badgeAmber,
  pending: styles.badgeGrey,
  cancelled: styles.badgeRed,
};

export default async function AdminOrdersPage() {
  const admin = createAdminClient();

  const { data: orders, error } = await admin
    .from("orders")
    .select(
      `
      id, status, total, created_at, needs_review,
      profiles(full_name, email)
    `
    )
    .order("created_at", { ascending: false });

  const paidCount = (orders || []).filter((o) => o.status !== "pending").length;
  const reviewCount = (orders || []).filter((o) => o.needs_review).length;

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Orders</h1>
          <p className={styles.pageSub}>
            {paidCount} paid order{paidCount !== 1 ? "s" : ""}
            {reviewCount > 0 ? ` · ${reviewCount} need review` : ""}
          </p>
        </div>
      </div>

      <div className={styles.pageContent}>
        {error && (
          <div className={styles.formError} style={{ marginBottom: "16px" }}>
            Could not load orders: {error.message}
          </div>
        )}

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
                Orders appear here as soon as a customer completes checkout.
              </p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <span style={{ fontFamily: "monospace", fontSize: "0.78rem" }}>
                        {order.id.slice(0, 8).toUpperCase()}
                      </span>
                      {order.needs_review && (
                        <span
                          className={`${styles.badge} ${styles.badgeRed}`}
                          style={{ marginLeft: "8px" }}
                        >
                          review
                        </span>
                      )}
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
                          BADGE[order.status] || styles.badgeGrey
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
                    <td>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className={styles.btnSecondary}
                      >
                        Open
                      </Link>
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
