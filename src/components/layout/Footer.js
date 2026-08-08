"use client";

import React, { useState } from "react";
import Link from "next/link";
import { media } from "@/constants/media";
import styles from "./Footer.module.css";

export default function Footer() {
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

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.container}`}>
        <div className={styles.grid}>
          {/* Brand Col */}
          <div className={styles.brandCol}>
            <Link href="/" className={styles.logoLink}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={media.logo} alt="Furnish Logo" className={styles.logoImage} />
            </Link>
            <p className={styles.description}>
              Discover the warmth and beauty of sustainable wooden kitchenware. Handcrafted with love and care, our exquisite Acacia and Mango wood chopping boards, platters, and organizers are perfect for elevating your culinary experience.
            </p>
          </div>

          {/* Directory Links */}
          <div className={styles.linksCol}>
            <h4 className={styles.title}>Menu</h4>
            <ul className={styles.list}>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/shop">Shop All</Link></li>
              <li><Link href="/about">Our Story</Link></li>
              <li><Link href="/contact">Get in Touch</Link></li>
            </ul>
          </div>

          {/* Collections Links */}
          <div className={styles.linksCol}>
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
                  />
                  <button type="submit" className={styles.submitBtn} aria-label="Sign up">
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
            &copy; {new Date().getFullYear()} Furnish. All rights reserved.
          </p>
          <div className={styles.legal}>
            <Link href="#">Privacy Policy</Link>
            <span className={styles.separator}>|</span>
            <Link href="#">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
