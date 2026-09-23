"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import styles from "../login/login.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
      }
    );

    setIsLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSent(true);
  };

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
                <Link href="/auth/login" className={styles.switchLink}>
                  Back to sign in
                </Link>
              </p>
            </>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              {error && <p className={styles.errorMsg}>{error}</p>}

              <div className="form-group">
                <label className="form-label">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send reset link"}
              </button>
            </form>
          )}

          {!sent && (
            <p className={styles.switchText}>
              Remembered it?{" "}
              <Link href="/auth/login" className={styles.switchLink}>
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
