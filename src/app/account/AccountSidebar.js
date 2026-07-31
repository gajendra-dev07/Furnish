"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/store/AuthContext";
import styles from "./account.module.css";

const navItems = [
  {
    href: "/account",
    label: "Overview",
    icon: (
      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/account/orders",
    label: "My Orders",
    icon: (
      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    href: "/account/addresses",
    label: "Addresses",
    icon: (
      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: "/account/profile",
    label: "Profile Settings",
    icon: (
      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();

  function isActive(href) {
    if (href === "/account") return pathname === "/account";
    return pathname.startsWith(href);
  }

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarUser}>
        <p className={styles.sidebarUserName}>
          {profile?.full_name || user?.email?.split("@")[0] || "My Account"}
        </p>
        <p className={styles.sidebarUserEmail}>{user?.email}</p>
      </div>

      <nav>
        <ul className={styles.sidebarNav}>
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`${styles.navItem} ${isActive(item.href) ? styles.navItemActive : ""}`}
              >
                {item.icon}
                {item.label}
              </Link>
            </li>
          ))}

          <div className={styles.navDivider} />

          <li>
            <button className={styles.signOutBtn} onClick={handleSignOut}>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
