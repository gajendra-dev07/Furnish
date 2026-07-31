import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import styles from "./admin.module.css";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: totalProducts },
    { count: activeProducts },
    { count: totalCustomers },
    { count: totalOrders },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer"),
    supabase.from("orders").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    {
      label: "Total Products",
      value: totalProducts ?? 0,
      hint: `${activeProducts ?? 0} active`,
      href: "/admin/products",
    },
    {
      label: "Customers",
      value: totalCustomers ?? 0,
      hint: "registered accounts",
      href: "/admin/customers",
    },
    {
      label: "Orders",
      value: totalOrders ?? 0,
      hint: "all time",
      href: "/admin/orders",
    },
  ];

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageSub}>Welcome back. Here's what's happening.</p>
        </div>
      </div>

      <div className={styles.pageContent}>
        <div className={styles.statsGrid}>
          {stats.map((s) => (
            <Link key={s.label} href={s.href} style={{ textDecoration: "none" }}>
              <div className={styles.statCard}>
                <p className={styles.statLabel}>{s.label}</p>
                <p className={styles.statValue}>{s.value}</p>
                <p className={styles.statHint}>{s.hint}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick links */}
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>Quick Actions</h2>
          </div>
          <div style={{ padding: "16px 20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Link href="/admin/products/new" className={styles.btnPrimary}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add New Product
            </Link>
            <Link href="/admin/products" className={styles.btnSecondary}>
              Manage Products
            </Link>
            <Link href="/admin/customers" className={styles.btnSecondary}>
              View Customers
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
