"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/store/CartContext";
import { useAuth } from "@/store/AuthContext";
import MobileMenu from "./MobileMenu";
import { media } from "@/constants/media";
import { markGoHomeTop, consumeGoHomeTop, scrollPageToTop } from "@/lib/goHome";
import styles from "./Header.module.css";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, wishlist } = useCart();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pendingHomeTop = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // After any Home / logo navigation, always land at the top (never footer)
  useEffect(() => {
    if (pathname !== "/") return;
    const fromHomeNav = pendingHomeTop.current || consumeGoHomeTop();
    if (!fromHomeNav) return;
    pendingHomeTop.current = false;
    scrollPageToTop();
    requestAnimationFrame(scrollPageToTop);
    const t1 = setTimeout(scrollPageToTop, 0);
    const t2 = setTimeout(scrollPageToTop, 50);
    const t3 = setTimeout(scrollPageToTop, 150);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const goHome = (e) => {
    e.preventDefault();
    setIsSearchOpen(false);
    setSearchQuery("");
    setIsMobileMenuOpen(false);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.blur();
    }

    if (pathname === "/") {
      scrollPageToTop();
      return;
    }

    pendingHomeTop.current = true;
    markGoHomeTop();
    router.push("/");
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  const headerClass = `${styles.header} ${isScrolled ? styles.scrolled : ""}`;

  return (
    <>
      <header className={headerClass}>
        <div className={styles.container}>
          <Link href="/" className={styles.logoLink} onClick={goHome} aria-label="Furnish home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={media.logo} alt="Furnish Logo" className={styles.logoImage} />
          </Link>

          <nav className={styles.desktopNav}>
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const isHome = link.href === "/";
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${styles.navLink} ${isActive ? styles.activeLink : ""}`}
                  onClick={isHome ? goHome : undefined}
                  scroll={!isHome}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className={styles.actions}>
            {/* Desktop only — these move into the hamburger menu on mobile/tablet */}
            <Link
              href="/shop?filter=wishlist"
              className={`${styles.iconBtn} ${styles.desktopOnlyAction}`}
              aria-label="Wishlist"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              {wishlist?.length > 0 && <span className={styles.badge}>{wishlist.length}</span>}
            </Link>

            {/* Search stays in the header on all sizes */}
            <button
              className={styles.iconBtn}
              aria-label="Search"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              suppressHydrationWarning
            >
              {isSearchOpen ? (
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              )}
            </button>

            <Link
              href={user ? "/account" : "/auth/login"}
              className={`${styles.iconBtn} ${styles.desktopOnlyAction}`}
              aria-label={user ? "My account" : "Sign in"}
              suppressHydrationWarning
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              {user && <span className={styles.badge} style={{ background: "var(--color-accent)" }}>•</span>}
            </Link>

            <Link
              href="/cart"
              className={`${styles.iconBtn} ${styles.desktopOnlyAction}`}
              aria-label="Cart"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
            </Link>

            <button
              className={styles.mobileMenuBtn}
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
              suppressHydrationWarning
            >
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
        </div>

        {isSearchOpen && (
          <div className={styles.searchDropdown}>
            <div className={styles.searchContainer}>
              <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
                <input
                  type="text"
                  placeholder="Search premium pieces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                  autoFocus
                />
                <button type="submit" className={styles.searchSubmitBtn}>
                  Search
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        links={navLinks}
        user={user}
        cartCount={cartCount}
        wishlistCount={wishlist?.length || 0}
      />
    </>
  );
}
