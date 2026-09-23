"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { media } from "@/constants/media";
import { markGoHomeTop, scrollPageToTop } from "@/lib/goHome";
import styles from "./MobileMenu.module.css";

export default function MobileMenu({
  isOpen,
  onClose,
  links,
  user,
  cartCount = 0,
  wishlistCount = 0,
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const accountHref = user ? "/account" : "/auth/login";
  const accountLabel = user ? "My Account" : "Sign In";

  const extraLinks = [
    { label: "Wishlist", href: "/shop?filter=wishlist", badge: wishlistCount },
    { label: accountLabel, href: accountHref, badge: 0 },
    { label: "Cart", href: "/cart", badge: cartCount },
  ];

  const goHome = (e) => {
    e.preventDefault();
    onClose();
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.blur();
    }
    if (pathname === "/") {
      scrollPageToTop();
      return;
    }
    markGoHomeTop();
    router.push("/");
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <Link
            href="/"
            className={styles.logoLink}
            aria-label="Furnish home"
            onClick={goHome}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={media.logo} alt="Furnish Logo" className={styles.logoImage} />
          </Link>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close menu">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className={styles.nav}>
          {links.map((link) => {
            const isActive = pathname === link.href;
            const isHome = link.href === "/";
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${isActive ? styles.activeLink : ""}`}
                onClick={isHome ? goHome : onClose}
                scroll={!isHome}
              >
                {link.label}
              </Link>
            );
          })}

          {extraLinks.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className={styles.navLink}
                onClick={onClose}
              >
                <span>{link.label}</span>
                {link.badge > 0 && (
                  <span className={styles.navBadge}>{link.badge}</span>
                )}
              </Link>
            ))}
        </nav>

        <div className={styles.footer}>
          <p className={styles.tagline}>Curating spaces for refined living.</p>
          <div className={styles.divider}></div>
          <p className={styles.contact}>support@furnish-aura.com</p>
        </div>
      </div>
    </div>
  );
}
