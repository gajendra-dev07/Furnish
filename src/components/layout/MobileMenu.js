"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./MobileMenu.module.css";

export default function MobileMenu({ isOpen, onClose, links }) {
  const pathname = usePathname();

  // Prevent scroll when menu is open
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

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.logo}>AURA</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close menu">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className={styles.nav}>
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${isActive ? styles.activeLink : ""}`}
                onClick={onClose}
              >
                {link.label}
              </Link>
            );
          })}
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
