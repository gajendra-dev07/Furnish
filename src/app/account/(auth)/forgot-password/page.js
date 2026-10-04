"use client";

import React, { useState } from "react";
import Link from "next/link";
import { sendPasswordReset, validation } from "@/lib/auth/authService";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import styles from "@/app/account/(auth)/auth.module.css";

export default function AccountForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [formError, setFormError] = useState("");
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    const err = validation.email(email);
    if (err) { setEmailError(err); return; }
    setEmailError("");

    setIsLoading(true);
    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch (err) {
      setFormError(err.message);
      setIsLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.heading}>
            <p className={styles.badge}>Account</p>
            <h1 className={styles.title}>Reset your password</h1>
            <p className={styles.subtitle}>
              Enter your email and we&apos;ll send a reset link.
            </p>
          </div>

          {sent ? (
            <>
              <p className={styles.successMsg}>
                If an account exists for <strong>{email.trim()}</strong>, a
                reset link is on the way. Check your inbox (and spam).
              </p>
              <p className={styles.switchText} style={{ marginTop: "1.25rem" }}>
                <Link href="/account/login" className={styles.switchLink}>
                  Back to sign in
                </Link>
              </p>
            </>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              {formError && <p className={styles.errorMsg}>{formError}</p>}

              <div className="form-group">
                <label className="form-label" htmlFor="forgot-email">Email address</label>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                  className="form-input"
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={isLoading}
                />
                {emailError && <p className={styles.errorMsg}>{emailError}</p>}
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isLoading}
              >
                {isLoading ? "Sending…" : "Send reset link"}
              </button>
            </form>
          )}

          {!sent && (
            <p className={styles.switchText}>
              Remembered it?{" "}
              <Link href="/account/login" className={styles.switchLink}>
                Sign in
              </Link>
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
