import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
import styles from "./admin.module.css";

export const metadata = {
  title: "Admin Panel | Furnish",
};

export default async function AdminLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  return (
    <div className={styles.shell}>
      <AdminSidebar />
      <div className={styles.main}>{children}</div>
    </div>
  );
}
