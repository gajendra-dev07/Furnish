import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Header from "@/components/layout/Header";
import AccountSidebar from "@/app/account/AccountSidebar";
import styles from "@/app/account/account.module.css";

export const metadata = {
  title: "My Account | Furnis",
};

export default async function DashboardLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/account/login?next=/account");
  }

  return (
    <>
      <Header />
      <div className={styles.shell}>
        <AccountSidebar />
        <main className={styles.main}>{children}</main>
      </div>
    </>
  );
}
