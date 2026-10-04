"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { media } from "@/constants/media";
import { markGoHomeTop, scrollPageToTop } from "@/lib/goHome";
import styles from "./Footer.module.css";

export default function Footer({ flush = false }) {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const validateEmail = (val) => {
    const clean = val.trim().toLowerCase();
    
    // Standard format check
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!regex.test(clean)) {
      return { valid: false, error: "Please enter a valid email address (e.g. name@example.com)." };
    }

    // Catch popular email provider domain typos (like gmail.co instead of gmail.com)
    const domain = clean.split("@")[1];
    if (domain === "gmail.co" || domain === "gmail.c" || domain === "gmai.com" || domain === "gmal.com") {
      return { valid: false, error: "Did you mean @gmail.com? Please check your email domain." };
    }
    if (domain === "yahoo.co" || domain === "yaho.com") {
      return { valid: false, error: "Did you mean @yahoo.com? Please check your email domain." };
    }
    if (domain === "hotmail.co") {
      return { valid: false, error: "Did you mean @hotmail.com? Please check your email domain." };
    }

    return { valid: true };
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg("Please enter an email address.");
      return;
    }
    
    const check = validateEmail(cleanEmail);
    if (!check.valid) {
      setErrorMsg(check.error);
      return;
    }

    setErrorMsg("");
    setSubscribed(true);
    setEmail("");
  };

  const isFlush = flush || pathname === "/" || pathname === "/about" || pathname === "/cart";

  return (
    <footer
      className={`${styles.footer}${isFlush ? ` ${styles.footerFlush}` : ""}`}
    >
      <div className={`container ${styles.inner}`}>
        <div className={styles.grid}>
          {/* Brand Col */}
          <div className={styles.brandCol}>
            <Link
              href="/"
              className={styles.logoLink}
              aria-label="Furnish home"
              onClick={(e) => {
                e.preventDefault();
                if (e.currentTarget instanceof HTMLElement) {
                  e.currentTarget.blur();
                }
                if (pathname === "/") {
                  scrollPageToTop();
                  return;
                }
                markGoHomeTop();
                router.push("/");
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={media.logo} alt="Furnish Logo" className={styles.logoImage} />
            </Link>
            <p className={styles.description}>
              Discover the warmth and beauty of sustainable wooden kitchenware. Handcrafted with love and care, our exquisite Acacia and Mango wood chopping boards, platters, and organizers are perfect for elevating your culinary experience.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
              <a
                href="https://wa.me/916375549637?text=Hi%20Furnis%2C%20I%20have%20an%20inquiry%20regarding%20your%20products"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contact}
                style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <span>WhatsApp:</span> +91 6375549637
              </a>
              <a
                href="https://www.instagram.com/furnis.in/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contact}
                style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <span>Instagram:</span> @furnis.in
              </a>
            </div>
          </div>

          {/* Directory Links */}
          <div className={`${styles.linksCol} ${styles.menuCol}`}>
            <h4 className={styles.title}>Menu</h4>
            <ul className={styles.list}>
              <li>
                <Link
                  href="/"
                  scroll={false}
                  onClick={(e) => {
                    e.preventDefault();
                    if (pathname === "/") {
                      scrollPageToTop();
                      return;
                    }
                    markGoHomeTop();
                    router.push("/");
                  }}
                >
                  Home
                </Link>
              </li>
              <li><Link href="/shop">Shop All</Link></li>
              <li><Link href="/about">Our Story</Link></li>
              <li><Link href="/contact">Get in Touch</Link></li>
            </ul>
          </div>

          {/* Collections Links */}
          <div className={`${styles.linksCol} ${styles.collectionsCol}`}>
            <h4 className={styles.title}>Collections</h4>
            <ul className={styles.list}>
              <li><Link href="/shop?category=chopping-boards">Chopping Boards</Link></li>
              <li><Link href="/shop?category=serving-trays">Serving Platters</Link></li>
              <li><Link href="/shop?category=kitchen-organizers">Kitchen Organizers</Link></li>
              <li><Link href="/shop?category=tableware-living">Tableware &amp; Sofa Accents</Link></li>
            </ul>
          </div>

          {/* Newsletter Col */}
          <div className={styles.newsletterCol}>
            <h4 className={styles.title}>Stay Updated</h4>

            <div className={styles.socials} aria-label="Social media">
              <a
                href="https://www.instagram.com/furnis.in/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Instagram @furnis.in"
                title="Follow us on Instagram @furnis.in"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a
                href="https://wa.me/916375549637?text=Hi%20Furnis%2C%20I%20have%20an%20inquiry%20regarding%20your%20products"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="WhatsApp +91 6375549637"
                title="Connect on WhatsApp +91 6375549637"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12.04 2C6.58 2 2.15 6.4 2.15 11.84c0 1.99.59 3.84 1.6 5.4L2 22l4.92-1.68a9.86 9.86 0 0 0 5.12 1.42h.01c5.46 0 9.89-4.4 9.89-9.84C21.94 6.4 17.5 2 12.04 2zm5.52 14.12c-.23.64-1.33 1.18-1.86 1.25-.48.07-1.09.1-1.76-.11-.41-.12-.93-.28-1.6-.55-2.82-1.22-4.65-4.06-4.79-4.25-.14-.19-1.15-1.53-1.15-2.92 0-1.39.73-2.07.99-2.36.26-.29.57-.36.76-.36h.55c.17 0 .41-.07.64.49.23.57.79 1.97.86 2.11.07.14.12.31.02.5-.1.19-.14.31-.29.48-.14.17-.31.38-.44.51-.14.14-.29.29-.12.57.17.28.74 1.22 1.59 1.98 1.09.97 2.01 1.27 2.29 1.41.29.14.45.12.62-.07.17-.19.71-.83.9-1.11.19-.29.38-.24.64-.14.26.1 1.65.78 1.93.92.29.14.48.21.55.33.07.12.07.69-.16 1.33z" />
                </svg>
              </a>
            </div>

            <p className={styles.newsletterDesc}>
              Sign up to get early access to new collections, exclusive offers, and artisan design stories.
            </p>
            {subscribed ? (
              <p className={styles.successMsg}>Thank you. You have been added to our journals.</p>
            ) : (
              <div>
                <form onSubmit={handleSubscribe} className={styles.form}>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    className={`${styles.input} ${errorMsg ? styles.inputError : ""}`}
                    required
                    autoComplete="email"
                    suppressHydrationWarning
                  />
                  <button
                    type="submit"
                    className={styles.submitBtn}
                    aria-label="Sign up"
                    suppressHydrationWarning
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                </form>
                {errorMsg && <p className={styles.errorMsg}>{errorMsg}</p>}
              </div>
            )}
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} Furnis. All rights reserved.
          </p>
          <div className={styles.legal}>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <span className={styles.separator}>|</span>
            <Link href="/terms-of-service">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
