import { createAdminClient } from "@/lib/supabase/admin";
import styles from "../admin.module.css";

export const metadata = { title: "Customers | Admin – Furnish" };

export default async function AdminCustomersPage() {
  const admin = createAdminClient();

  const { data: customers } = await admin
    .from("profiles")
    .select("id, full_name, email, phone, created_at, role")
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Customers</h1>
          <p className={styles.pageSub}>
            {customers?.length ?? 0} registered customer
            {customers?.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className={styles.pageContent}>
        <div className={styles.tableCard}>
          {!customers?.length ? (
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p className={styles.emptyStateTitle}>No customers yet</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className={styles.productName}>
                        {c.full_name || "—"}
                      </div>
                    </td>
                    <td>{c.email || "—"}</td>
                    <td>{c.phone || "—"}</td>
                    <td>
                      {new Date(c.created_at).toLocaleDateString("en-GB", {
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
