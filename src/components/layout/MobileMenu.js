"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { media } from "@/constants/media";
import { contactEmail } from "@/constants/contact";
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

  const accountHref = user ? "/account" : "/account/login";
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

  const isLinkActive = (href, label) => {
    // 1. Home
    if (href === "/") {
      return pathname === "/";
    }

    // 2. Wishlist: /shop?filter=wishlist
    if (label === "Wishlist" || href.includes("filter=wishlist")) {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        return pathname === "/shop" && params.get("filter") === "wishlist";
      }
      return false;
    }

    // 3. Cart & Checkout: /cart, /checkout
    if (href === "/cart" || label === "Cart") {
      return pathname === "/cart" || pathname.startsWith("/cart/") || pathname.startsWith("/checkout");
    }

    // 4. Account / Auth: /account, /account/login, /auth, etc.
    if (href.startsWith("/account") || label === "Sign In" || label === "My Account") {
      return pathname.startsWith("/account") || pathname.startsWith("/auth");
    }

    // 5. Shop: /shop, /products, /categories (excluding wishlist)
    if (href === "/shop" || label === "Shop") {
      const isWishlist = typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("filter") === "wishlist"
        : false;
      if (isWishlist) return false;
      return (
        pathname === "/shop" ||
        pathname.startsWith("/shop/") ||
        pathname.startsWith("/products") ||
        pathname.startsWith("/categories")
      );
    }

    // 6. About
    if (href === "/about" || label === "About") {
      return pathname === "/about" || pathname.startsWith("/about/");
    }

    // 7. Contact
    if (href === "/contact" || label === "Contact") {
      return pathname === "/contact" || pathname.startsWith("/contact/");
    }

    return pathname === href;
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
            const isActive = isLinkActive(link.href, link.label);
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

          {extraLinks.map((link) => {
            const isActive = isLinkActive(link.href, link.label);
            return (
              <Link
                key={link.href + link.label}
                href={link.href}
                className={`${styles.navLink} ${isActive ? styles.activeLink : ""}`}
                onClick={onClose}
              >
                <span>{link.label}</span>
                {link.badge > 0 && (
                  <span className={styles.navBadge}>{link.badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className={styles.footer}>
          <p className={styles.tagline}>Curating spaces for refined living.</p>
          <div className={styles.divider}></div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>
            <a
              href="https://wa.me/916375549637?text=Hi%20Furnis%2C%20I%20have%20an%20inquiry%20regarding%20your%20products"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--color-primary)", textDecoration: "none", fontSize: "0.8125rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <span style={{ fontWeight: 600, color: "var(--color-accent)" }}>WhatsApp:</span> +91 6375549637
            </a>
            <a
              href="https://www.instagram.com/furnis.in/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--color-primary)", textDecoration: "none", fontSize: "0.8125rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <span style={{ fontWeight: 600, color: "var(--color-accent)" }}>Instagram:</span> @furnis.in
            </a>
            <a
              href={`mailto:${contactEmail}`}
              style={{ color: "var(--color-primary)", textDecoration: "none", fontSize: "0.8125rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <span style={{ fontWeight: 600, color: "var(--color-accent)" }}>Email:</span> {contactEmail}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
