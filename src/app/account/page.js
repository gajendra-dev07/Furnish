import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import styles from "./account.module.css";

export default async function AccountOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { count: orderCount }, { count: addressCount }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("addresses")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

  const displayName =
    profile?.full_name || user.email?.split("@")[0] || "there";

  return (
    <>
      <h1 className={styles.pageTitle}>Welcome back, {displayName}</h1>
      <p className={styles.pageSub}>
        Manage your orders, addresses, and account details.
      </p>

      {/* Quick stats */}
      <div className={styles.statsRow}>
        <Link href="/account/orders" className={styles.statCard}>
          <p className={styles.statLabel}>Orders</p>
          <p className={styles.statValue}>{orderCount ?? 0}</p>
        </Link>
        <Link href="/account/addresses" className={styles.statCard}>
          <p className={styles.statLabel}>Saved Addresses</p>
          <p className={styles.statValue}>{addressCount ?? 0}</p>
        </Link>
      </div>

      {/* Quick links */}
      <div className={styles.card}>
        <p className={styles.cardTitle}>Quick Actions</p>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link href="/shop" className={styles.btnPrimary}>
            Continue Shopping
          </Link>
          <Link href="/account/addresses" className={styles.btnSecondary}>
            Manage Addresses
          </Link>
          <Link href="/account/profile" className={styles.btnSecondary}>
            Edit Profile
          </Link>
        </div>
      </div>
    </>
  );
}
