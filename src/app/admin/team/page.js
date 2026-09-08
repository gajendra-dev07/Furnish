import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import TeamManager from "./TeamManager";
import styles from "../admin.module.css";

export const metadata = { title: "Team | Admin – Furnish" };

export default async function AdminTeamPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();
  const { data: people, error } = await admin
    .from("profiles")
    .select("id, full_name, email, phone, role, created_at")
    .order("created_at", { ascending: false });

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Team</h1>
          <p className={styles.pageSub}>
            Who can sign in to this admin panel.
          </p>
        </div>
      </div>

      <div className={styles.pageContent}>
        {error ? (
          <div className={styles.formError}>
            Could not load team: {error.message}
          </div>
        ) : (
          <TeamManager people={people ?? []} currentUserId={user?.id} />
        )}
      </div>
    </>
  );
}
