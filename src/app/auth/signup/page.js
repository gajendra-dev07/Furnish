"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import styles from "./signup.module.css";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    setIsSuccess(true);
    setIsLoading(false);
  };

  if (isSuccess) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div className={styles.card}>
            <div className={styles.successIcon}>
              <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h2 className={styles.title}>Check your email</h2>
            <p className={styles.subtitle}>
              We sent a confirmation link to <strong>{email}</strong>. Click it
              to activate your account and start shopping.
            </p>
            <Link href="/auth/login" className={styles.backLink}>
              Back to sign in
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.heading}>
            <p className={styles.badge}>New account</p>
            <h1 className={styles.title}>Create your account</h1>
            <p className={styles.subtitle}>
              Join Furnish to track orders, save favourites, and checkout faster.
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <p className={styles.errorMsg}>{error}</p>}

            <div className="form-group">
              <label className="form-label">Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="form-input"
                placeholder="Jane Smith"
                required
                autoComplete="name"
              />
            </div>

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

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="At least 8 characters"
                required
                autoComplete="new-password"
                minLength={8}
              />
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className={styles.switchText}>
            Already have an account?{" "}
            <Link href="/auth/login" className={styles.switchLink}>
              Sign in
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
