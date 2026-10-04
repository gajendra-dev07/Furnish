"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, validation } from "@/lib/auth/authService";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import styles from "@/app/account/(auth)/auth.module.css";

// ─── form (needs Suspense for useSearchParams) ───────────────────────────────

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(urlError || "");
  const [isLoading, setIsLoading] = useState(false);

  function validate() {
    const errs = {};
    const emailErr = validation.email(email);
    const passErr = validation.password(password);
    if (emailErr) errs.email = emailErr;
    if (passErr) errs.password = passErr;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;

    setIsLoading(true);
    try {
      const { redirect } = await signIn(email, password, next);
      window.location.href = redirect;
    } catch (err) {
      setFormError(err.message);
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.heading}>
        <p className={styles.badge}>Welcome back</p>
        <h1 className={styles.title}>Sign in to Furnis</h1>
        <p className={styles.subtitle}>
          Access your orders, saved addresses, and wishlist.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {formError && <p className={styles.errorMsg}>{formError}</p>}

        <div className="form-group">
          <label className="form-label" htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: "" })); }}
            className="form-input"
            placeholder="you@example.com"
            autoComplete="email"
            disabled={isLoading}
          />
          {errors.email && <p className={styles.errorMsg}>{errors.email}</p>}
        </div>

        <div className="form-group">
          <div className={styles.passwordRow}>
            <label className="form-label" htmlFor="login-password">Password</label>
            <Link href="/account/forgot-password" className={styles.forgotLink}>
              Forgot password?
            </Link>
          </div>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: "" })); }}
            className="form-input"
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={isLoading}
          />
          {errors.password && <p className={styles.errorMsg}>{errors.password}</p>}
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isLoading}
        >
          {isLoading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className={styles.switchText}>
        Don&apos;t have an account?{" "}
        <Link href="/account/register" className={styles.switchLink}>
          Create account
        </Link>
      </p>
    </div>
  );
}

// ─── page ────────────────────────────────────────────────────────────────────

export default function AccountLoginPage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <Suspense fallback={<div className={styles.card} />}>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
