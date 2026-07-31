import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Header from "@/components/layout/Header";
import AccountSidebar from "./AccountSidebar";
import styles from "./account.module.css";

export const metadata = {
  title: "My Account | Furnish",
};

export default async function AccountLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/account");
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
